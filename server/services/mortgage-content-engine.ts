/**
 * Mortgage Content Engine — Phase 2
 * Generates unique, SEO-optimized content for each mortgage/DSCR site
 * based on domain name, niche, state, and loan type analysis.
 * Falls back to high-quality template copy if no AI API key is set.
 */

import { seoService } from './seo-service';

export interface DomainAnalysis {
  domain: string;
  niche: 'dscr' | 'refinance' | 'purchase' | 'hard-money' | 'bridge' | 'general';
  state: string | null;
  stateCode: string | null;
  city: string | null;
  loanTypes: string[];
  suggestedTemplateId: string;
  suggestedKeywords: string[];
  brandName: string;
}

export interface SiteContent {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  aboutTitle: string;
  aboutBody: string;
  servicesTitle: string;
  services: { title: string; description: string; icon: string }[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
  ctaHeadline: string;
  ctaSubtext: string;
  footerTagline: string;
  metaTitle: string;
  metaDescription: string;
  pageTitle: string;
  pages: { slug: string; title: string; content: string; metaTitle?: string; metaDescription?: string }[];
}

// US state name → code lookup
const STATE_MAP: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
  // Abbreviations
  al: 'AL', ak: 'AK', az: 'AZ', ar: 'AR', ca: 'CA', co: 'CO', ct: 'CT',
  de: 'DE', fl: 'FL', ga: 'GA', hi: 'HI', id: 'ID', il: 'IL', in: 'IN',
  ia: 'IA', ks: 'KS', ky: 'KY', la: 'LA', me: 'ME', md: 'MD', ma: 'MA',
  mi: 'MI', mn: 'MN', ms: 'MS', mo: 'MO', mt: 'MT', ne: 'NE', nv: 'NV',
  nh: 'NH', nj: 'NJ', nm: 'NM', ny: 'NY', nc: 'NC', nd: 'ND', oh: 'OH',
  ok: 'OK', or: 'OR', pa: 'PA', ri: 'RI', sc: 'SC', sd: 'SD', tn: 'TN',
  tx: 'TX', ut: 'UT', vt: 'VT', va: 'VA', wa: 'WA', wv: 'WV', wi: 'WI', wy: 'WY',
};

const STATE_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_MAP)
    .filter(([k]) => k.length > 2)
    .map(([name, code]) => [code, name.replace(/\b\w/g, c => c.toUpperCase())])
);

// Niche keyword triggers
const NICHE_TRIGGERS: Record<string, string[]> = {
  dscr: ['dscr', 'debt-service', 'rental', 'investor', 'investment', 'cashflow', 'cash-flow', 'nonincome', 'no-income', 'nondoc', 'no-doc'],
  refinance: ['refi', 'refinance', 'refinancing', 'rateandterm', 'cashout', 'cash-out', 'heloc', 'equity'],
  'hard-money': ['hardmoney', 'hard-money', 'fix-and-flip', 'fixandflip', 'rehab', 'flip'],
  bridge: ['bridge', 'bridging', 'gap', 'transition'],
  purchase: ['purchase', 'buy', 'homebuyer', 'firsttime', 'first-time', 'jumbo'],
};

