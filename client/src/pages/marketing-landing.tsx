import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Rocket, 
  Brain,
  Globe,
  TrendingUp,
  Bot,
  Play,
  Target,
  Clock,
  Home,
  Building2,
  Layout,
  Search,
  Layers,
  MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Layers,
    title: "Mass Fleet Deployment",
    description: "Launch 150+ high-authority websites in a single click. Every domain is analyzed and deployed instantly.",
    highlight: true
  },
  {
    icon: Search,
    title: "SEO God-Mode",
    description: "110+ optimized pages per site automatically generated. City-specific landing pages and technical schema included.",
    highlight: true
  },
  {
    icon: Brain,
    title: "Global AI Command",
    description: "Control your entire empire with natural language. Broadcast updates to 242 domains simultaneously.",
    highlight: true
  },
  {
    icon: Globe,
    title: "Hyper-Local Authority",
    description: "Automatically generate unique content for 80+ cities per state, dominating local search results.",
  },
  {
    icon: Shield,
    title: "Enterprise Infrastructure",
    description: "Powered by Cloudflare, Vercel, and Supabase for 99.99% uptime and global edge performance.",
  },
  {
    icon: Bot,
    title: "Self-Healing Content",
    description: "AI continuously monitors and updates your site content based on real-time market trends.",
  }
];

const stats = [
  { number: "242", label: "Ready-to-Launch Domains" },
  { number: "110+", label: "Pages per Website" },
  { number: "100%", label: "SEO Optimized" },
  { number: "< 60s", label: "Deployment Time" }
];

