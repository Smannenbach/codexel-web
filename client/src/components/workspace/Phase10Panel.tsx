// Phase 10 Advanced AI Orchestration Panel
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Zap, 
  Cpu, 
  Activity, 
  TrendingUp, 
  Target, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Lightbulb,
  Workflow
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ModelAnalytics {
  model: {
    id: string;
    name: string;
    provider: string;
    type: string;
  };
  currentMetrics: {
    averageLatency: number;
    successRate: number;
    qualityScore: number;
    costPerRequest: number;
    requests: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  totalRequests: number;
  recommendation: string;
}

interface ResourceMetrics {
  cpu: { usage: number; available: number; efficiency: number; };
  memory: { usage: number; available: number; efficiency: number; };
  network: { usage: number; available: number; efficiency: number; };
  storage: { usage: number; available: number; efficiency: number; };
}

interface AutonomousTask {
  id: string;
  type: string;
  priority: string;
  description: string;
  status: string;
  progress: number;
  assignedAgent?: string;
  estimatedComplexity: number;
  estimatedTime: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface AutonomousAgent {
  id: string;
  name: string;
  specialization: string;
  status: string;
  skillLevel: number;
  experience: {
    tasksCompleted: number;
    successRate: number;
    averageQuality: number;
  };
  performance: {
    efficiency: number;
    accuracy: number;
    innovation: number;
    collaboration: number;
  };
  currentTask?: string;
}

interface SelfImprovementMetrics {
  learningRate: number;
  adaptationSpeed: number;
  innovationIndex: number;
  collaborationEfficiency: number;
  qualityImprovement: number;
  efficiencyGains: number;
}

export function Phase10Panel() {
  const [modelAnalytics, setModelAnalytics] = useState<ModelAnalytics[]>([]);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics | null>(null);
  const [autonomousTasks, setAutonomousTasks] = useState<AutonomousTask[]>([]);
  const [autonomousAgents, setAutonomousAgents] = useState<AutonomousAgent[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SelfImprovementMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analytics, resources, tasks, agents, metrics] = await Promise.all([
        apiRequest('GET', '/api/ai/models/analytics'),
        apiRequest('GET', '/api/resources/metrics'),
        apiRequest('GET', '/api/autonomous/tasks'),
        apiRequest('GET', '/api/autonomous/agents'),
        apiRequest('GET', '/api/autonomous/metrics')
      ]);

      setModelAnalytics(analytics);
      setResourceMetrics(resources);
      setAutonomousTasks(tasks);
      setAutonomousAgents(agents);
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const createTask = async (taskData: Partial<AutonomousTask>) => {
    setLoading(true);
    try {
      const task = await apiRequest('POST', '/api/autonomous/tasks', taskData);
      setAutonomousTasks(prev => [task, ...prev]);
      toast({
        title: "Task Created",
        description: `${taskData.type} task created successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async (agentId: string, action: 'pause' | 'resume') => {
    try {
      await apiRequest('POST', `/api/autonomous/agents/${agentId}/${action}`);
      await loadDashboardData();
      toast({
        title: `Agent ${action === 'pause' ? 'Paused' : 'Resumed'}`,
        description: `Agent ${agentId} has been ${action === 'pause' ? 'paused' : 'resumed'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} agent`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-blue-500';
      case 'idle': return 'bg-green-500';
      case 'learning': return 'bg-purple-500';
      case 'blocked': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Phase 10: AI Orchestration</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-models">AI Models</TabsTrigger>
            <TabsTrigger value="autonomous">Autonomous</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {/* System Health Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <p className="text-xs text-gray-500">All systems operational</p>
                  </CardContent>
                </Card>

                {/* Active Tasks Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Workflow className="w-4 h-4" />
                      Active Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {autonomousTasks.filter(t => t.status === 'in-progress').length}
                    </div>
                    <p className="text-xs text-gray-500">
                      {autonomousTasks.filter(t => t.status === 'pending').length} pending
                    </p>
                  </CardContent>
                </Card>

                {/* AI Efficiency Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      AI Efficiency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {systemMetrics ? Math.round(systemMetrics.efficiencyGains) : 0}%
                    </div>
                    <p className="text-xs text-gray-500">Improvement over baseline</p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              {systemMetrics && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Self-Improvement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Rate</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={systemMetrics.learningRate} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(systemMetrics.learningRate)}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Adaptation Speed</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={systemMetrics.adaptationSpeed} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(systemMetrics.adaptationSpeed)}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Innovation Index</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={systemMetrics.innovationIndex} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(systemMetrics.innovationIndex)}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Collaboration</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={systemMetrics.collaborationEfficiency} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(systemMetrics.collaborationEfficiency)}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Improvement</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={Math.max(0, systemMetrics.qualityImprovement + 50)} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(systemMetrics.qualityImprovement)}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency Gains</label>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={Math.max(0, systemMetrics.efficiencyGains + 50)} className="flex-1" />
                          <span className="text-sm font-medium">{Math.round(systemMetrics.efficiencyGains)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => createTask({
                        type: 'optimization',
                        priority: 'medium',
                        description: 'Optimize system performance',
                        estimatedComplexity: 6
                      })}
                      disabled={loading}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Optimize
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => createTask({
                        type: 'testing',
                        priority: 'high',
                        description: 'Run comprehensive tests',
                        estimatedComplexity: 5
                      })}
                      disabled={loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => createTask({
                        type: 'bug-fix',
                        priority: 'high',
                        description: 'Scan and fix issues',
                        estimatedComplexity: 7
                      })}
                      disabled={loading}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Debug
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => createTask({
                        type: 'feature-development',
                        priority: 'medium',
                        description: 'Develop new feature',
                        estimatedComplexity: 8
                      })}
                      disabled={loading}
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Innovate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>

          {/* AI Models Tab */}
          <TabsContent value="ai-models" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {modelAnalytics.map((analytics) => (
                  <Card key={analytics.model.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{analytics.model.name}</CardTitle>
                          <CardDescription>{analytics.model.provider}</CardDescription>
                        </div>
                        <Badge variant={analytics.trend === 'improving' ? 'default' : 
                                      analytics.trend === 'stable' ? 'secondary' : 'destructive'}>
                          {analytics.trend}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Latency</label>
                          <div className="text-sm font-medium">{analytics.currentMetrics.averageLatency}ms</div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Success Rate</label>
                          <div className="text-sm font-medium">{(analytics.currentMetrics.successRate * 100).toFixed(1)}%</div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Quality</label>
                          <div className="text-sm font-medium">{analytics.currentMetrics.qualityScore.toFixed(1)}/10</div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Requests</label>
                          <div className="text-sm font-medium">{analytics.totalRequests.toLocaleString()}</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{analytics.recommendation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Autonomous Tab */}
          <TabsContent value="autonomous" className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Autonomous Agents & Tasks</h3>
                  <div className="text-sm text-gray-500">
                    {autonomousAgents.filter(a => a.status === 'working').length} working, {' '}
                    {autonomousAgents.filter(a => a.status === 'idle').length} idle
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {/* Agents */}
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Autonomous Agents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {autonomousAgents.map((agent) => (
                          <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agent.status)}`} />
                              <div>
                                <div className="font-medium">{agent.name}</div>
                                <div className="text-sm text-gray-500 capitalize">{agent.specialization}</div>
                                <div className="text-xs text-gray-400">
                                  Skill: {agent.skillLevel}% | Success: {(agent.experience.successRate * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {agent.status === 'working' ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => toggleAgent(agent.id, 'pause')}
                                >
                                  <Pause className="w-3 h-3" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => toggleAgent(agent.id, 'resume')}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Tasks */}
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <Workflow className="w-5 h-5" />
                      Active Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                      <div className="space-y-3">
                        {autonomousTasks.slice(0, 10).map((task) => (
                          <div key={task.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(task.status)}
                                <span className="font-medium capitalize">{task.type}</span>
                                <Badge variant="outline" className="text-xs">
                                  {task.priority}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500">
                                {task.estimatedTime}min
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {task.description}
                            </p>
                            {task.status === 'in-progress' && (
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Progress</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <Progress value={task.progress} className="h-1" />
                              </div>
                            )}
                            {task.assignedAgent && (
                              <div className="text-xs text-gray-500 mt-2">
                                Assigned to: {task.assignedAgent}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              {resourceMetrics && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Cpu className="w-5 h-5" />
                        Resource Utilization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">CPU</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={resourceMetrics.cpu.usage} className="flex-1" />
                            <span className="text-sm font-medium">{resourceMetrics.cpu.usage.toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Efficiency: {resourceMetrics.cpu.efficiency.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Memory</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={resourceMetrics.memory.usage} className="flex-1" />
                            <span className="text-sm font-medium">{resourceMetrics.memory.usage.toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Efficiency: {resourceMetrics.memory.efficiency.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Network</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={resourceMetrics.network.usage} className="flex-1" />
                            <span className="text-sm font-medium">{resourceMetrics.network.usage.toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Efficiency: {resourceMetrics.network.efficiency.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage</label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={resourceMetrics.storage.usage} className="flex-1" />
                            <span className="text-sm font-medium">{resourceMetrics.storage.usage.toFixed(1)}%</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Efficiency: {resourceMetrics.storage.efficiency.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}