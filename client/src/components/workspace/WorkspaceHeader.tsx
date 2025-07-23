import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  BarChart, 
  MessageSquare,
  Settings,
  Bell,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceHeaderProps {
  activeView: 'chat' | 'vibe-stack';
  onViewChange: (view: 'chat' | 'vibe-stack') => void;
  projectName?: string;
  onAddVibeStack?: () => void;
}

export default function WorkspaceHeader({ 
  activeView, 
  onViewChange,
  projectName,
  onAddVibeStack 
}: WorkspaceHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Project Name */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">{projectName || 'Workspace'}</h2>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 ml-8">
          <Button
            variant={activeView === 'chat' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('chat')}
            className={cn(
              "gap-2",
              activeView === 'chat' && "shadow-sm"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            AI Development
          </Button>
          <Button
            variant={activeView === 'marketing' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewChange('marketing')}
            className={cn(
              "gap-2",
              activeView === 'marketing' && "shadow-sm"
            )}
          >
            <BarChart className="w-4 h-4" />
            Marketing Hub
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              New
            </Badge>
          </Button>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}