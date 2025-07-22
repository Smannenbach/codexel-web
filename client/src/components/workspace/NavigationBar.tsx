import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface NavigationBarProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  onPresetChange: (preset: string) => void;
  activePreset: string;
  cost: number;
  maxCost: number;
}

export function NavigationBar({ 
  selectedModel, 
  onModelChange, 
  onPresetChange, 
  activePreset, 
  cost, 
  maxCost 
}: NavigationBarProps) {
  const { theme, setTheme } = useTheme();

  const presets = [
    { id: 'balanced', label: 'Balanced' },
    { id: 'focus', label: 'Focus' },
    { id: 'preview', label: 'Preview' },
    { id: 'conversation', label: 'Chat' },
    { id: 'development', label: 'Dev' },
  ];

  return (
    <div className="h-12 bg-background border-b border-border flex items-center px-4 justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-foreground">Codexel.ai</h1>
        
        <div className="flex space-x-1">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant={activePreset === preset.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onPresetChange(preset.id)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Badge variant="outline">
          ${cost.toFixed(2)} / ${maxCost}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}