export interface MarketingStack {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  features: string[];
  aiCapabilities: AICapability[];
  category: 'essential' | 'growth' | 'enterprise';
  industries: string[];
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: string;
  automationLevel: 'manual' | 'semi-auto' | 'full-auto';
}

export const marketingStacks: MarketingStack[] = [
  {
    id: 'ai-blog-writer',
    name: 'AI Blog Writer Pro',
    description: 'Automatically generate SEO-optimized blog posts and articles to boost search rankings',
    icon: '✍️',
    price: 49,
    category: 'essential',
    industries: ['legal', 'healthcare', 'finance', 'all'],
    features: [
      'Auto-generate 4 blog posts per week',
      'SEO keyword optimization',
      'Legal industry focus',
      'Case study generation',
      'FAQ auto-creation',
      'Auto-publish to site',
      'Meta descriptions',
      'Internal linking',
      'Image suggestions',
      'Content calendar'
    ],
    aiCapabilities: [
      {
        id: 'content-gen',
        name: 'Content Generation',
        description: 'AI writes full articles based on your practice areas',
        icon: '🤖',
        automationLevel: 'full-auto'
      },
      {
        id: 'seo-opt',
        name: 'SEO Optimization',
        description: 'Automatically optimizes for local search terms',
        icon: '🔍',
        automationLevel: 'full-auto'
      }
    ]
  },
  {
    id: 'ai-social-media',
    name: 'AI Social Media Manager',
    description: 'Create and post engaging content across all social platforms automatically',
    icon: '📱',
    price: 79,
    category: 'essential',
    industries: ['legal', 'healthcare', 'finance', 'retail', 'all'],
    features: [
      'Auto-post to Facebook, Instagram, LinkedIn, Twitter',
      'AI-generated graphics and videos',
      'Case win announcements',
      'Legal tip infographics',
      'Client testimonial posts',
      'Scheduling & automation',
      'Hashtag optimization',
      'Engagement tracking',
      'Story creation',
      'Trend monitoring'
    ],
    aiCapabilities: [
      {
        id: 'visual-gen',
        name: 'Visual Content Creation',
        description: 'Generate professional graphics and videos',
        icon: '🎨',
        automationLevel: 'full-auto'
      },
      {
        id: 'post-scheduling',
        name: 'Smart Scheduling',
        description: 'Posts at optimal times for engagement',
        icon: '⏰',
        automationLevel: 'full-auto'
      }
    ]
  },
  {
    id: 'ai-lead-magnet',
    name: 'AI Lead Magnet Creator',
    description: 'Generate free guides, PDFs, and resources to capture high-quality leads',
    icon: '🧲',
    price: 59,
    category: 'growth',
    features: [
      'Auto-generate legal guides',
      'Accident checklist PDFs',
      'Insurance claim guides',
      'Rights & responsibilities docs',
      'Landing page creation',
      'Email capture forms',
      'Download tracking',
      'Lead scoring',
      'A/B testing',
      'Conversion optimization'
    ],
    aiCapabilities: [
      {
        id: 'guide-creation',
        name: 'Guide Generation',
        description: 'Creates professional PDF guides automatically',
        icon: '📄',
        automationLevel: 'full-auto'
      }
    ]
  },
  {
    id: 'ai-email-campaigns',
    name: 'AI Email Marketing Suite',
    description: 'Nurture leads with personalized email campaigns that convert',
    icon: '📧',
    price: 69,
    category: 'growth',
    features: [
      'Welcome series automation',
      'Newsletter generation',
      'Case update emails',
      'Legal tip sequences',
      'Appointment reminders',
      'Review requests',
      'Segmentation',
      'Personalization',
      'Open rate optimization',
      'Drip campaigns'
    ],
    aiCapabilities: [
      {
        id: 'email-writing',
        name: 'Email Copywriting',
        description: 'Writes compelling emails that get opened',
        icon: '✉️',
        automationLevel: 'full-auto'
      }
    ]
  },
  {
    id: 'ai-advertiser',
    name: 'AI Ad Campaign Manager',
    description: 'Create and optimize Google Ads and Facebook Ads automatically',
    icon: '📊',
    price: 149,
    category: 'growth',
    features: [
      'Google Ads automation',
      'Facebook/Instagram ads',
      'Ad copy generation',
      'Audience targeting',
      'Budget optimization',
      'A/B testing',
      'Conversion tracking',
      'ROI reporting',
      'Competitor analysis',
      'Landing page sync'
    ],
    aiCapabilities: [
      {
        id: 'ad-creation',
        name: 'Ad Creative Generation',
        description: 'Creates ad copy and visuals',
        icon: '🎯',
        automationLevel: 'semi-auto'
      }
    ]
  },
  {
    id: 'ai-reputation',
    name: 'AI Reputation Manager',
    description: 'Monitor and improve online reviews across all platforms',
    icon: '⭐',
    price: 89,
    category: 'essential',
    features: [
      'Review monitoring',
      'Response generation',
      'Review request automation',
      'Google My Business optimization',
      'Yelp management',
      'Avvo profile enhancement',
      'Testimonial collection',
      'Rating improvement',
      'Competitor tracking',
      'Alert system'
    ],
    aiCapabilities: [
      {
        id: 'review-response',
        name: 'Review Response Writer',
        description: 'Crafts professional responses to reviews',
        icon: '💬',
        automationLevel: 'semi-auto'
      }
    ]
  },
  {
    id: 'ai-intake-assistant',
    name: 'AI Intake Assistant',
    description: '24/7 AI assistant that qualifies leads and schedules consultations',
    icon: '🤝',
    price: 199,
    category: 'enterprise',
    features: [
      '24/7 chat availability',
      'Lead qualification',
      'Appointment scheduling',
      'Case evaluation',
      'Document collection',
      'FAQ responses',
      'Multi-language support',
      'SMS integration',
      'CRM sync',
      'Intake form automation'
    ],
    aiCapabilities: [
      {
        id: 'chat-ai',
        name: 'Conversational AI',
        description: 'Natural conversations that convert visitors',
        icon: '💬',
        automationLevel: 'full-auto'
      }
    ]
  },
  {
    id: 'ai-case-manager',
    name: 'AI Case Manager',
    description: 'Automate case updates, client communication, and document management',
    icon: '📁',
    price: 299,
    category: 'enterprise',
    features: [
      'Case status tracking',
      'Client portal',
      'Document automation',
      'Deadline reminders',
      'Court date tracking',
      'Settlement calculator',
      'Progress reports',
      'Team collaboration',
      'Time tracking',
      'Billing integration'
    ],
    aiCapabilities: [
      {
        id: 'case-automation',
        name: 'Case Workflow Automation',
        description: 'Automates routine case management tasks',
        icon: '⚡',
        automationLevel: 'full-auto'
      }
    ]
  },
  {
    id: 'ai-video-creator',
    name: 'AI Video Marketing Suite',
    description: 'Create professional legal videos for YouTube and social media',
    icon: '🎥',
    price: 129,
    category: 'growth',
    features: [
      'Video script generation',
      'Auto-editing',
      'Subtitle creation',
      'Thumbnail design',
      'YouTube optimization',
      'Video testimonials',
      'Educational content',
      'Case result videos',
      'FAQ videos',
      'Distribution automation'
    ],
    aiCapabilities: [
      {
        id: 'video-production',
        name: 'Video Production AI',
        description: 'Creates videos from text and images',
        icon: '🎬',
        automationLevel: 'semi-auto'
      }
    ]
  },
  {
    id: 'xl-ultimate-stack',
    name: 'Codexel XL Ultimate Stack',
    description: 'Complete AI marketing automation suite - Everything you need to dominate your market',
    icon: '🚀',
    price: 799,
    category: 'enterprise',
    features: [
      'All AI capabilities included',
      'Priority support',
      'Custom AI training',
      'White-label options',
      'API access',
      'Advanced analytics',
      'Multi-location support',
      'Team seats included',
      'Monthly strategy calls',
      'Done-for-you setup'
    ],
    aiCapabilities: [
      {
        id: 'full-suite',
        name: 'Complete AI Suite',
        description: 'Every AI tool working together seamlessly',
        icon: '🎯',
        automationLevel: 'full-auto'
      }
    ]
  }
];

export const stackBundles = {
  starter: {
    name: 'Starter Bundle',
    description: 'Essential tools to get started',
    stacks: ['ai-blog-writer', 'ai-social-media', 'ai-reputation'],
    discount: 15,
    monthlyPrice: 159
  },
  growth: {
    name: 'Growth Bundle',
    description: 'Everything you need to scale',
    stacks: ['ai-blog-writer', 'ai-social-media', 'ai-lead-magnet', 'ai-email-campaigns', 'ai-advertiser'],
    discount: 20,
    monthlyPrice: 299
  },
  dominator: {
    name: 'Market Dominator',
    description: 'Become the #1 law firm in your area',
    stacks: ['xl-ultimate-stack'],
    discount: 0,
    monthlyPrice: 799
  }
};

export function getStackById(id: string): MarketingStack | undefined {
  return marketingStacks.find(stack => stack.id === id);
}

export function getStacksByCategory(category: string): MarketingStack[] {
  return marketingStacks.filter(stack => stack.category === category);
}

export function calculateBundlePrice(stackIds: string[]): number {
  const total = stackIds.reduce((sum, id) => {
    const stack = getStackById(id);
    return sum + (stack?.price || 0);
  }, 0);
  return total;
}