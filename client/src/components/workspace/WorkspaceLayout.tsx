import { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { NavigationBar } from './NavigationBar';
import { Sidebar } from './Sidebar';
import { ConversationPanel } from './ConversationPanel';
import { PreviewPanel } from './PreviewPanel';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useChat } from '@/hooks/useChat';
import { Agent, ChecklistItem } from '@/types/workspace';

// Mock data - in a real app this would come from your API
const MOCK_AGENTS: Agent[] = [
  {
    id: '1',
    name: 'Project Manager',
    role: 'Planning & Coordination',
    description: 'Creating master checklist and coordinating development phases',
    status: 'active',
    model: 'GPT-4 • Turbo',
    color: 'purple',
    icon: '👤'
  },
  {
    id: '2',
    name: 'Solution Architect',
    role: 'System Design',
    description: 'Designing scalable microservices architecture',
    status: 'working',
    model: 'Gemini Ultra',
    color: 'blue',
    icon: '🏗️'
  },
  {
    id: '3',
    name: 'UX/UI Designer',
    role: 'Design & Branding',
    description: 'Creating coffee-focused brand identity and layouts',
    status: 'working',
    model: 'Claude 3.5',
    color: 'pink',
    icon: '🎨'
  },
  {
    id: '4',
    name: 'Frontend Dev',
    role: 'UI Development',
    description: 'Building responsive React components',
    status: 'idle',
    model: 'Kimi K2',
    color: 'green',
    icon: '💻'
  },
  {
    id: '5',
    name: 'Backend Dev',
    role: 'API Development',
    description: 'Setting up FastAPI with PostgreSQL database',
    status: 'idle',
    model: 'GPT-4 Turbo',
    color: 'orange',
    icon: '⚙️'
  },
  {
    id: '6',
    name: 'QA Testing',
    role: 'Quality Assurance',
    description: 'Waiting for components to test',
    status: 'idle',
    model: 'Qwen 2.5 Max',
    color: 'red',
    icon: '🧪'
  }
];

const MOCK_CHECKLIST: ChecklistItem[] = [
  {
    id: '1',
    title: 'Project Manager - Creating comprehensive development plan',
    description: 'Setting up project structure and timeline',
    status: 'completed',
    agentId: '1',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Solution Architect - Designing scalable microservices architecture',
    description: 'Creating system architecture and API design',
    status: 'completed',
    agentId: '2',
    priority: 'high'
  },
  {
    id: '3',
    title: 'UX/UI Designer - Creating coffee-focused brand identity and layouts',
    description: 'Designing user interface and brand elements',
    status: 'in-progress',
    agentId: '3',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Frontend Developer - Building responsive React components',
    description: 'Implementing user interface components',
    status: 'pending',
    agentId: '4',
    priority: 'medium'
  }
];

export function WorkspaceLayout() {
  const { layout, applyPreset, resizeSidebar } = useWorkspace();
  const { messages, selectedModel, setSelectedModel, sendMessage, isLoading } = useChat();
  const [progress, setProgress] = useState(32);
  const [cost, setCost] = useState(1.47);

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 2, 100));
      setCost(prev => prev + Math.random() * 0.1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen workspace-bg flex flex-col">
      <NavigationBar
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        onPresetChange={applyPreset}
        activePreset={layout.preset}
        cost={cost}
        maxCost={25}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Sidebar */}
          {layout.sidebarWidth > 0 && (
            <>
              <ResizablePanel 
                defaultSize={25} 
                minSize={20} 
                maxSize={40}
                className="flex"
              >
                <Sidebar
                  agents={MOCK_AGENTS}
                  checklist={MOCK_CHECKLIST}
                  progress={progress}
                  width={280}
                />
              </ResizablePanel>
              <ResizableHandle className="resize-handle" />
            </>
          )}

          {/* Conversation Panel */}
          {layout.conversationWidth > 0 && (
            <>
              <ResizablePanel 
                defaultSize={40} 
                minSize={30}
                className="flex"
              >
                <ConversationPanel
                  messages={messages}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                />
              </ResizablePanel>
              {layout.previewWidth > 0 && <ResizableHandle className="resize-handle" />}
            </>
          )}

          {/* Preview Panel */}
          {layout.previewWidth > 0 && (
            <ResizablePanel 
              defaultSize={35} 
              minSize={30}
              className="flex"
            >
              <PreviewPanel />
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
