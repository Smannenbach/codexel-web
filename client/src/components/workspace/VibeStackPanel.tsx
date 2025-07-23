import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Zap, 
  BarChart3, 
  DollarSign, 
  Clock,
  TrendingUp,
  MessageSquare,
  Rocket,
  Settings,
  Play,
  Pause,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketingStack } from '@shared/marketing-stacks';

interface VibeStackPanelProps {
  projectId: number;
  projectName: string;
  activeStacks: string[];
  availableStacks: MarketingStack[];
  onActivateStack: (stackId: string) => void;
  onDeactivateStack: (stackId: string) => void;
}

interface StackMetrics {
  stackId: string;
  name: string;
  isActive: boolean;
  performance: {
    leadsGenerated: number;
    engagementRate: number;
    conversion: number;
    roi: number;
  };
  automationStatus: 'running' | 'paused' | 'setup';
}

export default function VibeStackPanel({ 
  projectId,
  projectName, 
  activeStacks, 
  availableStacks,
  onActivateStack,
  onDeactivateStack 
}: VibeStackPanelProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock metrics for demonstration
  const stackMetrics: StackMetrics[] = [
    {
      stackId: 'ai-blog-writer',
      name: 'AI Blog Writer Pro',
      isActive: activeStacks.includes('ai-blog-writer'),
      performance: {
        leadsGenerated: 47,
        engagementRate: 68,
        conversion: 12,
        roi: 340
      },
      automationStatus: 'running'
    },
    {
      stackId: 'ai-social-media',
      name: 'AI Social Media Manager',
      isActive: activeStacks.includes('ai-social-media'),
      performance: {
        leadsGenerated: 23,
        engagementRate: 45,
        conversion: 8,
        roi: 220
      },
      automationStatus: 'running'
    },
    {
      stackId: 'ai-emailer',
      name: 'AI Email Marketer',
      isActive: activeStacks.includes('ai-emailer'),
      performance: {
        leadsGenerated: 31,
        engagementRate: 72,
        conversion: 15,
        roi: 280
      },
      automationStatus: 'running'
    }
  ];

  const totalMetrics = stackMetrics.reduce((total, stack) => ({
    leads: total.leads + (stack.isActive ? stack.performance.leadsGenerated : 0),
    avgEngagement: total.avgEngagement + (stack.isActive ? stack.performance.engagementRate : 0),
    avgConversion: total.avgConversion + (stack.isActive ? stack.performance.conversion : 0),
    totalROI: total.totalROI + (stack.isActive ? stack.performance.roi : 0)
  }), { leads: 0, avgEngagement: 0, avgConversion: 0, totalROI: 0 });

  const activeStackCount = activeStacks.length;

  return (
    <div className="w-full h-full bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Marketing Vibe Stack</h2>
              <p className="text-sm text-muted-foreground">
                Autonomous marketing automation for {projectName}
              </p>
            </div>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            {activeStackCount} Active
          </Badge>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex flex-col h-[calc(100%-100px)]">
        <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stacks">Vibe Stacks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <div className="flex-1 p-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-2xl font-bold">{totalMetrics.leads}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Leads This Month</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-2xl font-bold">{Math.round(totalMetrics.avgEngagement / activeStackCount || 0)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Engagement</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Zap className="w-5 h-5" />
                    <span className="text-2xl font-bold">{Math.round(totalMetrics.avgConversion / activeStackCount || 0)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-600">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-2xl font-bold">{Math.round(totalMetrics.totalROI / activeStackCount || 0)}%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Stacks Status */}
            <Card>
              <CardHeader>
                <CardTitle>Active Marketing Automation</CardTitle>
                <CardDescription>Your AI marketing team is working 24/7</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stackMetrics.filter(stack => stack.isActive).map((stack) => (
                    <div key={stack.stackId} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{stack.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {stack.performance.leadsGenerated} leads • {stack.performance.engagementRate}% engagement
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">Running</Badge>
                    </div>
                  ))}
                  {activeStackCount === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Rocket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No active Vibe Stacks</p>
                      <p className="text-sm">Activate stacks to start automated marketing</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stacks" className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {availableStacks.map((stack) => {
                  const isActive = activeStacks.includes(stack.id);
                  const metrics = stackMetrics.find(m => m.stackId === stack.id);
                  
                  return (
                    <motion.div
                      key={stack.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={cn(
                        "cursor-pointer transition-all",
                        isActive && "ring-2 ring-primary bg-primary/5"
                      )}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{stack.icon}</span>
                                <div>
                                  <h3 className="text-lg font-semibold">{stack.name}</h3>
                                  <p className="text-sm text-muted-foreground">{stack.description}</p>
                                </div>
                              </div>
                              
                              {metrics && isActive && (
                                <div className="grid grid-cols-3 gap-4 mt-4 p-3 rounded-lg bg-muted/30">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{metrics.performance.leadsGenerated}</div>
                                    <div className="text-xs text-muted-foreground">Leads</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{metrics.performance.engagementRate}%</div>
                                    <div className="text-xs text-muted-foreground">Engagement</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{metrics.performance.roi}%</div>
                                    <div className="text-xs text-muted-foreground">ROI</div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              <div className="text-2xl font-bold mb-2">${stack.price}/mo</div>
                              <Switch
                                checked={isActive}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    onActivateStack(stack.id);
                                  } else {
                                    onDeactivateStack(stack.id);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Track your AI marketing performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Analytics Dashboard</p>
                    <p className="text-sm">Real-time performance tracking coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>Configure your AI marketing automation preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-approve content</h4>
                      <p className="text-sm text-muted-foreground">Let AI publish content automatically</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Lead notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified of new leads immediately</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Performance reports</h4>
                      <p className="text-sm text-muted-foreground">Weekly email performance summary</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}