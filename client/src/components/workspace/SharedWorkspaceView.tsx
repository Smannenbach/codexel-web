import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Share2, 
  Clock, 
  User, 
  Tag,
  ExternalLink,
  Download,
  Copy
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import ThreePanelWorkspace from './ThreePanelWorkspace';

interface SharedWorkspaceData {
  snapshot: any;
  metadata: {
    name: string;
    description: string;
    createdAt: string;
    tags?: string[];
  };
  isShared: boolean;
  readOnly: boolean;
}

export default function SharedWorkspaceView() {
  const { id } = useParams();
  const { toast } = useToast();
  const [workspaceData, setWorkspaceData] = useState<SharedWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedWorkspace = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await apiRequest('GET', `/api/shared-workspace/${id}`);
        setWorkspaceData(data);
      } catch (error: any) {
        setError(error.message || 'Failed to load shared workspace');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedWorkspace();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Workspace link copied to clipboard",
    });
  };

  const handleForkWorkspace = () => {
    // In real app, would create a new project with this workspace state
    toast({
      title: "Fork Feature",
      description: "This feature will create a copy of this workspace in your account",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
            <Share2 className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Shared Workspace</h3>
          <p className="text-gray-400">Please wait while we load the workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !workspaceData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Card className="max-w-md bg-gray-900 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-red-400">Unable to Load Workspace</CardTitle>
            <CardDescription>
              {error || 'This shared workspace may have expired or been removed.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Shared Workspace Header */}
      <div className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-400">Shared Workspace</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-white">{workspaceData.metadata.name}</h1>
                {workspaceData.metadata.description && (
                  <p className="text-sm text-gray-400">{workspaceData.metadata.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(workspaceData.metadata.createdAt).toLocaleDateString()}
              </div>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="gap-2"
              >
                <Copy className="w-3 h-3" />
                Copy Link
              </Button>
              
              <Button
                size="sm"
                onClick={handleForkWorkspace}
                className="bg-gradient-to-r from-purple-600 to-pink-600 gap-2"
              >
                <Download className="w-3 h-3" />
                Fork Workspace
              </Button>
            </div>
          </div>
          
          {/* Tags */}
          {workspaceData.metadata.tags && workspaceData.metadata.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Tag className="w-3 h-3 text-gray-500" />
              <div className="flex gap-1">
                {workspaceData.metadata.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Content */}
      <div className="relative">
        {/* Read-only overlay indicator */}
        <div className="absolute top-4 left-4 z-40 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-3 py-1">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <User className="w-3 h-3" />
            <span>Read-only view</span>
          </div>
        </div>

        {/* Render the workspace with shared data */}
        <SharedWorkspaceRenderer 
          workspaceData={workspaceData}
        />
      </div>
    </div>
  );
}

// Component to render the shared workspace
function SharedWorkspaceRenderer({ workspaceData }: { workspaceData: SharedWorkspaceData }) {
  const [messages, setMessages] = useState(workspaceData.snapshot.messages || []);
  const [agents, setAgents] = useState(workspaceData.snapshot.agents || []);

  // Mock function for read-only mode
  const handleSendMessage = async () => {
    // Do nothing in read-only mode
  };

  return (
    <div className="pointer-events-none">
      <ThreePanelWorkspace
        projectId={workspaceData.snapshot.projectId || 1}
        agents={agents}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
      
      {/* Overlay to prevent interactions */}
      <div className="absolute inset-0 bg-transparent pointer-events-auto">
        <div className="h-full w-full" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      </div>
    </div>
  );
}