export default function MarketingLanding() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (elementId: string) => {
    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Zap className="w-5 h-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Codexel<span className="text-blue-500">.ai</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('fleet')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Mass Deploy</button>
            <button onClick={() => scrollToSection('seo')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">SEO Engine</button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => window.location.href = '/factory'}>
              Factory
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-full font-bold shadow-lg shadow-blue-900/40 transition-all"
              onClick={() => window.location.href = '/factory'}
            >
              Launch Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl relative">
          <div className={cn(
            "text-center transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/30 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
              The World's #1 AI Website Factory
            </Badge>
            
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              LAUNCH 150+ SITES
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
                IN ONE CLICK
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Don't just build a website. Build a **Digital Empire.** 
              Codexel.ai automates mass-domain deployment with 100+ SEO-optimized pages per site.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-7 text-xl font-black rounded-2xl shadow-2xl shadow-blue-900/40 transition-all"
                onClick={() => window.location.href = '/factory'}
              >
                DEPLOY MY FLEET
                <Rocket className="w-6 h-6 ml-3" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="px-10 py-7 text-xl font-bold border-gray-800 hover:bg-gray-900 rounded-2xl text-gray-400 hover:text-white transition-all"
                onClick={() => scrollToSection('features')}
              >
                <Play className="w-5 h-5 mr-3 fill-current" />
                See How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto py-12 border-y border-gray-900 bg-gray-900/20 backdrop-blur-sm rounded-3xl">
              {stats.map((stat, index) => (
                <div key={index} className="text-center px-4 border-r last:border-0 border-gray-800">
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                    {stat.number}
                  </div>
                  <div className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
              DOMINATE THE
              <span className="block text-blue-500">SEARCH RESULTS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-medium">
              We've automated the entire SEO lifecycle. From domain analysis to 
              deep internal linking and technical schema—everything is handled by AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className={cn(
                  "bg-gray-900/40 border-gray-800 transition-all duration-500 hover:border-blue-500/50 hover:bg-gray-900/60 rounded-3xl p-4",
                  feature.highlight && "ring-1 ring-blue-500/20 shadow-2xl shadow-blue-900/10"
                )}
              >
                <CardHeader>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner",
                    feature.highlight ? "bg-blue-600 text-white" : "bg-gray-800 text-blue-500"
                  )}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-2xl font-bold tracking-tight mb-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 leading-relaxed font-medium">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Management Section */}
      <section id="fleet" className="py-32 px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                Mass Fleet Engine
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                ONE COMMAND.
                <br />
                242 DOMAINS.
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed font-medium">
                Our proprietary **Global AI Broadcast** system lets you push 
                updates to your entire fleet simultaneously. Update rates, 
                swap CTAs, or add new pages across every domain in seconds.
              </p>
              
              <ul className="space-y-6">
                {[
                  "Dynamic wave-based deployment",
                  "AI-driven niche and state detection",
                  "Cloudflare Edge automation",
                  "Real-time fleet health monitoring"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-gray-300 font-bold">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Button 
                onClick={() => window.location.href = '/factory'}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 h-14 rounded-xl font-bold transition-all border border-gray-700"
              >
                Access Fleet Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-full opacity-50" />
              <Card className="bg-gray-900 border-gray-800 relative shadow-2xl rounded-[40px] overflow-hidden border-2">
                <div className="bg-gray-800 px-6 py-4 flex items-center gap-2 border-b border-gray-700">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <div className="ml-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Codexel Fleet Console</div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black text-blue-500 uppercase">Global Broadcast</div>
                    <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 text-sm font-mono text-gray-400 italic">
                      "Update interest rates to 6.25% on all Florida sites"
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="p-4 bg-gray-950/50 rounded-2xl border border-gray-800 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div className="space-y-1">
                          <div className="text-[9px] font-bold text-gray-500 uppercase">Domain {i}</div>
                          <div className="text-[10px] text-white font-black">ACTIVE</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-blue-600 h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/40">
                    EXECTUE ACROSS 242 SITES
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Engine Section */}
      <section id="seo" className="py-32 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-10 bg-green-500/10 text-green-400 border-green-500/30 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            Deep SEO Technology
          </Badge>
          <h2 className="text-4xl md:text-7xl font-black mb-12 tracking-tighter leading-tight">
            110+ PAGES PER SITE.
            <br />
            <span className="text-blue-500">FULLY AUTOMATED.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-20 font-medium">
            Most AI builders create "thin" content. Codexel creates **authoritative networks.** 
            Every site features deep topical hubs and city-level pages designed to own the Google SERP.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
             {[
               { icon: Target, title: "City Pages", desc: "80+ unique city landing pages per state" },
               { icon: MousePointer2, title: "Topic Hubs", desc: "20+ deep-dive mortgage educational guides" },
               { icon: Layout, title: "Technical SEO", desc: "Automated JSON-LD Schema & XML sitemaps" },
               { icon: Rocket, title: "Index Pinging", desc: "Instant indexing requests to Google & Bing" }
             ].map((item, i) => (
               <div key={i} className="p-8 bg-gray-900/20 border border-gray-900 rounded-3xl hover:border-gray-800 transition-all text-left group">
                 <item.icon className="w-10 h-10 text-blue-500 mb-6 transition-transform group-hover:scale-110" />
                 <h4 className="text-lg font-black text-white mb-2">{item.title}</h4>
                 <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-900 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white fill-current" />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Codexel.ai</span>
               </div>
               <p className="text-gray-500 text-sm font-medium max-w-xs">
                 The future of high-scale AI website deployment is here. 
                 Powering the world's most advanced lending networks.
               </p>
            </div>
            
            <div className="flex gap-12 text-sm font-bold uppercase tracking-widest text-gray-500">
               <a href="/factory" className="hover:text-blue-500 transition-colors">Factory</a>
               <a href="/deploy" className="hover:text-blue-500 transition-colors">Pipeline</a>
               <a href="/sites" className="hover:text-blue-500 transition-colors">Dashboard</a>
            </div>
          </div>
          
          <div className="border-t border-gray-900 mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
            <p>&copy; 2026 Codexel.ai. All rights reserved.</p>
            <div className="flex gap-10">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