export function analyzeDomain(rawDomain: string): DomainAnalysis {
  // Strip TLD, www, and normalize
  const clean = rawDomain
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/\.(com|net|org|io|co|us|mortgage|loans?|realty|properties?)$/, '')
    .replace(/[-_]/g, ' ');

  const words = clean.split(/\s+/);
  const joined = clean.replace(/\s/g, '');

  // Detect niche
  let niche: DomainAnalysis['niche'] = 'general';
  for (const [n, triggers] of Object.entries(NICHE_TRIGGERS)) {
    if (triggers.some(t => joined.includes(t.replace(/-/g, '')))) {
      niche = n as DomainAnalysis['niche'];
      break;
    }
  }

  // Detect state
  let stateCode: string | null = null;
  let stateName: string | null = null;
  for (const word of words) {
    if (STATE_MAP[word]) {
      stateCode = STATE_MAP[word];
      stateName = STATE_NAMES[stateCode] || word;
      break;
    }
  }
  // Also check 2-letter suffix like "dscrloanstx"
  const twoLetterEnd = joined.slice(-2);
  if (!stateCode && STATE_MAP[twoLetterEnd] && twoLetterEnd.length === 2) {
    stateCode = STATE_MAP[twoLetterEnd];
    stateName = STATE_NAMES[stateCode] || twoLetterEnd.toUpperCase();
  }

  // Detect city (simple: first word that's not a niche/state keyword and length > 3)
  const nicheWords = new Set(Object.values(NICHE_TRIGGERS).flat().map(t => t.replace(/-/g, '')));
  const city = words.find(w => w.length > 3 && !nicheWords.has(w) && !STATE_MAP[w]) || null;

  // Brand name = domain words capitalized, minus TLD
  const brandName = words
    .filter(w => !STATE_MAP[w])
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .trim() || 'Mortgage Solutions';

  // Template selection
  let suggestedTemplateId = 'lead-capture';
  if (niche === 'dscr' && stateCode) suggestedTemplateId = 'state-dscr';
  else if (niche === 'dscr') suggestedTemplateId = 'dscr-landing';
  else if (niche === 'refinance') suggestedTemplateId = 'mortgage-rate-checker';

  // Keyword clusters
  const base = stateCode ? `${stateName} ` : '';
  const suggestedKeywords: string[] = [];
  if (niche === 'dscr') {
    suggestedKeywords.push(
      `${base}DSCR loan`, `${base}DSCR lender`, `${base}investor mortgage`,
      `${base}rental property loan`, `${base}no income verification mortgage`,
      `${base}DSCR loan rates`, `debt service coverage ratio loan ${base}`
    );
  } else if (niche === 'refinance') {
    suggestedKeywords.push(
      `${base}mortgage refinance`, `${base}cash out refinance`,
      `${base}refinance rates`, `${base}home equity loan`, `${base}refinance lender`
    );
  } else if (niche === 'hard-money') {
    suggestedKeywords.push(
      `${base}hard money lender`, `${base}fix and flip loans`,
      `${base}rehab loans`, `${base}private money lender`
    );
  } else {
    suggestedKeywords.push(
      `${base}mortgage lender`, `${base}home loans`, `${base}mortgage broker`,
      `${base}best mortgage rates`, `${base}mortgage company`
    );
  }

  const loanTypes = niche === 'dscr'
    ? ['DSCR Loan', 'Investor Loan', 'Rental Property Loan', 'No-Doc Loan']
    : niche === 'refinance'
    ? ['Rate & Term Refinance', 'Cash-Out Refinance', 'HELOC', 'Streamline Refinance']
    : niche === 'hard-money'
    ? ['Hard Money Loan', 'Fix & Flip Loan', 'Rehab Loan', 'Bridge Loan']
    : ['Conventional', 'FHA', 'VA', 'Jumbo', 'DSCR'];

  return { domain: rawDomain, niche, state: stateName, stateCode, city, loanTypes, suggestedTemplateId, suggestedKeywords, brandName };
}

// Generate complete page content — AI-enhanced or template fallback
export async function generateSiteContent(analysis: DomainAnalysis): Promise<SiteContent> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (apiKey && process.env.OPENAI_API_KEY) {
    try {
      return await generateWithOpenAI(analysis);
    } catch (err) {
      console.warn('[ContentEngine] AI generation failed, using template fallback:', err);
    }
  }

  return generateTemplateCopy(analysis);
}

