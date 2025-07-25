import { useState, useRef, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, 
  Upload, 
  Paperclip, 
  Image as ImageIcon,
  Code2,
  User,
  Bot,
  Loader2,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Brain,
  Sparkles,
  Zap,
  CircleCheckBig,
  Share2,
  BarChart,
  MessageSquare,
  Save,
  History,
  Eye,
  BarChart3,
  Settings,
  X,
  Volume2,
  Users,
  Rocket as RocketIcon,
  GitBranch
} from 'lucide-react';
import { AI_MODELS } from '@/lib/ai-models';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Agent, Message } from '@shared/schema';
import { audioManager } from '@/services/AudioManager';
import ShareLayoutButton from './ShareLayoutButton';
import AnalyticsDashboard from './AnalyticsDashboard';
import AISalesAgent from './AISalesAgent';
import ProductionOptimizer from './ProductionOptimizer';
import { AdvancedAnalytics, DeploymentManager, TestWorkflows, PerformanceMonitor, SecurityMonitor, DeploymentCentral, preloadCriticalComponents } from '../lazy/LazyComponents';
import MobileAppGenerator from '@/components/workspace/MobileAppGenerator';
import EnterpriseAnalyticsPanel from './EnterpriseAnalyticsPanel';
import EnhancedDeploymentPanel from './EnhancedDeploymentPanel';
import OnboardingGuide, { useOnboarding } from './OnboardingGuide';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { projectTemplates } from '@shared/templates';
import { marketingStacks } from '@shared/marketing-stacks';
import { WorkspaceSnapshots } from './WorkspaceSnapshots';
import OneClickSnapshot, { useSnapshotShortcuts } from './OneClickSnapshot';
import { AudioSettings } from '@/components/ui/audio-settings';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';
import { AdvancedCodeGeneration } from './AdvancedCodeGeneration';
import AutonomousAgentPanel from './AutonomousAgentPanel';
import CollaborationPanel from './CollaborationPanel';
import EnterpriseDeploymentPanel from './EnterpriseDeploymentPanel';
import { Phase10Panel } from './Phase10Panel';
import { Phase11Panel } from './Phase11Panel';

interface ThreePanelWorkspaceProps {
  projectId: number;
  agents: Agent[];
  messages: Message[];
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
}

// Agent role definitions
const AGENT_TYPES = {
  'project-manager': { 
    name: 'Project Manager', 
    icon: Brain, 
    color: 'text-purple-500',
    description: 'Creating master checklist and coordinating team'
  },
  'architect': { 
    name: 'Solution Architect', 
    icon: Sparkles, 
    color: 'text-blue-500',
    description: 'Designing scalable microservices architecture'
  },
  'ux-designer': { 
    name: 'UX/UI Designer', 
    icon: Zap, 
    color: 'text-pink-500',
    description: 'Creating beautiful, user-friendly interfaces'
  },
  'frontend': { 
    name: 'Frontend Dev', 
    icon: Code2, 
    color: 'text-green-500',
    description: 'Building responsive React components'
  },
  'backend': { 
    name: 'Backend Dev', 
    icon: Code2, 
    color: 'text-orange-500',
    description: 'Setting up secure API endpoints'
  }
};

