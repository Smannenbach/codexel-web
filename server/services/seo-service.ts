export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  canonicalUrl?: string;
  robots: string;
}

export interface KeywordCluster {
  primary: string;
  secondary: string[];
  longtail: string[];
  volume: 'high' | 'medium' | 'low';
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SEOScore {
  overall: number;
  breakdown: {
    title: number;
    metaDescription: number;
    h1: number;
    content: number;
    schema: number;
    technical: number;
  };
  recommendations: string[];
}

export interface GEOContent {
  aiSearchSummary: string;
  featuredSnippetTarget: string;
  questionsAnswered: Array<{ question: string; answer: string }>;
}

export interface SiteSEOConfig {
  metaTags: SEOMetaTags;
  structuredData: string[];
  keywordClusters: KeywordCluster[];
  sitemapConfig: Record<string, unknown>;
  geoHints: GEOContent;
  score: SEOScore;
}

export class SEOService {
  generateMetaTags(site: {
    name: string;
    description?: string;
    config?: Record<string, unknown>;
    domain?: string;
  }, page?: { title: string; slug: string; type?: string }): SEOMetaTags {
    const isHome = !page || page.slug === 'home' || page.slug === '/';
    
    let title = `${site.name} | DSCR Loans & Mortgage Solutions`;
    if (!isHome && page) {
      title = `${page.title} | ${site.name}`;
    }

    let description = site.description ??
      `Get fast DSCR loans and mortgage solutions from ${site.name}. No tax returns required. Qualify based on rental income. Rates from 6.5%. Close in 21 days.`;
    
    if (!isHome && page) {
      description = `${page.title} for real estate investors. ${site.name} provides expert mortgage solutions and competitive rates. Close in as few as 21 days.`;
    }

    const keywords = [
      'DSCR loan', 'DSCR mortgage', 'investment property loan',
      'no income verification mortgage', 'rental property loan',
      'mortgage refinance', site.name,
    ];
    
    if (page?.title) keywords.unshift(page.title);

    return {
      title,
      description,
      keywords: keywords.join(', '),
      ogTitle: title,
      ogDescription: description,
      ogType: 'website',
      canonicalUrl: site.domain ? `https://${site.domain}${page?.slug ? `/${page.slug}` : ''}` : undefined,
      robots: 'index, follow',
    };
  }

  generateStructuredData(
    type: 'MortgageLender' | 'LocalBusiness' | 'FAQPage' | 'Service',
    data: Record<string, unknown>,
  ): string {
    const base: Record<string, unknown> = { '@context': 'https://schema.org' };

    if (type === 'MortgageLender') {
      return JSON.stringify({
        ...base,
        '@type': 'MortgageLender',
        name: data.name ?? 'Codexel Mortgage',
        description: data.description ?? 'DSCR and investment property mortgage solutions',
        url: data.url ?? '',
        telephone: data.telephone ?? '',
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.city ?? 'Scottsdale',
          addressRegion: data.state ?? 'AZ',
          addressCountry: 'US',
        },
        hasCredential: [{
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'NMLS License',
          recognizedBy: { '@type': 'Organization', name: 'NMLS' },
          identifier: data.nmls ?? '1831233',
        }],
        areaServed: data.states ?? ['AZ', 'CA', 'TX', 'FL', 'CO', 'NV', 'WA', 'OR'],
        serviceType: ['DSCR Loans', 'Mortgage Refinance', 'Investment Property Loans', 'Hard Money Loans'],
        priceRange: '$$',
      }, null, 2);
    }

    if (type === 'FAQPage') {
      const faqs = (data.faqs as Array<{ q: string; a: string }>) ?? [];
      return JSON.stringify({
        ...base,
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      }, null, 2);
    }

    if (type === 'LocalBusiness') {
      return JSON.stringify({
        ...base,
        '@type': 'LocalBusiness',
        name: data.name,
        url: data.url,
        telephone: data.telephone,
        address: { '@type': 'PostalAddress', ...(data.address as Record<string, unknown> ?? {}) },
      }, null, 2);
    }

