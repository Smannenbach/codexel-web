import { useState, useEffect } from 'react';
import { WorkspaceLayout } from '@/components/workspace/WorkspaceLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, Code, Palette, Users, Rocket, Star, TrendingUp, Globe, Shield } from 'lucide-react';
import { useNavigate } from 'wouter';

interface Feature {
  icon: any;
  title: string;
  description: string;
  color: string;
}

interface Statistic {
  label: string;
  value: string;
  change?: string;
  icon: any;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: '8 AI Models',
    description: 'GPT-4, Claude, Gemini, Grok-2, and more',
    color: 'text-purple-500'
  },
  {
    icon: Users,
    title: 'AI Agent Teams',
    description: 'Specialized agents working together',
    color: 'text-blue-500'
  },
  {
    icon: Code,
    title: 'Full-Stack Development',
    description: 'Frontend, backend, and database',
    color: 'text-green-500'
  },
  {
    icon: Rocket,
    title: 'Deploy Anywhere',
    description: 'One-click deployment to production',
    color: 'text-orange-500'
  }
];

const statistics: Statistic[] = [
  {
    label: 'Projects Created',
    value: '1,234',
    change: '+12%',
    icon: TrendingUp
  },
  {
    label: 'AI Interactions',
    value: '45.6K',
    change: '+23%',
    icon: Zap
  },
  {
    label: 'Active Users',
    value: '892',
    change: '+8%',
    icon: Users
  },
  {
    label: 'Success Rate',
    value: '94%',
    change: '+2%',
    icon: Star
  }
];

export default function Home() {
  const [, navigate] = useNavigate();
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const handleCreateProject = async () => {
    setIsCreatingProject(true);
    // Simulate project creation
    setTimeout(() => {
      setShowWorkspace(true);
    }, 1500);
  };

  if (showWorkspace) {
    return <WorkspaceLayout />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 -z-10" />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered Development Platform
            </Badge>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Build Complete Apps with AI Teams
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Codexel.ai brings together 8 powerful AI models working as specialized development teams. 
              From idea to deployment in minutes, not months.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleCreateProject}
                disabled={isCreatingProject}
                className="min-w-[200px]"
              >
                {isCreatingProject ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Start Building Now
                  </>
                )}
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/demo')}
              >
                <Globe className="w-4 h-4 mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className={`w-8 h-8 ${feature.color} mb-2`} />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{stat.value}</span>
                    {stat.change && (
                      <Badge variant="secondary" className="text-green-600">
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Enterprise-Ready Security</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base">
              Your code and data are protected with industry-standard encryption. 
              SOC 2 compliant infrastructure with 99.9% uptime guarantee.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}