export default function ThreePanelWorkspace({ 
  projectId, 
  agents = [], 
  messages = [], 
  onSendMessage 
}: ThreePanelWorkspaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');
  const [isLoading, setIsLoading] = useState(false);
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [panelSizes, setPanelSizes] = useState<number[]>([20, 45, 35]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAISalesAgent, setShowAISalesAgent] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showAdvancedCodeGen, setShowAdvancedCodeGen] = useState(false);
  const [showAutonomousAgents, setShowAutonomousAgents] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showEnterpriseDeployment, setShowEnterpriseDeployment] = useState(false);
  const [showMobileAppGenerator, setShowMobileAppGenerator] = useState(false);
  const [showEnterpriseAnalytics, setShowEnterpriseAnalytics] = useState(false);
  const [showEnhancedDeployment, setShowEnhancedDeployment] = useState(false);
  const [showPhase10Panel, setShowPhase10Panel] = useState(false);
  const [showPhase11Panel, setShowPhase11Panel] = useState(false);
  const audioFeedback = useAudioFeedback();
  const [lastPanelFocus, setLastPanelFocus] = useState<{ panel: string; time: number } | null>(null);
  const [snapIndicators, setSnapIndicators] = useState<number[]>([]);
  const [activeSnapLine, setActiveSnapLine] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { showOnboarding, setShowOnboarding, completeOnboarding } = useOnboarding();
  
  const userId = 1; // TODO: Get from authenticated user
  
  // Snap points for common layouts
  const SNAP_POINTS = [20, 25, 33.33, 40, 50, 60, 66.67, 75, 80];
  const SNAP_THRESHOLD = 2; // Snap within 2% of target
  
  // Default agents to show when no agents are loaded
  const defaultAgents: Agent[] = [
    {
      id: 1,
      projectId,
      name: 'Project Manager',
      role: 'project-manager',
      description: 'Coordinates team and manages project roadmap',
      status: 'active',
      currentTask: 'Creating project roadmap and coordinating team tasks',
      model: 'gpt-4-turbo',
      color: 'text-purple-500',
      icon: null,
      config: {},
      progress: 35,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      projectId,
      name: 'Solution Architect',
      role: 'architect',
      description: 'Designs scalable system architecture',
      status: 'active',
      currentTask: 'Designing system architecture and API structure',
      model: 'claude-3-5-sonnet',
      color: 'text-blue-500',
      icon: null,
      config: {},
      progress: 45,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      projectId,
      name: 'UX Designer',
      role: 'ux-designer',
      description: 'Creates user-friendly interfaces',
      status: 'idle',
      currentTask: 'Waiting for architecture approval',
      model: 'gpt-4-turbo',
      color: 'text-pink-500',
      icon: null,
      config: {},
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      projectId,
      name: 'Frontend Dev',
      role: 'frontend',
      description: 'Builds responsive React components',
      status: 'idle',
      currentTask: 'Ready to implement UI components',
      model: 'gpt-4-turbo',
      color: 'text-green-500',
      icon: null,
      config: {},
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 5,
      projectId,
      name: 'Backend Dev',
      role: 'backend',
      description: 'Sets up secure API endpoints',
      status: 'idle',
      currentTask: 'Preparing API endpoints',
      model: 'claude-3-5-sonnet',
      color: 'text-orange-500',
      icon: null,
      config: {},
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Agent[];
  
  const [activeAgents, setActiveAgents] = useState<Agent[]>(agents.length > 0 ? agents : defaultAgents);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Workspace state for snapshots
  const getCurrentWorkspaceState = () => ({
    panelSizes,
    previewDevice,
    selectedModel,
    messages: messages.slice(-10), // Keep last 10 messages
    agents: activeAgents,
    lastPanelFocus,
    projectId,
    timestamp: new Date().toISOString(),
    attachments: attachments.length,
    inputValue: inputValue.length > 0 ? inputValue : null
  });

  // Latest snapshot for quick restore
  const [latestSnapshotId, setLatestSnapshotId] = useState<number | null>(null);

  // Quick save function for shortcuts
  const handleQuickSave = async () => {
    try {
      const workspaceState = getCurrentWorkspaceState();
      const timestamp = new Date().toLocaleString();
      
      const response = await apiRequest('POST', '/api/snapshots', {
        projectId,
        name: `Quick Save ${timestamp}`,
        description: 'Keyboard shortcut save (Ctrl+S)',
        snapshotData: workspaceState,
        tags: ['quick-save', 'keyboard-shortcut'],
        isAutoSaved: false
      });

      setLatestSnapshotId(response.snapshot.id);
      toast({
        title: "Workspace Saved!",
        description: "Press Ctrl+R to restore this snapshot",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save workspace",
        variant: "destructive",
      });
    }
  };

  // Quick restore function for shortcuts
  const handleQuickRestore = async () => {
    if (!latestSnapshotId) {
      toast({
        title: "No Snapshot to Restore",
        description: "Save a snapshot first with Ctrl+S",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/snapshots/restore', { 
        snapshotId: latestSnapshotId, 
        projectId 
      });

      if (response.snapshot) {
        const snapshot = response.snapshot;
        if (snapshot.panelSizes) setPanelSizes(snapshot.panelSizes);
        if (snapshot.previewDevice) setPreviewDevice(snapshot.previewDevice);
        if (snapshot.selectedModel) setSelectedModel(snapshot.selectedModel);
        
        toast({
          title: "Workspace Restored!",
          description: "Your workspace has been restored successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Restore Failed",
        description: "Could not restore workspace",
        variant: "destructive",
      });
    }
  };

  // Add keyboard shortcuts
  useSnapshotShortcuts(handleQuickSave, handleQuickRestore);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (!isAutoSaving && messages.length > 0) {
        setIsAutoSaving(true);
        try {
          const workspaceState = {
            panelSizes,
            previewDevice,
            selectedModel,
            messages: messages.slice(-5), // Keep last 5 messages for auto-save
            agents: activeAgents,
            lastPanelFocus,
            projectId,
            timestamp: new Date().toISOString()
          };

          await apiRequest('POST', '/api/snapshots/auto-save', {
            projectId,
            snapshotData: workspaceState
          });

          setLastAutoSave(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [messages, panelSizes, previewDevice, selectedModel, activeAgents, lastPanelFocus, projectId, isAutoSaving]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    audioManager.playMessageSend();
    setIsLoading(true);
    try {
      // Use multimodal endpoint if attachments exist
      if (attachments.length > 0) {
        const formData = new FormData();
        formData.append('content', inputValue);
        formData.append('projectId', projectId.toString());
        formData.append('model', selectedModel);
        
        attachments.forEach(file => {
          formData.append('files', file);
        });
        
        const response = await fetch('/api/chat/multimodal', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        
        const data = await response.json();
        if (onSendMessage) {
          await onSendMessage(data.content, []);
        }
      } else {
        await onSendMessage(inputValue, []);
      }
      
      // Track analytics
      await apiRequest('POST', '/api/analytics/track', {
        userId,
        projectId,
        event: 'message_sent',
        data: { 
          model: selectedModel,
          hasAttachments: attachments.length > 0
        }
      });
      
      setInputValue('');
      setAttachments([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-[375px] mx-auto';
      case 'tablet':
        return 'max-w-[768px] mx-auto';
      default:
        return 'w-full';
    }
  };

  // Load and save panel configuration with loading state
  useEffect(() => {
    const loadWorkspaceConfig = async () => {
      // Add a small delay to ensure styles are loaded and prevent FOUC
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // The autoSaveId handles basic panel sizes, but we can extend it
      const savedConfig = localStorage.getItem('workspace-advanced-config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          // Apply any advanced configuration here
          if (config.previewDevice) setPreviewDevice(config.previewDevice);
          if (config.selectedModel) setSelectedModel(config.selectedModel);
        } catch (e) {
          console.error('Failed to load workspace config:', e);
        }
      }
      
      // Mark workspace as loaded after configuration is applied
      setIsWorkspaceLoaded(true);
    };
    
    loadWorkspaceConfig();
  }, []);

  // Save advanced configuration
  useEffect(() => {
    const config = {
      previewDevice,
      selectedModel,
      timestamp: Date.now(),
    };
    localStorage.setItem('workspace-advanced-config', JSON.stringify(config));
  }, [previewDevice, selectedModel]);
  
  // Simulate agent activity when messages are sent
  useEffect(() => {
    if (isLoading) {
      // Activate agents based on message content
      const updatedAgents = [...activeAgents];
      
      // Activate project manager first
      const pmIndex = updatedAgents.findIndex(a => a.role === 'project-manager');
      if (pmIndex !== -1) {
        updatedAgents[pmIndex] = {
          ...updatedAgents[pmIndex],
          status: 'active',
          currentTask: 'Analyzing requirements and coordinating team',
          progress: 15
        };
        audioManager.playAgentActivated('project-manager');
      }
      
      // Activate architect after a delay
      setTimeout(() => {
        const archIndex = updatedAgents.findIndex(a => a.role === 'architect');
        if (archIndex !== -1) {
          audioManager.playAgentActivated('architect');
          setActiveAgents(prev => {
            const newAgents = [...prev];
            newAgents[archIndex] = {
              ...newAgents[archIndex],
              status: 'active',
              currentTask: 'Designing system architecture',
              progress: 25
            };
            // Update PM progress
            if (pmIndex !== -1) {
              newAgents[pmIndex] = {
                ...newAgents[pmIndex],
                progress: 45
              };
            }
            return newAgents;
          });
        }
      }, 1500);
      
      setActiveAgents(updatedAgents);
    } else {
      // Reset agent status when not loading
      setTimeout(() => {
        setActiveAgents(prev => prev.map(agent => ({
          ...agent,
          status: agent.progress === 100 ? 'completed' : 'idle',
          progress: agent.progress === 100 ? 100 : 0
        })));
      }, 2000);
    }
  }, [isLoading]);

  // Show loading state while workspace is initializing
  if (!isWorkspaceLoaded) {
    return (
      <div className="h-screen max-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Initializing workspace...</p>
          <div className="mt-4 w-32 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="h-screen max-h-screen bg-gray-950 workspace-container loaded overflow-hidden"
      autoSaveId="workspace-layout"
      onLayout={async (sizes) => {
        // Apply snapping logic
        const snappedSizes = sizes.map((size, index) => {
          // Check each snap point
          for (const snapPoint of SNAP_POINTS) {
            if (Math.abs(size - snapPoint) < SNAP_THRESHOLD) {
              // Snap to this point
              if (isResizing) {
                setActiveSnapLine(snapPoint);
                // Vibrate feedback on snap (if supported)
                if ('vibrate' in navigator) {
                  navigator.vibrate(10);
                }
              }
              return snapPoint;
            }
          }
          return size;
        });
        
        // Ensure sizes still sum to 100
        const sum = snappedSizes.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) > 0.1) {
          // Adjust the middle panel to compensate
          snappedSizes[1] = snappedSizes[1] + (100 - sum);
        }
        
        setPanelSizes(snappedSizes);
        
        // Track layout change
        await apiRequest('POST', '/api/analytics/track', {
          userId,
          projectId,
          event: 'layout_change',
          data: { 
            configuration: { autoSaveId: 'workspace-layout' },
            panelSizes: snappedSizes 
          }
        });
      }}
    >
      {/* Left Panel - AI Team Dashboard */}
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="h-full bg-gradient-to-br from-gray-900 to-gray-950 border-r border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">AI Team Dashboard</h2>
                <p className="text-sm text-gray-400">Overall Progress</p>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  onClick={handleQuickSave}
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                  title="Quick Save (Ctrl+S)"
                >
                  <Save className="w-3 h-3" />
                </Button>
                <ShareLayoutButton className="ml-2" />
              </div>
            </div>
            <div className="mt-2 bg-gray-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '41%' }} 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">41%</p>
          </div>
          
          {/* One-Click Snapshot Component */}
          <div className="px-4 py-3 border-b border-gray-800/50">
            <OneClickSnapshot
              projectId={projectId}
              getCurrentWorkspaceState={getCurrentWorkspaceState}
              onRestore={(snapshotData) => {
                if (snapshotData.panelSizes) setPanelSizes(snapshotData.panelSizes);
                if (snapshotData.previewDevice) setPreviewDevice(snapshotData.previewDevice);
                if (snapshotData.selectedModel) setSelectedModel(snapshotData.selectedModel);
              }}
              className="mb-2"
            />
          </div>
          
          <ScrollArea className="h-[calc(100%-180px)] p-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Active Agents ({activeAgents.filter(a => a.status === 'active').length})
              </p>
              
              {activeAgents.map((agent) => {
                const agentType = AGENT_TYPES[agent.role as keyof typeof AGENT_TYPES];
                const isActive = agent.status === 'active';
                
                return (
                  <Card key={agent.id} className={`backdrop-blur-xl bg-white/5 border-white/10 transition-all ${isActive ? 'ring-2 ring-purple-500/50' : ''}`}>
                    <CardContent className="p-2">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-md bg-white/10 ${isActive ? 'animate-pulse' : ''}`}>
                          {agentType && <agentType.icon className={`w-3.5 h-3.5 ${agentType.color}`} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-white">{agent.name}</h4>
                            <Badge 
                              variant={isActive ? 'default' : 'secondary'}
                              className={cn(
                                "text-xs",
                                isActive && "bg-green-500/20 text-green-400 border-green-500/30"
                              )}
                            >
                              {agent.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {agent.currentTask || (agentType ? agentType.description : 'Ready to work')}
                          </p>
                          {isActive && agent.progress !== undefined && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{agent.progress}%</span>
                              </div>
                              <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                  style={{ width: `${agent.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {isActive && (
                            <div className="flex items-center gap-2 mt-2">
                              <Loader2 className="w-3 h-3 animate-spin text-purple-400" />
                              <span className="text-xs text-purple-400">Working...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle 
        withHandle 
        onDragging={(dragging) => {
          setIsResizing(dragging);
          if (!dragging) {
            setActiveSnapLine(null);
          }
        }} 
      />

      {/* Middle Panel - Conversation */}
      <ResizablePanel defaultSize={45} minSize={30}>
        <div className="h-full flex flex-col bg-gray-900">
          <div className="p-4 border-b border-gray-800 backdrop-blur-xl bg-white/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Conversation</h2>
                <p className="text-sm text-gray-400">Chat with GPT-4</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowAISalesAgent(true);
                  }}
                  className="text-purple-400 border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-300"
                  title="AI Sales Assistant"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowAnalytics(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="View Analytics"
                >
                  <BarChart className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowAudioSettings(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Audio Settings"
                >
                  <Volume2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowAdvancedCodeGen(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Advanced Code Generation"
                >
                  <Code2 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowAutonomousAgents(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 7: Autonomous Agents"
                >
                  <Brain className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowCollaboration(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 7: Real-time Collaboration"
                >
                  <Users className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowEnterpriseDeployment(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 7: Enterprise Deployment"
                >
                  <RocketIcon className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowMobileAppGenerator(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 8: Mobile App Generator"
                >
                  <Smartphone className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowEnterpriseAnalytics(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 9: Enterprise Analytics"
                >
                  <BarChart3 className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowPhase10Panel(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 10: AI Orchestration"
                >
                  <Brain className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowPhase11Panel(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 11: Advanced Integration"
                >
                  <Settings className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    audioFeedback.playButtonClick(e.currentTarget);
                    setShowEnhancedDeployment(true);
                  }}
                  className="text-gray-400 hover:text-white"
                  title="Phase 9: Enhanced Deployment"
                >
                  <RocketIcon className="w-5 h-5" />
                </Button>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AI_MODELS).map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {model.provider}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Start Building</h3>
                  <p className="text-sm text-gray-500">Describe what you want to build...</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'bg-blue-600' : 'bg-gray-800'} rounded-lg p-3`}>
                      <p className="text-sm text-white whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-800 rounded-lg p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-800 backdrop-blur-xl bg-white/5">
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {attachments.map((file, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {file.name}
                    <button
                      onClick={() => removeAttachment(index)}
                      className="ml-2 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-white"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Describe what you want to build..."
                className="flex-1 min-h-[40px] max-h-[120px] bg-gray-800 border-gray-700 text-white resize-none"
              />
              <Button 
                onClick={(e) => {
                  audioFeedback.playButtonClick(e.currentTarget);
                  handleSendMessage();
                }} 
                disabled={isLoading || (!inputValue.trim() && attachments.length === 0)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle 
        withHandle 
        onDragging={(dragging) => {
          setIsResizing(dragging);
          if (!dragging) {
            setActiveSnapLine(null);
          }
        }} 
      />

      {/* Right Panel - Preview */}
      <ResizablePanel defaultSize={35} minSize={25}>
        <div className="h-full flex flex-col bg-gray-950">
          <div className="p-4 border-b border-gray-800 backdrop-blur-xl bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-white">Preview</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setPreviewDevice('desktop')}
                  className="h-8 w-8"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setPreviewDevice('tablet')}
                  className="h-8 w-8"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setPreviewDevice('mobile')}
                  className="h-8 w-8"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setShowSnapshots(true)}
                  title="Workspace Snapshots"
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 overflow-hidden">
            <div className={`h-full ${getDeviceStyles()} transition-all duration-300 relative`}>
              {/* Preview iframe - will show generated app */}
              <iframe
                src="/preview"
                className="w-full h-full bg-white rounded-lg"
                title="App Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
                style={{
                  border: previewDevice !== 'desktop' ? '8px solid #1a1a1a' : 'none',
                  borderRadius: previewDevice === 'mobile' ? '24px' : '8px',
                  boxShadow: previewDevice !== 'desktop' ? '0 0 40px rgba(0,0,0,0.5)' : 'none'
                }}
              />
              {/* Building Overlay - Shows when AI is generating */}
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center rounded-lg pointer-events-none"
                  style={{
                    borderRadius: previewDevice === 'mobile' ? '24px' : '8px'
                  }}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
                      <Zap className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">AI is Building Your App</h3>
                    <p className="text-gray-400">The preview will update automatically</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ResizablePanel>
      
      {/* Panel Size Overlay */}
      {isResizing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 shadow-xl border border-purple-500/50">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-gray-300">AI Team:</span>
              <span className="text-white font-mono">{Math.round(panelSizes[0])}%</span>
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-300">Chat:</span>
              <span className="text-white font-mono">{Math.round(panelSizes[1])}%</span>
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-300">Preview:</span>
              <span className="text-white font-mono">{Math.round(panelSizes[2])}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Visual Snap Lines */}
      {isResizing && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Grid lines for common layouts */}
          {SNAP_POINTS.map((snapPoint) => (
            <div
              key={snapPoint}
              className={`absolute top-0 bottom-0 w-px transition-all duration-75 ${
                activeSnapLine === snapPoint 
                  ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' 
                  : 'bg-white/10'
              }`}
              style={{ 
                left: `${snapPoint}%`,
                opacity: activeSnapLine === snapPoint ? 1 : 0.3
              }}
            >
              {activeSnapLine === snapPoint && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md">
                  {Math.round(snapPoint)}%
                </div>
              )}
            </div>
          ))}
          
          {/* Snap indicators for second handle */}
          {SNAP_POINTS.map((snapPoint) => {
            const secondHandlePos = panelSizes[0] + snapPoint;
            if (secondHandlePos < 80) { // Only show if it doesn't push the last panel too small
              return (
                <div
                  key={`second-${snapPoint}`}
                  className={`absolute top-0 bottom-0 w-px transition-all duration-75 ${
                    Math.abs(panelSizes[0] + panelSizes[1] - secondHandlePos) < SNAP_THRESHOLD 
                      ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' 
                      : 'bg-white/10'
                  }`}
                  style={{ 
                    left: `${secondHandlePos}%`,
                    opacity: Math.abs(panelSizes[0] + panelSizes[1] - secondHandlePos) < SNAP_THRESHOLD ? 1 : 0.2
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      )}
      
      {/* Audio Settings Dialog */}
      <Dialog open={showAudioSettings} onOpenChange={setShowAudioSettings}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-purple-500" />
              Audio Settings
            </DialogTitle>
          </DialogHeader>
          <AudioSettings />
        </DialogContent>
      </Dialog>

      {/* Advanced Code Generation Dialog */}
      <Dialog open={showAdvancedCodeGen} onOpenChange={setShowAdvancedCodeGen}>
        <DialogContent className="max-w-7xl max-h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Code2 className="w-6 h-6 text-purple-500" />
              Advanced Code Generation
            </DialogTitle>
          </DialogHeader>
          <AdvancedCodeGeneration />
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart className="w-6 h-6 text-purple-500" />
              Workspace Analytics
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            <AnalyticsDashboard 
              projectId={projectId} 
              userId={userId}
              onApplyRecommendation={(recommendation) => {
                // Apply the recommended panel sizes
                const sizes = recommendation.recommendedPanelSizes;
                // The ResizablePanelGroup will automatically save via autoSaveId
                window.location.reload(); // Reload to apply new sizes
                setShowAnalytics(false);
              }}
            />
            <AdvancedAnalytics />
            <ProductionOptimizer />
            <DeploymentManager projectId={projectId} />
            <TestWorkflows projectId={projectId} />
            <PerformanceMonitor />
            <SecurityMonitor />
            <DeploymentCentral />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* AI Sales Agent Dialog */}
      <Dialog open={showAISalesAgent} onOpenChange={setShowAISalesAgent}>
        <DialogContent className="max-w-7xl h-[90vh] p-0 bg-gray-900 border-gray-800">
          <div className="relative h-full">
            <Button
              onClick={() => setShowAISalesAgent(false)}
              className="absolute top-4 right-4 z-50"
              variant="outline"
              size="sm"
            >
              Close
            </Button>
            <AISalesAgent
              selectedTemplate={projectTemplates[0]} // Use first template as default
              availableStacks={marketingStacks}
              onStackSelection={(stacks) => {
                console.log('Selected stacks:', stacks);
                toast({
                  title: "Marketing Stack Selected",
                  description: `${stacks.length} tools added to your project`,
                });
              }}
              onComplete={() => {
                setShowAISalesAgent(false);
                toast({
                  title: "AI Assistant Complete",
                  description: "Your personalized AI is ready to help!",
                });
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating One-Click Snapshot */}
      <div className="fixed bottom-6 right-6 z-50">
        <OneClickSnapshot
          projectId={projectId}
          getCurrentWorkspaceState={getCurrentWorkspaceState}
          onRestore={(snapshotData) => {
            // Restore workspace state
            if (snapshotData.panelSizes) {
              setPanelSizes(snapshotData.panelSizes);
            }
            if (snapshotData.previewDevice) {
              setPreviewDevice(snapshotData.previewDevice);
            }
            if (snapshotData.selectedModel) {
              setSelectedModel(snapshotData.selectedModel);
            }
          }}
          className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-2xl max-w-sm"
        />
      </div>

      {/* Workspace Snapshots Dialog */}
      <Dialog open={showSnapshots} onOpenChange={setShowSnapshots}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <History className="w-6 h-6 text-purple-500" />
              Workspace Snapshots
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <WorkspaceSnapshots
              projectId={projectId}
              onRestore={(snapshotData) => {
                // Restore workspace state
                if (snapshotData.panelSizes) {
                  setPanelSizes(snapshotData.panelSizes);
                }
                if (snapshotData.previewDevice) {
                  setPreviewDevice(snapshotData.previewDevice);
                }
                if (snapshotData.selectedModel) {
                  setSelectedModel(snapshotData.selectedModel);
                }
                setShowSnapshots(false);
              }}
              getCurrentWorkspaceState={getCurrentWorkspaceState}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 7: Autonomous Agents Dialog */}
      <Dialog open={showAutonomousAgents} onOpenChange={setShowAutonomousAgents}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              Phase 7: Autonomous Development Agents
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <AutonomousAgentPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 7: Real-time Collaboration Dialog */}
      <Dialog open={showCollaboration} onOpenChange={setShowCollaboration}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              Phase 7: Real-time Collaboration
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CollaborationPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 7: Enterprise Deployment Dialog */}
      <Dialog open={showEnterpriseDeployment} onOpenChange={setShowEnterpriseDeployment}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <RocketIcon className="w-6 h-6 text-green-500" />
              Phase 7: Enterprise Deployment Automation
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <EnterpriseDeploymentPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 8: Mobile App Generator Dialog */}
      <Dialog open={showMobileAppGenerator} onOpenChange={setShowMobileAppGenerator}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-blue-500" />
              Phase 8: Mobile App Generator
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <MobileAppGenerator />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 9: Enterprise Analytics Dialog */}
      <Dialog open={showEnterpriseAnalytics} onOpenChange={setShowEnterpriseAnalytics}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-500" />
              Phase 9: Enterprise Analytics & Insights
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <EnterpriseAnalyticsPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 9: Enhanced Deployment Dialog */}
      <Dialog open={showEnhancedDeployment} onOpenChange={setShowEnhancedDeployment}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <RocketIcon className="w-6 h-6 text-orange-500" />
              Phase 9: Enhanced Deployment Automation
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <EnhancedDeploymentPanel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 10: Advanced AI Orchestration Dialog */}
      <Dialog open={showPhase10Panel} onOpenChange={setShowPhase10Panel}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-500" />
              Phase 10: Advanced AI Orchestration & Scalability
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Phase10Panel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 11: Advanced Integration & Ecosystem Dialog */}
      <Dialog open={showPhase11Panel} onOpenChange={setShowPhase11Panel}>
        <DialogContent className="max-w-7xl h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-500" />
              Phase 11: Advanced Integration & Ecosystem
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Phase11Panel />
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding Guide */}
      <OnboardingGuide
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={completeOnboarding}
      />
    </ResizablePanelGroup>
  );
}