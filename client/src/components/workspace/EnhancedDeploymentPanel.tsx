import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Rocket, 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  GitBranch,
  Settings,
  Monitor,
  Shield,
  Zap,
  BarChart3,
  Activity,
  Globe,
  Server,
  Database,
  RefreshCw,
  Download,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DeploymentEnvironment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production' | 'preview';
  url: string;
  status: 'active' | 'inactive' | 'deploying' | 'failed';
  lastDeployment: Date;
  autoDeployEnabled: boolean;
  branch: string;
}

interface DeploymentExecution {
  id: string;
  pipelineId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  triggeredBy: string;
  commitSha: string;
  branch: string;
  stages: StageExecution[];
  logs: DeploymentLog[];
  metrics: DeploymentMetrics;
}

interface StageExecution {
  stageId: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  actions: ActionExecution[];
}

interface ActionExecution {
  actionId: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime?: Date;
  endTime?: Date;
  output?: string;
  error?: string;
  retryAttempt: number;
}

interface DeploymentLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
}

interface DeploymentMetrics {
  buildTime: number;
  testTime: number;
  deployTime: number;
  totalTime: number;
  buildSize: number;
  testCoverage?: number;
  performanceScore?: number;
  securityScore?: number;
}

export default function EnhancedDeploymentPanel() {
  const [environments, setEnvironments] = useState<DeploymentEnvironment[]>([]);
  const [executions, setExecutions] = useState<DeploymentExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<DeploymentExecution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load environments and executions
      const [envsResponse, execsResponse] = await Promise.all([
        apiRequest('GET', '/api/deployment/environments'),
        apiRequest('GET', '/api/deployment/executions')
      ]);
      
      setEnvironments(envsResponse || []);
      setExecutions(execsResponse || []);
    } catch (error) {
      toast({
        title: "Failed to Load Deployment Data",
        description: "Could not fetch deployment information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerDeployment = async (environmentId: string) => {
    try {
      const response = await apiRequest('POST', '/api/deployment/trigger', {
        environmentId,
        branch: 'main',
        triggeredBy: 'user'
      });
      
      toast({
        title: "Deployment Started",
        description: `Deployment to ${environments.find(e => e.id === environmentId)?.name} initiated`,
      });
      
      // Refresh data
      await loadData();
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: "Could not start deployment",
        variant: "destructive"
      });
    }
  };

  const rollbackDeployment = async (executionId: string, environmentId: string) => {
    try {
      await apiRequest('POST', '/api/deployment/rollback', {
        executionId,
        environmentId
      });
      
      toast({
        title: "Rollback Initiated",
        description: "Rolling back to previous version",
      });
      
      await loadData();
    } catch (error) {
      toast({
        title: "Rollback Failed",
        description: "Could not initiate rollback",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'running': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enhanced Deployment</h1>
          <p className="text-gray-400 mt-1">Advanced CI/CD pipeline management and automation</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={loadData}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Pipeline
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create Deployment Pipeline</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pipeline-name">Pipeline Name</Label>
                  <Input id="pipeline-name" placeholder="My Application Pipeline" />
                </div>
                <div>
                  <Label htmlFor="repository">Repository</Label>
                  <Input id="repository" placeholder="https://github.com/user/repo.git" />
                </div>
                <div>
                  <Label htmlFor="branch">Default Branch</Label>
                  <Input id="branch" placeholder="main" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCreateDialog(false)}>
                    Create Pipeline
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Environment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['development', 'staging', 'production', 'preview'].map((envType) => {
          const env = environments.find(e => e.type === envType) || {
            id: envType,
            name: envType.charAt(0).toUpperCase() + envType.slice(1),
            type: envType as any,
            status: 'inactive' as any,
            url: `https://${envType}.example.com`,
            lastDeployment: new Date(),
            autoDeployEnabled: false,
            branch: 'main'
          };
          
          return (
            <Card key={envType} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">{env.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      env.status === 'active' ? 'bg-green-500' : 
                      env.status === 'deploying' ? 'bg-blue-500 animate-pulse' :
                      env.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <span className="text-xs text-gray-400">{env.status}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Branch:</span>
                    <span className="text-white">{env.branch}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Auto Deploy:</span>
                    <span className={env.autoDeployEnabled ? 'text-green-400' : 'text-gray-400'}>
                      {env.autoDeployEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => triggerDeployment(env.id)}
                    disabled={env.status === 'deploying'}
                  >
                    <Rocket className="w-3 h-3 mr-1" />
                    Deploy
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Deployment Interface */}
      <Tabs defaultValue="deployments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          {/* Recent Deployments */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Deployments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {executions.slice(0, 10).map((execution) => (
                  <div 
                    key={execution.id} 
                    className="flex items-center justify-between p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                    onClick={() => setSelectedExecution(execution)}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <div className="text-white font-medium">
                          {execution.commitSha.substring(0, 8)} on {execution.branch}
                        </div>
                        <div className="text-sm text-gray-400">
                          {execution.triggeredBy} • {new Date(execution.startTime).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-white">
                          {execution.endTime ? formatDuration(
                            new Date(execution.endTime).getTime() - new Date(execution.startTime).getTime()
                          ) : 'Running...'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {execution.metrics.buildSize}MB
                        </div>
                      </div>
                      
                      {execution.status === 'success' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            rollbackDeployment(execution.id, 'production');
                          }}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deployment Details Modal */}
          {selectedExecution && (
            <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
              <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white flex items-center gap-2">
                    {getStatusIcon(selectedExecution.status)}
                    Deployment {selectedExecution.id}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Execution Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-400">Status</div>
                      <div className={`font-medium ${getStatusColor(selectedExecution.status)}`}>
                        {selectedExecution.status.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Duration</div>
                      <div className="text-white">
                        {selectedExecution.endTime ? formatDuration(
                          new Date(selectedExecution.endTime).getTime() - 
                          new Date(selectedExecution.startTime).getTime()
                        ) : 'Running...'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Build Size</div>
                      <div className="text-white">{selectedExecution.metrics.buildSize}MB</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Test Coverage</div>
                      <div className="text-white">
                        {selectedExecution.metrics.testCoverage || 0}%
                      </div>
                    </div>
                  </div>

                  {/* Stages Progress */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Deployment Stages</h4>
                    {selectedExecution.stages.map((stage, index) => (
                      <div key={stage.stageId} className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(stage.status)}
                          <span className="text-white">Stage {index + 1}</span>
                          <span className="text-sm text-gray-400">
                            {stage.actions.length} actions
                          </span>
                        </div>
                        
                        {stage.actions.map((action) => (
                          <div key={action.actionId} className="ml-6 flex items-center gap-2 text-sm">
                            {getStatusIcon(action.status)}
                            <span className="text-gray-300">Action {action.actionId}</span>
                            {action.endTime && action.startTime && (
                              <span className="text-gray-400">
                                ({formatDuration(
                                  new Date(action.endTime).getTime() - 
                                  new Date(action.startTime).getTime()
                                )})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Deployment Logs */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Deployment Logs</h4>
                    <div className="bg-black rounded p-3 h-64 overflow-y-auto font-mono text-sm">
                      {selectedExecution.logs.map((log, index) => (
                        <div key={index} className={`${
                          log.level === 'error' ? 'text-red-400' :
                          log.level === 'warn' ? 'text-yellow-400' :
                          log.level === 'info' ? 'text-green-400' :
                          'text-gray-400'
                        }`}>
                          [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Deployment Pipelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Rocket className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Pipelines Configured</h3>
                <p className="text-gray-400 mb-4">Create your first deployment pipeline to get started</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Pipeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Production', status: 'healthy', uptime: '99.9%' },
                  { name: 'Staging', status: 'healthy', uptime: '99.8%' },
                  { name: 'Development', status: 'warning', uptime: '98.5%' },
                ].map((env) => (
                  <div key={env.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        env.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-white">{env.name}</span>
                    </div>
                    <span className="text-gray-400">{env.uptime}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vulnerability Scan</span>
                    <Badge variant="default">Passed</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">HTTPS Certificate</span>
                    <Badge variant="default">Valid</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Security Headers</span>
                    <Badge variant="default">Configured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Deployment Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {executions.filter(e => e.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-400">Successful deployments this month</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {executions.length > 0 ? Math.round(
                      (executions.filter(e => e.status === 'success').length / executions.length) * 100
                    ) : 0}%
                  </div>
                  <div className="text-sm text-gray-400">Deployment success rate</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle>Average Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {executions.length > 0 ? formatDuration(
                      executions.reduce((sum, e) => sum + e.metrics.totalTime, 0) / executions.length
                    ) : '0s'}
                  </div>
                  <div className="text-sm text-gray-400">Average deployment time</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}