import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  History, 
  CheckCircle,
  Keyboard,
  RotateCcw,
  X
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { audioManager } from '@/services/AudioManager';

interface CollapsibleSnapshotWidgetProps {
  projectId: number;
  getCurrentWorkspaceState: () => any;
  onRestore?: (snapshotData: any) => void;
}

export default function CollapsibleSnapshotWidget({ 
  projectId, 
  getCurrentWorkspaceState, 
  onRestore
}: CollapsibleSnapshotWidgetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Get recent snapshots (last 3)
  const { data: recentSnapshots = [] } = useQuery<any[]>({
    queryKey: ['/api/snapshots/project', projectId],
    enabled: !!projectId,
    select: (data: any) => {
      const snapshots = data?.snapshots || [];
      return snapshots
        .sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
    },
    refetchInterval: 30000
  });

  // Quick save mutation
  const quickSaveMutation = useMutation({
    mutationFn: async () => {
      const workspaceState = getCurrentWorkspaceState();
      const timestamp = new Date().toLocaleString();
      
      return apiRequest('POST', '/api/snapshots', {
        projectId,
        name: `Quick Save ${timestamp}`,
        description: 'One-click workspace backup',
        snapshotData: workspaceState,
        tags: ['quick-save'],
        isAutoSaved: false
      });
    },
    onSuccess: () => {
      setLastSaveTime(new Date());
      queryClient.invalidateQueries({ queryKey: ['/api/snapshots/project', projectId] });
      toast({
        title: "Workspace Saved!",
        description: "Your workspace has been quickly saved.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Could not save workspace. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Quick restore mutation
  const quickRestoreMutation = useMutation({
    mutationFn: async (snapshotId: number) => {
      return apiRequest('POST', '/api/snapshots/restore', { 
        snapshotId, 
        projectId 
      });
    },
    onSuccess: (data) => {
      if (onRestore && data.snapshot) {
        onRestore(data.snapshot);
      }
      toast({
        title: "Workspace Restored!",
        description: "Your workspace has been restored successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Restore Failed",
        description: "Could not restore workspace. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleQuickSave = () => {
    audioManager.playSnapshotSave();
    quickSaveMutation.mutate();
  };

  const handleQuickRestore = (snapshotId: number) => {
    audioManager.playSnapshotRestore();
    quickRestoreMutation.mutate(snapshotId);
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now.getTime() - target.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <Card className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-purple-500" />
              One-Click Shortcuts
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Always visible quick actions */}
          <div className="flex items-center gap-2 mb-3">
            <Button
              onClick={handleQuickSave}
              disabled={quickSaveMutation.isPending}
              className="gap-1 bg-green-600 hover:bg-green-700 h-8 px-3 text-xs"
              size="sm"
            >
              {quickSaveMutation.isPending ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              Save
            </Button>

            {recentSnapshots.length > 0 && (
              <Button
                onClick={() => handleQuickRestore(recentSnapshots[0].id)}
                disabled={quickRestoreMutation.isPending}
                variant="outline"
                className="gap-1 h-8 px-3 text-xs border-blue-500/50 hover:bg-blue-500/20"
                size="sm"
              >
                {quickRestoreMutation.isPending ? (
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RotateCcw className="w-3 h-3" />
                )}
                Restore
              </Button>
            )}
          </div>

          {/* Keyboard shortcuts info */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-800 rounded text-[10px]">Ctrl+S</kbd>
              <span>Quick Save</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-800 rounded text-[10px]">Ctrl+R</kbd>
              <span>Restore</span>
            </div>
          </div>

          {/* Expandable content */}
          {isExpanded && (
            <div className="space-y-3 border-t border-gray-700 pt-3">
              {lastSaveTime && (
                <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30">
                  <CheckCircle className="w-3 h-3" />
                  Saved {formatTimeAgo(lastSaveTime)}
                </Badge>
              )}

              {/* Recent snapshots */}
              {recentSnapshots.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    Recent Snapshots
                  </p>
                  <div className="space-y-1">
                    {recentSnapshots.slice(0, 3).map((snapshot) => (
                      <div key={snapshot.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-400 truncate">
                          {formatTimeAgo(snapshot.createdAt)}
                        </span>
                        <Button
                          onClick={() => handleQuickRestore(snapshot.id)}
                          variant="ghost"
                          size="sm"
                          className="h-5 px-2 text-xs text-blue-400 hover:text-blue-300"
                        >
                          Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}