import { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChatPanel } from './ChatPanel';
import { AgentStatus } from './AgentStatus';
import { ChecklistPanel } from './ChecklistPanel';
import { DeployPanel } from './DeployPanel';
import { ProgressTracker } from './ProgressTracker';
import { SettingsPanel } from './SettingsPanel';
import { CostTracker } from './CostTracker';
import { QuickActions } from './QuickActions';
import { ModelSelector } from './ModelSelector';
import { 
  MessageSquare, 
  Users, 
  CheckSquare,
  Rocket,
  TrendingUp,
  Settings,
  DollarSign,
  Zap
} from 'lucide-react';
import type { Project, Agent, Message, ChecklistItem } from '@shared/schema';

interface WorkspaceLayoutProps {
  project: Project;
  agents: Agent[];
  messages: Message[];
  checklist: ChecklistItem[];
  onSendMessage: (content: string) => Promise<void>;
  onToggleChecklistItem?: (itemId: number) => void;
}

export function WorkspaceLayout({
  project,
  agents = [],
  messages = [],
  checklist = [],
  onSendMessage,
  onToggleChecklistItem
}: WorkspaceLayoutProps) {
  const [leftTab, setLeftTab] = useState('chat');
  const [rightTab, setRightTab] = useState('agents');
  const [selectedModel, setSelectedModel] = useState('gpt-4-turbo');

  const handleQuickAction = (prompt: string) => {
    onSendMessage(prompt);
    setLeftTab('chat');
  };

  // Mock cost data - in production, this would come from actual usage tracking
  const costData = {
    totalCost: 3.45,
    budget: 25,
    modelCosts: [
      { model: 'GPT-4 Turbo', cost: 2.10 },
      { model: 'Claude 3.5', cost: 0.85 },
      { model: 'Gemini Ultra', cost: 0.50 }
    ],
    dailyCosts: [
      { date: '2025-01-20', cost: 1.20 },
      { date: '2025-01-21', cost: 1.05 },
      { date: '2025-01-22', cost: 1.20 }
    ]
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      {/* Left Panel - Main Content */}
      <ResizablePanel defaultSize={60} minSize={40}>
        <Tabs value={leftTab} onValueChange={setLeftTab} className="h-full flex flex-col">
          <div className="border-b bg-background">
            <TabsList className="w-full justify-start h-12 p-0 bg-transparent">
              <TabsTrigger value="chat" className="data-[state=active]:bg-muted rounded-none h-12 px-4">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-muted rounded-none h-12 px-4">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="cost" className="data-[state=active]:bg-muted rounded-none h-12 px-4">
                <DollarSign className="w-4 h-4 mr-2" />
                Cost
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-muted rounded-none h-12 px-4">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 m-0">
            <div className="h-full flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-semibold mb-2">
                        What would you like to build today?
                      </h3>
                      <p className="text-muted-foreground">
                        Choose a quick action or describe your project idea
                      </p>
                    </div>
                    <QuickActions onSelectAction={handleQuickAction} />
                  </div>
                </div>
              ) : (
                <ChatPanel 
                  messages={messages} 
                  onSendMessage={onSendMessage}
                  isGenerating={agents.some(a => a.status === 'working')}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="flex-1 m-0 overflow-auto">
            <ProgressTracker 
              projectProgress={project.progress || 0}
              checklist={checklist}
              agents={agents}
            />
          </TabsContent>

          <TabsContent value="cost" className="flex-1 m-0 overflow-auto">
            <div className="p-6">
              <CostTracker {...costData} />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0 overflow-auto">
            <SettingsPanel 
              projectId={project.id}
              projectName={project.name}
              onModelChange={setSelectedModel}
            />
          </TabsContent>
        </Tabs>
      </ResizablePanel>

      <ResizableHandle />

      {/* Right Panel - Support Content */}
      <ResizablePanel defaultSize={40} minSize={25} maxSize={50}>
        <Tabs value={rightTab} onValueChange={setRightTab} className="h-full flex flex-col">
          <div className="border-b bg-background">
            <TabsList className="w-full h-12 p-0 bg-transparent">
              <TabsTrigger value="agents" className="flex-1 data-[state=active]:bg-muted rounded-none h-12">
                <Users className="w-4 h-4 mr-2" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex-1 data-[state=active]:bg-muted rounded-none h-12">
                <CheckSquare className="w-4 h-4 mr-2" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="deploy" className="flex-1 data-[state=active]:bg-muted rounded-none h-12">
                <Rocket className="w-4 h-4 mr-2" />
                Deploy
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="agents" className="flex-1 m-0">
            <div className="p-6 space-y-6">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                showDetails={true}
              />
              <AgentStatus agents={agents} />
            </div>
          </TabsContent>

          <TabsContent value="checklist" className="flex-1 m-0">
            <ChecklistPanel 
              items={checklist} 
              projectProgress={project.progress || 0}
              onToggleItem={onToggleChecklistItem}
            />
          </TabsContent>
          
          <TabsContent value="deploy" className="flex-1 m-0">
            <DeployPanel
              projectId={project.id}
              projectName={project.name}
              isReady={!!project.progress && project.progress >= 80}
            />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}