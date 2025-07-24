import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Save, 
  Camera, 
  RotateCcw, 
  Clock, 
  Trash2, 
  Download,
  Upload,
  History,
  Tag,
  Share2,
  Copy,
  Link
} from 'lucide-react';
import type { WorkspaceSnapshot } from '@shared/schema';

interface WorkspaceSnapshotsProps {
  projectId: number;
  onRestore?: (snapshotData: any) => void;
  getCurrentWorkspaceState?: () => any;
}

export function WorkspaceSnapshots({ 
  projectId, 
  onRestore,
  getCurrentWorkspaceState 
}: WorkspaceSnapshotsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotDescription, setSnapshotDescription] = useState('');
  const [snapshotTags, setSnapshotTags] = useState('');

  // Fetch snapshots for current project
  const { data: snapshots = [] as WorkspaceSnapshot[], isLoading } = useQuery<{ snapshots: WorkspaceSnapshot[] }>({
    queryKey: ['/api/snapshots/project', projectId],
    enabled: !!projectId,
    select: (data) => data?.snapshots || []
  });

  // Create snapshot mutation
  const createSnapshotMutation = useMutation({
    mutationFn: async (snapshotData: any) => {
      return apiRequest('POST', '/api/snapshots', snapshotData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/snapshots/project', projectId] });
      setShowSaveDialog(false);
      setSnapshotName('');
      setSnapshotDescription('');
      setSnapshotTags('');
      toast({
        title: "Snapshot Created",
        description: "Your workspace has been saved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: "Failed to create workspace snapshot",
        variant: "destructive",
      });
    }
  });

  // Restore snapshot mutation
  const restoreSnapshotMutation = useMutation({
    mutationFn: async ({ snapshotId }: { snapshotId: number }) => {
      return apiRequest('POST', '/api/snapshots/restore', { snapshotId, projectId });
    },
    onSuccess: (data) => {
      if (onRestore && data.snapshot) {
        onRestore(data.snapshot);
      }
      toast({
        title: "Workspace Restored",
        description: "Your workspace has been restored successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Restore Failed",
        description: "Failed to restore workspace snapshot",
        variant: "destructive",
      });
    }
  });

  // Delete snapshot mutation
  const deleteSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: number) => {
      return apiRequest('DELETE', `/api/snapshots/${snapshotId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/snapshots/project', projectId] });
      toast({
        title: "Snapshot Deleted",
        description: "Snapshot removed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete snapshot",
        variant: "destructive",
      });
    }
  });

  // Share snapshot mutation
  const shareSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: number) => {
      return apiRequest('POST', `/api/snapshots/${snapshotId}/share`);
    },
    onSuccess: (data) => {
      // Copy share link to clipboard
      navigator.clipboard.writeText(data.shareLink);
      toast({
        title: "Snapshot Shared",
        description: "Share link copied to clipboard!",
      });
    },
    onError: () => {
      toast({
        title: "Share Failed",
        description: "Failed to create share link",
        variant: "destructive",
      });
    }
  });

  const handleCreateSnapshot = () => {
    if (!snapshotName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your snapshot",
        variant: "destructive",
      });
      return;
    }

    const workspaceState = getCurrentWorkspaceState?.() || {};
    
    createSnapshotMutation.mutate({
      projectId,
      name: snapshotName.trim(),
      description: snapshotDescription.trim() || undefined,
      snapshotData: {
        ...workspaceState,
        timestamp: new Date().toISOString(),
        version: "1.0"
      },
      tags: snapshotTags.split(',').map(tag => tag.trim()).filter(Boolean),
      isAutoSaved: false
    });
  };

  const handleRestoreSnapshot = (snapshotId: number) => {
    restoreSnapshotMutation.mutate({ snapshotId });
  };

  const handleDeleteSnapshot = (snapshotId: number) => {
    if (confirm('Are you sure you want to delete this snapshot? This action cannot be undone.')) {
      deleteSnapshotMutation.mutate(snapshotId);
    }
  };

  const handleShareSnapshot = (snapshotId: number) => {
    shareSnapshotMutation.mutate(snapshotId);
  };

  const autoSaveSnapshots = snapshots.filter(s => s.isAutoSaved);
  const manualSnapshots = snapshots.filter(s => !s.isAutoSaved);

  return (
    <div className="space-y-4">
      {/* Header with Create Snapshot Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Workspace Snapshots</h3>
        </div>
        
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Camera className="h-4 w-4" />
              Create Snapshot
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Save Workspace Snapshot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.target.value)}
                  placeholder="Enter snapshot name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={snapshotDescription}
                  onChange={(e) => setSnapshotDescription(e.target.value)}
                  placeholder="Optional description"
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={snapshotTags}
                  onChange={(e) => setSnapshotTags(e.target.value)}
                  placeholder="feature, milestone, backup (comma separated)"
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateSnapshot}
                  disabled={createSnapshotMutation.isPending}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {createSnapshotMutation.isPending ? 'Saving...' : 'Save Snapshot'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* Snapshots List */}
      {!isLoading && (
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {/* Manual Snapshots */}
            {manualSnapshots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Manual Snapshots ({manualSnapshots.length})
                </h4>
                <div className="space-y-2">
                  {manualSnapshots.map((snapshot) => (
                    <SnapshotCard
                      key={snapshot.id}
                      snapshot={snapshot}
                      onRestore={() => handleRestoreSnapshot(snapshot.id)}
                      onDelete={() => handleDeleteSnapshot(snapshot.id)}
                      onShare={() => handleShareSnapshot(snapshot.id)}
                      isRestoring={restoreSnapshotMutation.isPending}
                      isDeleting={deleteSnapshotMutation.isPending}
                      isSharing={shareSnapshotMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Auto-save Snapshots */}
            {autoSaveSnapshots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Auto-save Snapshots ({autoSaveSnapshots.length})
                </h4>
                <div className="space-y-2">
                  {autoSaveSnapshots.map((snapshot) => (
                    <SnapshotCard
                      key={snapshot.id}
                      snapshot={snapshot}
                      onRestore={() => handleRestoreSnapshot(snapshot.id)}
                      onDelete={() => handleDeleteSnapshot(snapshot.id)}
                      onShare={() => handleShareSnapshot(snapshot.id)}
                      isRestoring={restoreSnapshotMutation.isPending}
                      isDeleting={deleteSnapshotMutation.isPending}
                      isSharing={shareSnapshotMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {snapshots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No snapshots yet</p>
                <p className="text-sm">
                  Create your first workspace snapshot to save your current layout and settings
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

interface SnapshotCardProps {
  snapshot: WorkspaceSnapshot;
  onRestore: () => void;
  onDelete: () => void;
  onShare: () => void;
  isRestoring: boolean;
  isDeleting: boolean;
  isSharing: boolean;
}

function SnapshotCard({ 
  snapshot, 
  onRestore, 
  onDelete, 
  onShare,
  isRestoring, 
  isDeleting,
  isSharing 
}: SnapshotCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {snapshot.name}
              {snapshot.isAutoSaved && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Auto-save
                </Badge>
              )}
            </CardTitle>
            {snapshot.description && (
              <CardDescription className="text-sm">
                {snapshot.description}
              </CardDescription>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(snapshot.createdAt).toLocaleString()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Tags */}
        {snapshot.tags && snapshot.tags.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Tag className="h-3 w-3 text-muted-foreground" />
            <div className="flex gap-1">
              {snapshot.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onRestore}
            disabled={isRestoring}
            className="gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            {isRestoring ? 'Restoring...' : 'Restore'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onShare}
            disabled={isSharing}
            className="gap-1"
          >
            <Share2 className="h-3 w-3" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={isDeleting}
            className="gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}