async function generateWithOpenAI(analysis: DomainAnalysis): Promise<SiteContent> {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const stateStr = analysis.state ? ` in ${analysis.state}` : '';
  const nicheLabel = {
    dscr: 'DSCR (Debt Service Coverage Ratio) investor lending',
    refinance: 'mortgage refinancing',
    'hard-money': 'hard money lending',
    bridge: 'bridge loans',
    purchase: 'home purchase mortgages',
    general: 'mortgage lending',
  }[analysis.niche];

  const prompt = `You are a top mortgage marketing copywriter. Generate website content for "${analysis.brandName}", a ${nicheLabel} company${stateStr}.

Domain: ${analysis.domain}
Brand: ${analysis.brandName}
Niche: ${analysis.niche}
State: ${analysis.state || 'Nationwide'}
Loan types offered: ${analysis.loanTypes.join(', ')}
Target keywords: ${analysis.suggestedKeywords.slice(0, 3).join(', ')}

Return a JSON object with these exact keys (no markdown, pure JSON):
{
  "heroHeadline": "...",
  "heroSubheadline": "...",
  "heroCtaText": "...",
  "aboutTitle": "...",
  "aboutBody": "...(2 paragraphs, SEO-rich, 120 words)",
  "servicesTitle": "...",
  "services": [
    {"title": "...", "description": "...(20 words)", "icon": "building"},
    {"title": "...", "description": "...", "icon": "trending-up"},
    {"title": "...", "description": "...", "icon": "shield"},
    {"title": "...", "description": "...", "icon": "clock"}
  ],
  "faqTitle": "...",
  "faqs": [
    {"question": "...", "answer": "...(50 words)"},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ],
  "ctaHeadline": "...",
  "ctaSubtext": "...",
  "footerTagline": "...",
  "metaTitle": "...(60 chars max)",
  "metaDescription": "...(155 chars max)",
  "pageTitle": "..."
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content || '{}';
  return JSON.parse(text) as SiteContent;
}

function generateTemplateCopy(a: DomainAnalysis): SiteContent {
  const state = a.state || 'Nationwide';
  const stateStr = a.state ? ` in ${a.state}` : '';
  const brand = a.brandName;

  const nicheConfig = {
    dscr: {
      hero: `${state} DSCR Loans — Qualify on Rental Income, Not Your Tax Returns`,
      sub: `${brand} funds investment properties${stateStr} using Debt Service Coverage Ratio underwriting. Close in as little as 14 days.`,
      cta: 'Check My DSCR Rate',
      about: `${brand} specializes in DSCR loans for real estate investors${stateStr}. We underwrite based on your property's rental income—not your personal tax returns—making it easy for self-employed investors and business owners to scale their portfolios.\n\nOur streamlined process means fewer docs, faster closings, and competitive rates on single-family, 2–4 unit, and multifamily properties. Whether you're buying your first rental or refinancing a portfolio, our team closes deals other lenders can't.`,
      services: [
        { title: 'DSCR Purchase Loans', description: 'Buy investment properties using rental income to qualify. No personal income needed.', icon: 'building' },
        { title: 'DSCR Cash-Out Refi', description: 'Tap your equity to fund more acquisitions without income docs.', icon: 'trending-up' },
        { title: 'Portfolio Loans', description: 'Finance multiple properties under one loan with blanket DSCR underwriting.', icon: 'shield' },
        { title: 'Fast 14-Day Close', description: 'Streamlined underwriting with minimal paperwork for speed-to-market.', icon: 'clock' },
      ],
      faqs: [
        { question: `What is a DSCR loan${stateStr}?`, answer: `A DSCR (Debt Service Coverage Ratio) loan qualifies you based on the property's rental income vs. the mortgage payment — not your personal W-2 or tax returns. A DSCR above 1.0 means the property covers its own debt.` },
        { question: 'What DSCR ratio do I need to qualify?', answer: `Most lenders require a minimum DSCR of 0.75–1.25. ${brand} works with ratios as low as 0.75 for strong borrowers with good credit and reserves.` },
        { question: 'Can I use a DSCR loan on an LLC?', answer: 'Yes — DSCR loans are investor-friendly and can close in the name of an LLC or other business entity, protecting your personal assets.' },
        { question: 'What types of properties qualify?', answer: 'Single-family rentals (SFR), 2–4 unit properties, condos, townhomes, and small multifamily (5–10 units) typically qualify for DSCR financing.' },
        { question: `What are current DSCR rates${stateStr}?`, answer: `DSCR rates vary based on LTV, DSCR ratio, credit score, and property type. Contact ${brand} for a personalized rate quote — we're typically competitive with conventional investment property rates.` },
      ],
      meta: {
        title: `${state} DSCR Loans | ${brand} — Investor Lending`,
        desc: `DSCR loans${stateStr} for real estate investors. Qualify on rental income, not tax returns. Fast closings. Get your rate today from ${brand}.`,
      },
    },
    refinance: {
      hero: `Lower Your Rate. Access Your Equity. ${state} Refinance Experts.`,
      sub: `${brand} helps homeowners${stateStr} refinance into better rates and terms. Find out how much you can save in minutes.`,
      cta: 'See My Savings',
      about: `${brand} is a trusted mortgage refinance specialist${stateStr}. Whether you want to lower your monthly payment, shorten your loan term, or tap into your home equity, our team crafts the right refi strategy for your goals.\n\nWe compare dozens of lenders to find you the lowest available rate — with no hidden fees and transparent pricing from application to close.`,
      services: [
        { title: 'Rate & Term Refinance', description: 'Lock in a lower rate and reduce your monthly payment significantly.', icon: 'trending-up' },
        { title: 'Cash-Out Refinance', description: 'Access your home equity for renovations, investments, or debt payoff.', icon: 'building' },
        { title: 'HELOC', description: 'Flexible home equity line of credit for ongoing financial needs.', icon: 'shield' },
        { title: 'Streamline Refinance', description: 'FHA/VA streamline options with minimal paperwork for existing loans.', icon: 'clock' },
      ],
      faqs: [
        { question: 'When should I refinance my mortgage?', answer: 'Refinancing makes sense when you can lower your rate by at least 0.5%, reduce your term, or access equity at a rate better than alternatives.' },
        { question: `What are current refinance rates${stateStr}?`, answer: `Refinance rates change daily. ${brand} monitors the market and locks your rate at the optimal time. Request a free quote to see your personalized rate.` },
        { question: 'How long does a refinance take?', answer: 'Most refinances close in 21–30 days. Streamline refinances can close in as little as 10–14 days with our expedited processing.' },
        { question: 'What is a cash-out refinance?', answer: 'A cash-out refi replaces your current mortgage with a larger loan, letting you pocket the difference. Common uses include home improvements, paying off high-interest debt, or investing.' },
        { question: 'Are there closing costs on a refinance?', answer: `Yes, but ${brand} offers no-cost refinance options where closing costs are rolled into the rate. We'll show you the break-even analysis upfront so you can decide what works best.` },
      ],
      meta: {
        title: `${state} Mortgage Refinance | ${brand} — Best Rates`,
        desc: `Refinance your mortgage${stateStr} with ${brand}. Compare rates, lower your payment, or access equity. Free quote in minutes — no obligation.`,
      },
    },
    'hard-money': {
      hero: `Fast Hard Money Loans${stateStr} — Fund Your Next Flip in Days`,
      sub: `${brand} provides asset-based hard money financing for fix-and-flip, bridge, and rehab projects. No income verification. Close in 5–10 days.`,
      cta: 'Get Funded Fast',
      about: `${brand} is a direct hard money lender${stateStr} focused on speed and certainty of execution. We fund based on property value and your experience — not credit scores or tax returns.\n\nWhether you're flipping a single-family, rehabbing a multifamily, or bridging into long-term financing, we close fast so you don't miss deals.`,
      services: [
        { title: 'Fix & Flip Loans', description: 'Short-term financing to buy and renovate investment properties for resale.', icon: 'building' },
        { title: 'Rehab Loans', description: 'Draw-based construction funds released as work is completed.', icon: 'trending-up' },
        { title: 'Bridge Loans', description: 'Short-term financing to bridge the gap while permanent financing is arranged.', icon: 'shield' },
        { title: '5-Day Close', description: 'Asset-based underwriting means we close faster than any bank.', icon: 'clock' },
      ],
      faqs: [
        { question: 'What is a hard money loan?', answer: 'A hard money loan is a short-term, asset-based loan funded by private investors. The property is the collateral — not your income or credit score.' },
        { question: `Who are hard money lenders${stateStr}?`, answer: `${brand} is a direct hard money lender${stateStr} with in-house underwriting. No broker middlemen — we make our own decisions and fund from our own capital.` },
        { question: 'How fast can you close?', answer: 'Our record is 48 hours for all-cash deals. Typical funded loans close in 5–10 business days with clear title and a clean property.' },
        { question: 'What is the LTV for hard money loans?', answer: 'We typically lend up to 70–75% of ARV (After Repair Value) or 90% of purchase price, whichever is lower. Experienced investors may qualify for higher LTV.' },
        { question: 'Do I need good credit for a hard money loan?', answer: `${brand} evaluates primarily on the deal — the property value, your exit strategy, and experience. Minimum credit scores vary by program, starting at 600 for most products.` },
      ],
      meta: {
        title: `${state} Hard Money Loans | ${brand} — Fast Funding`,
        desc: `Hard money loans${stateStr}. Fix & flip, bridge, and rehab financing. Close in days, not weeks. Get a same-day decision from ${brand}.`,
      },
    },
    general: {
      hero: `${state} Mortgage Experts — Close Your Loan in 21 Days or Less`,
      sub: `${brand} offers competitive rates on purchase, refinance, and investor loans${stateStr}. Get pre-approved in minutes.`,
      cta: 'Get Pre-Approved',
      about: `${brand} is a full-service mortgage brokerage${stateStr}, working with dozens of lenders to find the right loan for every borrower. From first-time homebuyers to seasoned investors, we have solutions that fit your goals and timeline.\n\nOur licensed loan officers walk you through every step — from application to closing — with transparent communication and competitive pricing on every product.`,
      services: [
        { title: 'Home Purchase Loans', description: 'Conventional, FHA, VA, and jumbo loans for primary, second home, and investment.', icon: 'building' },
        { title: 'Mortgage Refinance', description: 'Rate-and-term or cash-out refinancing to optimize your current loan.', icon: 'trending-up' },
        { title: 'DSCR Investor Loans', description: 'Qualify on rental income — no tax returns required for investment properties.', icon: 'shield' },
        { title: '21-Day Close Guarantee', description: 'Streamlined processing and dedicated processors ensure on-time closings.', icon: 'clock' },
      ],
      faqs: [
        { question: `What mortgage programs does ${brand} offer?`, answer: `We offer conventional, FHA, VA, USDA, jumbo, and DSCR investor loans${stateStr}. Our team helps you find the best program for your situation.` },
        { question: 'How do I get pre-approved?', answer: 'Our online pre-approval takes 3 minutes. We\'ll review your credit, income, and assets to issue a pre-approval letter — valid for 90 days.' },
        { question: `What are current mortgage rates${stateStr}?`, answer: `Rates change daily. ${brand} monitors multiple lenders to get you the most competitive rate. Request a free quote to see today's rates for your scenario.` },
        { question: 'How long does it take to close a mortgage?', answer: `${brand} averages 21 days from application to close. Rush closings of 10–14 days are available for qualified borrowers with complete documentation.` },
        { question: 'Do you work with self-employed borrowers?', answer: `Yes — ${brand} specializes in self-employed and investor borrowers. We offer bank statement loans and DSCR programs that don't require traditional income docs.` },
      ],
      meta: {
        title: `${state} Mortgage Lender | ${brand} — Best Rates`,
        desc: `${brand} offers mortgage loans${stateStr}. Purchase, refinance, and investor loans. Competitive rates, fast closings. Get pre-approved today.`,
      },
    },
  };

  const config = nicheConfig[a.niche as keyof typeof nicheConfig] || nicheConfig.general;

  return {
    heroHeadline: config.hero,
    heroSubheadline: config.sub,
    heroCtaText: config.cta,
    aboutTitle: `About ${brand}`,
    aboutBody: config.about,
    servicesTitle: 'Our Loan Programs',
    services: config.services,
    faqTitle: 'Frequently Asked Questions',
    faqs: config.faqs,
    ctaHeadline: `Ready to Get Started${stateStr}?`,
    ctaSubtext: `Talk to a ${brand} loan specialist today — no obligation, no pressure.`,
    footerTagline: `${brand} — Your trusted mortgage partner${stateStr}.`,
    metaTitle: config.meta.title,
    metaDescription: config.meta.desc,
    pageTitle: config.meta.title,
    pages: generateDeepStructure(a),
  };
}

