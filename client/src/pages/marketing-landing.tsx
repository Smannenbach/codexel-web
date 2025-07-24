import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Check, 
  Star, 
  Users, 
  Zap, 
  Shield, 
  Rocket, 
  Brain,
  Code2,
  Sparkles,
  Globe,
  TrendingUp,
  MessageSquare,
  Bot,
  ChevronDown,
  Play,
  Award,
  Target,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  highlight?: boolean;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
}

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "Multi-AI Orchestration",
    description: "Harness GPT-4, Claude, Gemini, and XAI models in one unified platform for optimal results",
    highlight: true
  },
  {
    icon: Code2,
    title: "Three-Panel Workspace",
    description: "AI Team Dashboard, Multimodal Chat, and Live Preview in an intuitive workspace design"
  },
  {
    icon: Sparkles,
    title: "3D AI Sales Agents",
    description: "Create AI clones with 3D avatars, custom voices, and personalized sales conversations"
  },
  {
    icon: MessageSquare,
    title: "Multimodal Chat Interface",
    description: "Upload images, PDFs, documents and chat with AI about any content seamlessly"
  },
  {
    icon: Rocket,
    title: "One-Click Deployment",
    description: "Deploy your AI applications instantly with automated SSL, CDN, and domain configuration"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Built-in security monitoring, error boundaries, and production-grade infrastructure"
  }
];

const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    role: "CEO",
    company: "LegalTech Solutions",
    content: "Codexel transformed our client acquisition process. Our AI sales agent handles 80% of initial consultations, freeing our lawyers for complex cases.",
    avatar: "SC",
    rating: 5
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Practice Owner",
    company: "Rodriguez Dental Group",
    content: "The marketing automation is incredible. We've seen 300% increase in qualified leads since implementing our AI-powered patient engagement system.",
    avatar: "MR",
    rating: 5
  },
  {
    name: "Jennifer Walsh",
    role: "Financial Advisor",
    company: "Walsh Investment Partners",
    content: "Building our client portal with AI agents took weeks instead of months. The ROI has been phenomenal - our clients love the 24/7 support.",
    avatar: "JW",
    rating: 5
  }
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Pro",
    price: 29,
    period: "month",
    description: "Perfect for individual professionals and small teams",
    features: [
      "Multi-AI model access (GPT-4, Claude, Gemini)",
      "3D AI sales agent creation",
      "Unlimited projects and workspaces",
      "Marketing automation tools",
      "24/7 customer support",
      "SSL certificates and hosting included"
    ],
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    price: 99,
    period: "month",
    description: "Advanced features for growing businesses and agencies",
    features: [
      "Everything in Pro",
      "Advanced analytics and insights",
      "White-label options",
      "Priority support with dedicated account manager",
      "Custom AI model training",
      "Advanced security and compliance",
      "Team collaboration tools",
      "API access and integrations"
    ],
    popular: true,
    cta: "Get Started"
  }
];

const stats = [
  { number: "10,000+", label: "AI Applications Built" },
  { number: "500+", label: "Business Templates" },
  { number: "99.9%", label: "Uptime Guarantee" },
  { number: "24/7", label: "AI Support" }
];

export default function MarketingLanding() {
  const [selectedFeature, setSelectedFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Codexel.ai
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('pricing')} className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </button>
            <button onClick={() => scrollToSection('testimonials')} className="text-gray-300 hover:text-white transition-colors">
              Testimonials
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => window.location.href = '/workspace'}>
              Dashboard
            </Button>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => window.location.href = '/pricing'}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className={cn(
            "text-center transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Star className="w-3 h-3 mr-1" />
              #1 AI Development Platform
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              Build AI Apps
              <br />
              <span className="text-white">Without Code</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Create powerful AI applications, 3D sales agents, and marketing automation 
              with our revolutionary no-code platform. Deploy in minutes, not months.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg"
                onClick={() => window.location.href = '/workspace'}
              >
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg border-gray-700 hover:bg-gray-800"
                onClick={() => scrollToSection('demo')}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Build
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI-Powered Applications
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From concept to deployment, our platform provides all the tools you need 
              to create professional AI applications without writing a single line of code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={cn(
                  "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 transition-all duration-300 hover:scale-105",
                  feature.highlight && "ring-2 ring-purple-500/50"
                )}
              >
                <CardHeader>
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    feature.highlight ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-700"
                  )}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of professionals who've transformed their businesses with AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-300">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index}
                className={cn(
                  "relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700",
                  plan.popular && "ring-2 ring-purple-500 scale-105"
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                  <p className="text-gray-300">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                  
                  <Button 
                    className={cn(
                      "w-full mt-8",
                      plan.popular 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                        : "bg-gray-700 hover:bg-gray-600"
                    )}
                    onClick={() => window.location.href = '/pricing'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of professionals already using Codexel.ai to transform their businesses with AI.
            Start your free trial today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg"
              onClick={() => window.location.href = '/workspace'}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="text-sm text-gray-400">
              No credit card required • 14-day free trial
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Codexel.ai</span>
              </div>
              <p className="text-gray-400">
                The future of AI application development is here.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Templates</div>
                <div>Integrations</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <div className="space-y-2 text-gray-400">
                <div>About</div>
                <div>Blog</div>
                <div>Careers</div>
                <div>Contact</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-gray-400">
                <div>Documentation</div>
                <div>Help Center</div>
                <div>Status</div>
                <div>Community</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Codexel.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}