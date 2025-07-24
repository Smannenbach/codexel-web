import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Save, 
  RotateCcw, 
  Clock, 
  Camera, 
  History,
  Zap,
  CheckCircle,
  AlertCircle,
  Keyboard,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { WorkspaceSnapshot } from '@shared/schema';

interface OneClickSnapshotProps {
  projectId: number;
  getCurrentWorkspaceState: () => any;
  onRestore?: (snapshotData: any) => void;
  className?: string;
}

export default function OneClickSnapshot({ 
  projectId, 
  getCurrentWorkspaceState, 
  onRestore,
  className = "" 
}: OneClickSnapshotProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Get recent snapshots (last 3)
  const { data: recentSnapshots = [] } = useQuery<WorkspaceSnapshot[]>({
    queryKey: ['/api/snapshots/project', projectId],
    enabled: !!projectId,
    select: (data: any) => {
      const snapshots = data?.snapshots || [];
      return snapshots
        .sort((a: WorkspaceSnapshot, b: WorkspaceSnapshot) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // One-click save mutation
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
    onSuccess: (data, snapshotId) => {
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

  // Auto-save mutation
  const autoSaveMutation = useMutation({
    mutationFn: async () => {
      const workspaceState = getCurrentWorkspaceState();
      
      return apiRequest('POST', '/api/snapshots/auto-save', {
        projectId,
        snapshotData: workspaceState
      });
    },
    onSuccess: () => {
      // Silent success for auto-save
      queryClient.invalidateQueries({ queryKey: ['/api/snapshots/project', projectId] });
    }
  });

  const handleQuickSave = () => {
    quickSaveMutation.mutate();
  };

  const handleQuickRestore = (snapshotId: number) => {
    quickRestoreMutation.mutate(snapshotId);
  };

  const handleAutoSave = () => {
    autoSaveMutation.mutate();
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Keyboard Shortcuts Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Keyboard className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">One-Click Shortcuts</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-[10px]">Ctrl+S</kbd>
            <span>Quick Save</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded border text-[10px]">Ctrl+R</kbd>
            <span>Quick Restore</span>
          </div>
        </div>
      </div>

      {/* One-Click Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleQuickSave}
          disabled={quickSaveMutation.isPending}
          className="gap-2 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
          size="sm"
        >
          {quickSaveMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Quick Save
        </Button>

        <Button
          onClick={handleAutoSave}
          disabled={autoSaveMutation.isPending}
          variant="outline"
          className="gap-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
          size="sm"
        >
          {autoSaveMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-orange-500" />
          )}
          Auto Save
        </Button>

        {lastSaveTime && (
          <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
            <CheckCircle className="w-3 h-3" />
            Saved {formatTimeAgo(lastSaveTime)}
          </Badge>
        )}
      </div>

      {/* Recent Snapshots for Quick Restore */}
      {recentSnapshots.length > 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium">Quick Restore</h4>
            </div>
            
            <div className="space-y-2">
              {recentSnapshots.map((snapshot) => (
                <div 
                  key={snapshot.id} 
                  className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium truncate">
                        {snapshot.name}
                      </h5>
                      {snapshot.isAutoSaved && (
                        <Badge variant="secondary" className="text-xs">
                          Auto
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(snapshot.createdAt)}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleQuickRestore(snapshot.id)}
                    disabled={quickRestoreMutation.isPending}
                    variant="ghost"
                    size="sm"
                    className="gap-1 ml-2"
                  >
                    {quickRestoreMutation.isPending ? (
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Message */}
      {recentSnapshots.length === 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">
                No snapshots yet. Create your first workspace backup!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Enhanced keyboard shortcuts hook with visual feedback
export function useSnapshotShortcuts(
  onQuickSave: () => void,
  onQuickRestore: () => void
) {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S for quick save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        toast({
          title: "💾 Quick Save",
          description: "Saving workspace snapshot...",
          duration: 2000,
        });
        onQuickSave();
      }
      
      // Ctrl+R or Cmd+R for quick restore
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        toast({
          title: "🔄 Quick Restore",
          description: "Restoring latest workspace snapshot...",
          duration: 2000,
        });
        onQuickRestore();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onQuickSave, onQuickRestore, toast]);
}