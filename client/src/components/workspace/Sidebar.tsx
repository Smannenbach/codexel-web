import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AgentCard } from './AgentCard';
import { Agent, ChecklistItem } from '@/types/workspace';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  agents: Agent[];
  checklist: ChecklistItem[];
  progress: number;
  width: number;
}

export function Sidebar({ agents, checklist, progress, width }: SidebarProps) {
  const completedTasks = checklist.filter(item => item.status === 'completed').length;
  const inProgressTasks = checklist.filter(item => item.status === 'in-progress').length;
  const pendingTasks = checklist.filter(item => item.status === 'pending').length;

  return (
    <div className="h-full bg-background border-r border-border flex flex-col" style={{ width }}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-2">AI Team Dashboard</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Agents Section */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            Active Agents ({agents.filter(a => a.status !== 'idle').length})
          </h3>
          <div className="space-y-2">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Task Status */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            Task Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Completed</span>
              <Badge variant="secondary">{completedTasks}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">In Progress</span>
              <Badge variant="default">{inProgressTasks}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pending</span>
              <Badge variant="outline">{pendingTasks}</Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Tasks */}
        <div className="p-4">
          <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            Recent Tasks
          </h3>
          <div className="space-y-2">
            {checklist.slice(0, 5).map(item => (
              <Card key={item.id} className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-medium">{item.title}</span>
                  <Badge 
                    variant={
                      item.status === 'completed' ? 'secondary' :
                      item.status === 'in-progress' ? 'default' : 'outline'
                    }
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}