import { Agent } from '@/types/workspace';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
}

export function AgentCard({ agent, isActive }: AgentCardProps) {
  const statusColors = {
    active: 'bg-purple-500',
    working: 'bg-green-400',
    idle: 'bg-yellow-400',
    completed: 'bg-blue-400'
  };

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />;
      case 'working':
        return <div className="w-2 h-2 bg-purple-400 rounded-full animate-spin border border-white border-t-transparent" />;
      case 'idle':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full" />;
      case 'completed':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  return (
    <div className={cn(
      "border rounded-lg p-3 transition-all duration-200 bg-card",
      isActive && "border-primary"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
            {agent.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{agent.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
          </div>
        </div>
        {getStatusIcon(agent.status)}
      </div>
      <div className="text-xs text-muted-foreground">
        {agent.model}
      </div>
    </div>
  );
}