function generateDeepStructure(a: DomainAnalysis): any[] {
  const brand = a.brandName;
  const state = a.state || 'Nationwide';
  const niche = a.niche;

  const corePages = [
    { slug: 'home', title: 'Home', content: `Welcome to ${brand}.` },
    { slug: 'about', title: 'About Us', content: `Who is ${brand}?` },
    { slug: 'contact', title: 'Contact Us', content: `Get in touch with us.` },
    { slug: 'privacy', title: 'Privacy Policy', content: `Your privacy matters.` },
    { slug: 'terms', title: 'Terms of Service', content: `Our legal terms.` },
  ];

  // Topic pages (20-30)
  const topicPages = [
    'How it Works', 'Loan Programs', 'Interest Rates', 'Calculator',
    'FHA vs Conventional', 'VA Loan Benefits', 'Credit Score Requirements',
    'Self-Employed Loans', 'Investment Property Strategy', 'Closing Costs Guide',
    'Refinance Break-even Analysis', 'Cash-out vs Rate-and-term', 'HELOC Guide',
  ].map(t => ({
    slug: t.toLowerCase().replace(/\s+/g, '-'),
    title: t,
    content: `${t} details for ${brand}.`
  }));

  // Geo pages (50-80 cities in the state)
  const cities = a.stateCode === 'TX' 
    ? ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Laredo', 'Lubbock', 'Garland']
    : ['Phoenix', 'Miami', 'Chicago', 'Atlanta', 'Denver', 'Seattle', 'Nashville', 'Las Vegas', 'Portland', 'Boston', 'Philadelphia', 'Charlotte'];
  
  const geoPages = cities.map(city => ({
    slug: `${city.toLowerCase()}-${niche}-loans`,
    title: `${city} ${niche.toUpperCase()} Loans`,
    content: `Local mortgage expertise in ${city}, ${state}.`
  }));

  // Combine to reach 100+ stubs
  let allPages = [...corePages, ...topicPages, ...geoPages];
  
  // Fill the rest with long-tail variations
  while (allPages.length < 110) {
    const i = allPages.length;
    allPages.push({
      slug: `mortgage-article-${i}`,
      title: `Expert Mortgage Tip #${i}`,
      content: `Article content for ${brand}.`
    });
  }

  // Apply SEO Service to every page
  return allPages.map(p => {
    const meta = seoService.generateMetaTags({ name: brand, domain: a.domain }, p);
    return {
      ...p,
      metaTitle: meta.title,
      metaDescription: meta.description,
      schema: seoService.generateStructuredData('Service', {
        name: p.title,
        description: meta.description,
        areaServed: p.slug.includes('-loans') ? p.title.split(' ')[0] : state
      })
    };
  });
}
