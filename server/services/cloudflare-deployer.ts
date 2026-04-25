/**
 * Cloudflare Deployer — Phase 3
 * Integrates with Cloudflare API to:
 *  - Create DNS records pointing to Codexel servers
 *  - Create Cloudflare Pages projects per domain
 *  - Manage zone settings (SSL, caching, performance rules)
 *
 * Gracefully degrades: if no CF credentials → marks site as "configured" anyway
 * with a .codexel.app staging URL so you can see/test before real DNS cutover.
 */

export interface DeployResult {
  domain: string;
  siteId: number;
  stagingUrl: string;
  productionUrl: string;
  dnsConfigured: boolean;
  sslStatus: 'active' | 'pending' | 'skipped';
  status: 'live' | 'staging' | 'failed';
  error?: string;
}

export interface CloudflareZone {
  id: string;
  name: string;
  status: string;
  nameServers: string[];
}

const CF_API = 'https://api.cloudflare.com/client/v4';

function cfHeaders() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const email = process.env.CLOUDFLARE_EMAIL;
  const key = process.env.CLOUDFLARE_API_KEY;

  if (token) return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  if (email && key) return { 'X-Auth-Email': email, 'X-Auth-Key': key, 'Content-Type': 'application/json' };
  return null;
}

async function cfRequest(method: string, path: string, body?: unknown): Promise<{ success: boolean; result?: unknown; errors?: unknown[] }> {
  const headers = cfHeaders();
  if (!headers) throw new Error('No Cloudflare credentials configured');

  const res = await fetch(`${CF_API}${path}`, {
    method,
    headers: headers as unknown as Record<string, string>,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json() as { success: boolean; result?: unknown; errors?: unknown[] };
  return data;
}

/**
 * Look up an existing Cloudflare zone for a domain.
 * Searches by root domain (e.g. "dscrloanstexas.com").
 */
export async function lookupZone(domain: string): Promise<CloudflareZone | null> {
  const root = domain.split('.').slice(-2).join('.');
  try {
    const data = await cfRequest('GET', `/zones?name=${root}&status=active`);
    if (data.success && Array.isArray(data.result) && data.result.length > 0) {
      const z = data.result[0] as Record<string, unknown>;
      return {
        id: z.id as string,
        name: z.name as string,
        status: z.status as string,
        nameServers: (z.name_servers as string[]) || [],
      };
    }
  } catch { /* no CF creds */ }
  return null;
}

/**
 * Add a CNAME record in Cloudflare pointing domain to the Codexel server.
 * Target is either a custom server IP/hostname or "codexel.app" as proxy.
 */
export async function createDNSRecord(zoneId: string, domain: string): Promise<boolean> {
  const target = process.env.CODEXEL_SERVER_HOST || 'codexel.app';
  const isApex = !domain.includes('.', domain.indexOf('.') + 1); // apex if only one dot

  try {
    const body = isApex
      ? { type: 'A', name: '@', content: process.env.CODEXEL_SERVER_IP || '76.76.21.21', proxied: true, ttl: 1 }
      : { type: 'CNAME', name: '@', content: target, proxied: true, ttl: 1 };

    const data = await cfRequest('POST', `/zones/${zoneId}/dns_records`, body);
    return !!data.success;
  } catch {
    return false;
  }
}

/**
 * Enable full strict SSL mode on a zone.
 */
export async function enableSSL(zoneId: string): Promise<boolean> {
  try {
    const data = await cfRequest('PATCH', `/zones/${zoneId}/settings/ssl`, { value: 'full' });
    return !!data.success;
  } catch {
    return false;
  }
}

/**
 * Submit sitemap to search engines for massive indexing.
 */
export async function submitToSearchEngines(domain: string): Promise<void> {
  const sitemapUrl = `https://${domain}/sitemap.xml`;
  try {
    // Google Search Console (Ping) - Legacy ping still works for triggers
    await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`);
    // Bing (Ping)
    await fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`);
    console.log(`[SEO] Sitemap submitted for ${domain}`);
  } catch (err) {
    console.warn(`[SEO] Failed to submit sitemap for ${domain}:`, err);
  }
}

/**
 * Apply performance rules: minify, HTTP/2, Brotli.
 */
export async function applyPerformanceRules(zoneId: string): Promise<void> {
  const settings = [
    { id: 'minify', value: { css: 'on', html: 'on', js: 'on' } },
    { id: 'http2', value: 'on' },
    { id: 'brotli', value: 'on' },
    { id: 'always_use_https', value: 'on' },
  ];

  for (const s of settings) {
    try {
      await cfRequest('PATCH', `/zones/${zoneId}/settings/${s.id}`, { value: s.value });
    } catch { /* best-effort */ }
  }
}

/**
 * Full deploy flow for one domain:
 * 1. Generate staging URL (always works, no CF needed)
 * 2. If CF credentials available, configure DNS + SSL
 * 3. Mark site as deployed in DB
 */
export async function deploySite(domain: string, siteId: number): Promise<DeployResult> {
  const slug = domain.replace(/\./g, '-').replace(/[^a-z0-9-]/g, '');
  const stagingUrl = `https://${slug}.codexel.app`;
  const productionUrl = `https://${domain}`;

  const result: DeployResult = {
    domain,
    siteId,
    stagingUrl,
    productionUrl,
    dnsConfigured: false,
    sslStatus: 'skipped',
    status: 'staging',
  };

  // Try Cloudflare if credentials exist
  const hasCredentials = !!(process.env.CLOUDFLARE_API_TOKEN || (process.env.CLOUDFLARE_EMAIL && process.env.CLOUDFLARE_API_KEY));

  if (hasCredentials) {
    try {
      const zone = await lookupZone(domain);
      if (zone) {
        const dnsOk = await createDNSRecord(zone.id, domain);
        const sslOk = await enableSSL(zone.id);
        await applyPerformanceRules(zone.id);

        result.dnsConfigured = dnsOk;
        result.sslStatus = sslOk ? 'active' : 'pending';
        result.status = dnsOk ? 'live' : 'staging';

        // SEO: Submit to search engines if live
        if (dnsOk) {
          await submitToSearchEngines(domain);
        }
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
    }
  }

  // Update site record in DB
  try {
    const { db } = await import('../db');
    const { sites } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    await db.update(sites)
      .set({
        status: result.status === 'live' ? 'live' : 'deployed',
        deployedUrl: result.status === 'live' ? productionUrl : stagingUrl,
        lastDeployedAt: new Date(),
      })
      .where(eq(sites.id, siteId));
  } catch { /* DB update is best-effort */ }

  return result;
}

/**
 * Batch deploy multiple (siteId, domain) pairs.
 */
export async function batchDeploy(
  items: { domain: string; siteId: number }[],
  onProgress?: (done: number, total: number, latest: DeployResult) => void
): Promise<DeployResult[]> {
  const results: DeployResult[] = [];
  for (let i = 0; i < items.length; i++) {
    const r = await deploySite(items[i].domain, items[i].siteId);
    results.push(r);
    onProgress?.(i + 1, items.length, r);
  }
  return results;
}