    return JSON.stringify({ ...base, '@type': type, ...data }, null, 2);
  }

  generateSitemap(
    domain: string,
    pages: Array<{ path: string; lastmod?: string; priority?: number; changefreq?: string }>,
  ): string {
    const today = new Date().toISOString().split('T')[0];
    const urls = pages.map(p => `
  <url>
    <loc>https://${domain}${p.path}</loc>
    <lastmod>${p.lastmod ?? today}</lastmod>
    <changefreq>${p.changefreq ?? 'weekly'}</changefreq>
    <priority>${p.priority ?? 0.8}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
  }

  generateRobots(domain: string, options?: { disallowPaths?: string[]; sitemapUrl?: string }): string {
    const disallow = (options?.disallowPaths ?? ['/api/', '/admin/', '/_dev/']).map(p => `Disallow: ${p}`).join('\n');
    const sitemap = options?.sitemapUrl ?? `https://${domain}/sitemap.xml`;
    return `User-agent: *\nAllow: /\n${disallow}\n\nSitemap: ${sitemap}`;
  }

  clusterKeywords(
    niche: 'dscr' | 'refinance' | 'purchase' | 'hardmoney' | 'bridge' | string,
    state?: string,
    city?: string,
  ): KeywordCluster[] {
    const stateLabel = state ? ` ${state}` : '';
    const cityLabel = city ? ` ${city}` : '';

    const clusters: Record<string, KeywordCluster[]> = {
      dscr: [
        {
          primary: `DSCR loan${stateLabel}`,
          secondary: [
            'DSCR mortgage lender',
            'debt service coverage ratio loan',
            'DSCR rental property loan',
            'no income verification investment loan',
            `DSCR loan requirements${stateLabel}`,
            'DSCR loan rates today',
          ],
          longtail: [
            'what is a DSCR loan and how does it work',
            'DSCR loan minimum requirements 2025',
            'best DSCR loan rates for rental property',
            'DSCR loan vs conventional mortgage investment property',
            'how to qualify for a DSCR loan no tax returns',
            'DSCR loan for LLC real estate investor',
            'short term rental DSCR loan Airbnb VRBO',
            `DSCR lender${cityLabel}`,
            `investment property loan${stateLabel} no income`,
          ],
          volume: 'high',
          intent: 'transactional',
          difficulty: 'medium',
        },
      ],
      refinance: [
        {
          primary: `mortgage refinance${stateLabel}`,
          secondary: [
            'refinance investment property',
            'cash out refinance rental property',
            'lower mortgage rate refinance',
            'refinance no income verification',
            `refinance rates${stateLabel} today`,
          ],
          longtail: [
            'when to refinance investment property mortgage',
            'cash out refinance rental property requirements',
            'refinance rental property with LLC',
            'best time to refinance rental property 2025',
            `mortgage refinance lender${cityLabel}`,
            'no doc refinance investment property',
          ],
          volume: 'high',
          intent: 'transactional',
          difficulty: 'hard',
        },
      ],
      hardmoney: [
        {
          primary: `hard money loan${stateLabel}`,
          secondary: [
            'hard money lender',
            'fix and flip loan',
            'bridge loan real estate investor',
            'asset based mortgage',
            `hard money rates${stateLabel}`,
          ],
          longtail: [
            'hard money loan requirements for investors',
            'fast hard money loan approval',
            'hard money vs conventional loan real estate',
            `hard money lender${cityLabel}`,
            'hard money loan for rental property purchase',
          ],
          volume: 'medium',
          intent: 'transactional',
          difficulty: 'easy',
        },
      ],
      bridge: [
        {
          primary: `bridge loan${stateLabel}`,
          secondary: [
            'bridge financing real estate',
            'short term bridge loan',
            'bridge loan investment property',
            'commercial bridge loan',
          ],
          longtail: [
            'how does a bridge loan work for real estate',
            'bridge loan to buy before selling',
            'bridge loan rates 2025',
            `bridge loan lender${cityLabel}`,
          ],
          volume: 'medium',
          intent: 'informational',
          difficulty: 'easy',
        },
      ],
      purchase: [
        {
          primary: `investment property purchase loan${stateLabel}`,
          secondary: [
            'buy rental property loan',
            'investment property mortgage',
            'non owner occupied loan',
            '20 percent down investment property loan',
          ],
          longtail: [
            'how to finance investment property with no income',
            'best loan for buying rental property 2025',
            'investment property loan requirements 2025',
            `investment property lender${cityLabel}`,
          ],
          volume: 'high',
          intent: 'commercial',
          difficulty: 'hard',
        },
      ],
    };

    return clusters[niche] ?? clusters['dscr'];
  }

  scorePage(pageData: {
    title?: string;
    metaDescription?: string;
    h1?: string;
    contentLength?: number;
    hasSchema?: boolean;
    hasImage?: boolean;
    loadTime?: number;
  }): SEOScore {
    const recommendations: string[] = [];
    const breakdown = { title: 0, metaDescription: 0, h1: 0, content: 0, schema: 0, technical: 0 };

    // Title: 50-60 chars ideal
    if (pageData.title) {
      const len = pageData.title.length;
      if (len >= 50 && len <= 60) breakdown.title = 100;
      else if (len >= 40 && len <= 70) breakdown.title = 70;
      else { breakdown.title = 40; recommendations.push('Title should be 50-60 characters'); }
    } else {
      recommendations.push('Add a page title tag');
    }

    // Meta description: 150-160 chars
    if (pageData.metaDescription) {
      const len = pageData.metaDescription.length;
      if (len >= 140 && len <= 165) breakdown.metaDescription = 100;
      else if (len >= 120 && len <= 180) breakdown.metaDescription = 70;
      else { breakdown.metaDescription = 40; recommendations.push('Meta description should be 150-160 characters'); }
    } else {
      recommendations.push('Add a meta description');
    }

    // H1
    if (pageData.h1) {
      breakdown.h1 = pageData.h1.length > 10 ? 100 : 50;
    } else {
      recommendations.push('Add an H1 tag with target keyword');
    }

    // Content
    const cl = pageData.contentLength ?? 0;
    if (cl >= 1500) breakdown.content = 100;
    else if (cl >= 800) { breakdown.content = 70; recommendations.push('Aim for 1500+ words for better rankings'); }
    else { breakdown.content = 30; recommendations.push('Add more content — minimum 800 words recommended'); }

    // Schema
    if (pageData.hasSchema) {
      breakdown.schema = 100;
    } else {
      breakdown.schema = 0;
      recommendations.push('Add JSON-LD structured data (MortgageLender schema)');
    }

    // Technical
    const lt = pageData.loadTime ?? 3;
    if (lt <= 1.5) breakdown.technical = 100;
    else if (lt <= 3) { breakdown.technical = 70; recommendations.push('Improve page load time under 1.5s'); }
    else { breakdown.technical = 30; recommendations.push('Page load time is too slow — optimize images and JS'); }

    const overall = Math.round(
      (breakdown.title + breakdown.metaDescription + breakdown.h1 + breakdown.content + breakdown.schema + breakdown.technical) / 6
    );

    return { overall, breakdown, recommendations };
  }

  generateGEOHints(topic: string, context: string): GEOContent {
    const t = topic.toLowerCase();

    if (t.includes('dscr')) {
      return {
        aiSearchSummary: `A DSCR (Debt Service Coverage Ratio) loan is a mortgage for investment properties where qualification is based on the property's rental income rather than the borrower's personal income or tax returns. Lenders typically require a DSCR of 1.0 or higher, meaning the property generates at least as much monthly rent as the mortgage payment (PITI). These loans are ideal for real estate investors who own multiple properties, have complex income structures, or prefer not to provide W-2s and tax returns.`,
        featuredSnippetTarget: `**What is a DSCR Loan?**\nA DSCR loan (Debt Service Coverage Ratio loan) qualifies borrowers based on rental income — not personal income. Key features:\n• No tax returns or W-2s required\n• Qualify with a DSCR of 1.0+ (rent ≥ mortgage payment)\n• Available for LLCs and corporations\n• Close in as little as 21 days\n• Up to 80% LTV on investment properties`,
        questionsAnswered: [
          { question: 'What is a DSCR loan?', answer: 'A DSCR loan qualifies you for a mortgage based on your rental property\'s income (rent) rather than your personal income. If the rent covers the mortgage payment, you can qualify without providing tax returns or W-2s.' },
          { question: 'What DSCR ratio do I need to qualify?', answer: 'Most lenders require a minimum DSCR of 1.0, meaning monthly rent equals or exceeds the monthly mortgage payment (PITI). A DSCR of 1.25 or higher typically qualifies for the best rates.' },
          { question: 'Do DSCR loans require tax returns?', answer: 'No. DSCR loans are specifically designed to skip personal income documentation like tax returns, W-2s, or pay stubs. Qualification is based entirely on the investment property\'s rental income.' },
          { question: 'Can I get a DSCR loan through an LLC?', answer: 'Yes. DSCR loans can be originated in the name of an LLC, S-Corp, or other business entity — a major advantage for real estate investors protecting personal assets.' },
          { question: 'What are current DSCR loan rates?', answer: 'DSCR loan rates typically range from 6.5% to 9% depending on credit score, LTV, property type, and DSCR ratio. Stronger DSCRs (1.25+) and higher credit scores qualify for the lowest rates.' },
        ],
      };
    }

    // Generic fallback
    return {
      aiSearchSummary: `${context} provides professional mortgage and lending solutions with fast approvals and competitive rates. Specializing in investment property financing with minimal documentation requirements.`,
      featuredSnippetTarget: `**${topic}**\nFast, professional mortgage solutions:\n• Minimal documentation required\n• Competitive rates\n• Close in 21 days\n• Licensed in 27 states`,
      questionsAnswered: [
        { question: `What is ${topic}?`, answer: context },
        { question: 'How fast can I get approved?', answer: 'Most loans close in 21 days or less with complete documentation.' },
      ],
    };
  }

  buildSitesSEOConfig(site: { name: string; description?: string; domain?: string; config?: Record<string, any> }, template: string): SiteSEOConfig {
    const niche = template.includes('dscr') ? 'dscr' : template.includes('refi') ? 'refinance' : 'dscr';
    
    // Get all pages from site config if available
    const pages = (site.config?.customContent?.pages as any[]) || [];
    
    const metaTags = this.generateMetaTags(site);
    const keywordClusters = this.clusterKeywords(niche);
    
    // Generate structured data for the site as a whole
    const structuredData = [
      this.generateStructuredData('MortgageLender', { 
        name: site.name, 
        url: site.domain ? `https://${site.domain}` : '',
        nmls: site.config?.nmlsNumber,
        city: site.config?.address,
      }),
    ];

    // Add FAQ Schema if we have FAQs
    const faqs = site.config?.customContent?.faqs;
    if (faqs) {
      try {
        const parsedFaqs = JSON.parse(faqs);
        structuredData.push(this.generateStructuredData('FAQPage', {
          faqs: parsedFaqs.map((f: any) => ({ q: f.question, a: f.answer })),
        }));
      } catch (e) {}
    }

    const geoHints = this.generateGEOHints(niche, site.description ?? '');
    const score = this.scorePage({ 
      title: metaTags.title, 
      metaDescription: metaTags.description, 
      h1: site.name, 
      contentLength: 1500, 
      hasSchema: true 
    });

    const sitemapConfig = {
      domain: site.domain,
      pages: [
        { path: '/', priority: 1.0, changefreq: 'daily' },
        ...pages.map(p => ({
          path: `/${p.slug}`,
          priority: p.slug === 'home' ? 1.0 : 0.7,
          changefreq: 'weekly'
        }))
      ],
    };

    return { metaTags, structuredData, keywordClusters, sitemapConfig, geoHints, score };
  }
}

export const seoService = new SEOService();
