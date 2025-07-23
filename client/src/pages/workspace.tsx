import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import ThreePanelWorkspace from '@/components/workspace/ThreePanelWorkspace';
import { ProjectSidebar } from '@/components/workspace/ProjectSidebar';
import TemplateSetup from '@/components/workspace/TemplateSetup';
import MarketingDashboard from '@/components/workspace/MarketingDashboard';
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Project, Agent, Message, ChecklistItem } from '@shared/schema';

export default function Workspace() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showTemplateSetup, setShowTemplateSetup] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'marketing'>('chat');
  
  // Check if template parameter is in URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const templateId = params.get('template');
    if (templateId) {
      setShowTemplateSetup(true);
    }
  }, [location]);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Fetch selected project details
  const { data: projectData, isLoading: projectLoading } = useQuery<{
    project: Project;
    agents: Agent[];
    messages: Message[];
    checklist: ChecklistItem[];
  }>({
    queryKey: ['/api/projects', selectedProjectId],
    enabled: !!selectedProjectId,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return await apiRequest('POST', '/api/projects', data);
    },
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setSelectedProjectId(newProject.id);
      toast({
        title: "Project Created",
        description: `"${newProject.name}" has been created successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { projectId: number; content: string }) => {
      return await apiRequest('POST', '/api/chat', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', selectedProjectId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Auto-select first project or create one if none exist
  useEffect(() => {
    if (!projectsLoading && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, projectsLoading, selectedProjectId]);

  const handleSendMessage = async (content: string) => {
    if (!selectedProjectId) return;
    
    await sendMessageMutation.mutateAsync({
      projectId: selectedProjectId,
      content,
    });
  };

  const handleCreateProject = async (name: string, description: string) => {
    await createProjectMutation.mutateAsync({ name, description });
  };

  // Show template setup if triggered
  if (showTemplateSetup && selectedProjectId) {
    return (
      <TemplateSetup 
        projectId={selectedProjectId} 
        onComplete={() => {
          setShowTemplateSetup(false);
          // Clear template param from URL
          setLocation('/workspace');
        }}
      />
    );
  }

  if (!selectedProjectId || !projectData) {
    return (
      <div className="flex h-screen">
        <ProjectSidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onCreateProject={handleCreateProject}
          isLoading={projectsLoading}
        />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          {projectsLoading ? "Loading projects..." : "Select or create a project to get started"}
        </div>
      </div>
    );
  }

  return (
    <ThreePanelWorkspace
      projectId={selectedProjectId}
      agents={projectData.agents || []}
      messages={projectData.messages || []}
      onSendMessage={async (content: string, attachments?: File[]) => {
        await handleSendMessage(content);
        // TODO: Handle file attachments when backend supports it
      }}
    />
  );
}
