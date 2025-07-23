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
  BarChart
} from 'lucide-react';
import { AI_MODELS } from '@/lib/ai-models';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Agent, Message } from '@shared/schema';
import ShareLayoutButton from './ShareLayoutButton';
import AnalyticsDashboard from './AnalyticsDashboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ThreePanelWorkspaceProps {
  projectId: number;
  agents: Agent[];
  messages: Message[];
  onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
}

// Agent type definitions
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
    description: 'Creating coffee-focused brand identity'
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
    description: 'Setting up FastAPI with PostgreSQL'
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
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [panelSizes, setPanelSizes] = useState<number[]>([20, 45, 35]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [lastPanelFocus, setLastPanelFocus] = useState<{ panel: string; time: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const userId = 1; // TODO: Get from authenticated user

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachments.length === 0) return;
    
    setIsLoading(true);
    try {
      await onSendMessage(inputValue, attachments);
      
      // Track analytics
      await apiRequest('POST', '/api/analytics/track', {
        userId,
        projectId,
        event: 'message_sent',
        data: { model: selectedModel }
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

  // Load and save panel configuration
  useEffect(() => {
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

  return (
    <ResizablePanelGroup 
      direction="horizontal" 
      className="h-screen bg-gray-950 workspace-container"
      autoSaveId="workspace-layout"
      onLayout={async (sizes) => {
        setPanelSizes(sizes);
        // Track layout change
        await apiRequest('POST', '/api/analytics/track', {
          userId,
          projectId,
          event: 'layout_change',
          data: { 
            configuration: { autoSaveId: 'workspace-layout' },
            panelSizes: sizes 
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
              <ShareLayoutButton className="ml-2" />
            </div>
            <div className="mt-2 bg-gray-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500" 
                style={{ width: '41%' }} 
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">41%</p>
          </div>
          
          <ScrollArea className="h-[calc(100%-120px)] p-4">
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Agents (5)</p>
              
              {Object.entries(AGENT_TYPES).map(([type, info]) => {
                const agent = agents.find(a => a.type === type);
                const isActive = agent?.status === 'working';
                
                return (
                  <Card key={type} className={`backdrop-blur-xl bg-white/5 border-white/10 transition-all ${isActive ? 'ring-2 ring-purple-500/50' : ''}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-white/10 ${isActive ? 'animate-pulse' : ''}`}>
                          <info.icon className={`w-4 h-4 ${info.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{info.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{info.description}</p>
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
        onDragging={(dragging) => setIsResizing(dragging)} 
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
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAnalytics(true)}
                  className="text-gray-400 hover:text-white"
                  title="View Analytics"
                >
                  <BarChart className="w-5 h-5" />
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
                        {new Date(message.createdAt).toLocaleTimeString()}
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
                onClick={handleSendMessage} 
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
        onDragging={(dragging) => setIsResizing(dragging)} 
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
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white p-4 overflow-auto">
            <div className={getDeviceStyles()}>
              <div className="bg-gray-100 rounded-lg p-4 min-h-[400px]">
                <div className="text-center py-16">
                  <CircleCheckBig className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Preview</h3>
                  <p className="text-gray-500">Your application will appear here</p>
                </div>
              </div>
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
      
      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-5xl max-h-[90vh] bg-gray-900 border-gray-800 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <BarChart className="w-6 h-6 text-purple-500" />
              Workspace Analytics
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
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
          </div>
        </DialogContent>
      </Dialog>
    </ResizablePanelGroup>
  );
}