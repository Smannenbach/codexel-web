/**
 * Factory Routes — Phase 2
 * API endpoints for the Site Factory Engine:
 *  POST /api/factory/analyze        — analyze a domain (no DB write)
 *  POST /api/factory/create         — create one site from domain
 *  POST /api/factory/batch          — bulk create sites (SSE stream)
 *  GET  /api/factory/sites          — list user's factory-created sites
 *  POST /api/factory/preview-content — preview generated content for a domain
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { sites } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../auth';
import {
  batchDeployDomains,
  createSiteFromDomain,
  getSitesSummary,
  parseDomainList as parseList,
} from '../services/site-factory';
import { analyzeDomain, generateSiteContent } from '../services/mortgage-content-engine';

const router = Router();

// ── Analyze domain (no DB write) ─────────────────────────────────────────────
router.post('/analyze', async (req: Request, res: Response) => {
  const schema = z.object({ domain: z.string().min(3) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'domain is required' });

  const analysis = analyzeDomain(parsed.data.domain);
  res.json({ success: true, analysis });
});

// ── Preview content for a domain (no DB write) ───────────────────────────────
router.post('/preview-content', async (req: Request, res: Response) => {
  const schema = z.object({ domain: z.string().min(3) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'domain is required' });

  const analysis = analyzeDomain(parsed.data.domain);
  const content = await generateSiteContent(analysis);
  res.json({ success: true, analysis, content });
});

// ── Create single site from domain ───────────────────────────────────────────
router.post('/create', isAuthenticated, async (req: Request, res: Response) => {
  const schema = z.object({
    domain: z.string().min(3),
    overrideTemplate: z.string().optional(),
    skipIfExists: z.boolean().default(true),
    generateAIContent: z.boolean().default(true),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = (req as any).user?.id || (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const result = await createSiteFromDomain(parsed.data.domain, {
    userId,
    overrideTemplate: parsed.data.overrideTemplate,
    skipIfExists: parsed.data.skipIfExists,
    generateAIContent: parsed.data.generateAIContent,
  });

  if (!result.success && result.error !== 'already_exists') {
    return res.status(500).json({ error: result.error, domain: result.domain });
  }

  res.json({ success: true, result });
});

// ── Batch create via SSE stream ───────────────────────────────────────────────
// Streams progress as `data: <json>\n\n` (Server-Sent Events)
router.post('/batch', isAuthenticated, async (req: Request, res: Response) => {
  const schema = z.object({
    domains: z.union([
      z.array(z.string()),
      z.string(), // raw newline-separated text
    ]),
    overrideTemplate: z.string().optional(),
    generateAIContent: z.boolean().default(false), // default false for speed in bulk
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const userId = (req as any).user?.id || (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const domains = Array.isArray(parsed.data.domains)
    ? parsed.data.domains
    : parseList(parsed.data.domains);

  if (domains.length === 0) return res.status(400).json({ error: 'No valid domains found' });
  if (domains.length > 300) return res.status(400).json({ error: 'Max 300 domains per batch' });

  // Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if ((res as any).flush) (res as any).flush();
  };

  send({ type: 'start', total: domains.length });

  await batchDeployDomains(
    domains,
    {
      userId,
      skipIfExists: true,
      generateAIContent: parsed.data.generateAIContent,
      overrideTemplate: parsed.data.overrideTemplate,
    },
    (progress) => {
      send({ type: 'progress', ...progress });
    }
  );

  send({ type: 'complete' });
  res.end();
});

// ── List all factory-created sites for current user ───────────────────────────
router.get('/sites', isAuthenticated, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const siteList = await getSitesSummary(userId);
  res.json({ success: true, sites: siteList, count: siteList.length });
});

// ── Global Command Broadcast ────────────────────────────────────────────────
router.post('/broadcast', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      instruction: z.string(),
      scope: z.string(),
      userId: z.string(),
    });
    
    const { instruction, scope, userId } = schema.parse(req.body);
    
    // 1. Fetch sites based on scope
    let query = db.select().from(sites).where(eq(sites.userId, userId));
    
    // Filter by scope
    const allSites = await query;
    let targetSites = allSites;
    
    if (scope === 'wave1') {
      targetSites = allSites.filter((s: any) => (s.metaData as any)?.wave === 1 || (s.metaData as any)?.niche === 'dscr');
    } else if (scope === 'texas') {
      targetSites = allSites.filter((s: any) => (s.metaData as any)?.stateCode === 'TX');
    } else if (scope !== 'all') {
      targetSites = allSites.filter((s: any) => (s.metaData as any)?.niche === scope);
    }

    if (targetSites.length === 0) {
      return res.json({ success: true, affectedCount: 0, message: 'No sites found in this scope.' });
    }

    // 2. Start background processing (don't await to avoid timeout)
    processBroadcast(targetSites, instruction);
    
    res.json({ 
      success: true, 
      affectedCount: targetSites.length,
      message: `Global instruction broadcasted to ${targetSites.length} sites. Processing in progress...` 
    });
  } catch (error: any) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function processBroadcast(targetSites: any[], instruction: string) {
  const { intelligentAIOrchestrator } = await import('../services/intelligent-ai-orchestrator');
  
  for (const site of targetSites) {
    try {
      const currentConfig = site.config as any;
      const currentContent = currentConfig?.customContent || {};
      
      const prompt = `Apply this instruction to the following website content:
      
      INSTRUCTION: "${instruction}"
      
      CURRENT CONTENT:
      ${JSON.stringify(currentContent, null, 2)}
      
      Return the updated content object in the exact same JSON format.`;
      
      const result = await intelligentAIOrchestrator.orchestrateRequest({
        message: prompt,
        taskType: 'general',
        complexity: 'low'
      });
      
      let updatedContent;
      try {
        updatedContent = JSON.parse(result.content);
      } catch {
        // Simple string replacement if AI didn't return JSON
        updatedContent = { ...currentContent, heroHeadline: instruction }; 
      }
      
      await db.update(sites)
        .set({ 
          config: { 
            ...currentConfig, 
            customContent: updatedContent 
          } as any,
          updatedAt: new Date()
        })
        .where(eq(sites.id, site.id));
        
      console.log(`[Broadcast] Updated site: ${site.domain}`);
    } catch (err) {
      console.error(`[Broadcast] Failed to update site ${site.domain}:`, err);
    }
  }
}

import { contentWorker } from '../services/content-worker';

// ... existing routes ...

router.post('/generate-content', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { siteId } = z.object({ siteId: z.number() }).parse(req.body);
    await contentWorker.queueSiteForGeneration(siteId);
    res.json({ success: true, message: 'Site queued for full content generation.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as factoryRoutes };
