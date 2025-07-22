import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Pause, RotateCcw, Save } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { AIModel } from '@/lib/ai-models';

interface ProjectHeaderProps {
  projectName: string;
  status: 'planning' | 'development' | 'testing' | 'completed';
  progress: number;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSave: () => void;
}

export function ProjectHeader({
  projectName,
  status,
  progress,
  selectedModel,
  onModelChange,
  onStart,
  onPause,
  onReset,
  onSave
}: ProjectHeaderProps) {
  return (
    <Card className="p-4 border-b border-border rounded-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold">{projectName}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge 
                variant={
                  status === 'completed' ? 'default' :
                  status === 'development' ? 'secondary' :
                  status === 'testing' ? 'outline' : 'secondary'
                }
              >
                {status.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {progress}% Complete
              </span>
            </div>
          </div>
          <div className="w-32">
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <ModelSelector value={selectedModel} onChange={onModelChange} />
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onStart}>
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}