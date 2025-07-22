import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AI_MODELS, AIModel } from '@/lib/ai-models';

interface ModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const selectedModel = AI_MODELS[value];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-48">
        <SelectValue>
          <div className="flex items-center justify-between w-full">
            <span>{selectedModel.name}</span>
            <div className="flex space-x-1">
              <Badge variant="outline" className="text-xs">
                ${selectedModel.cost}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {selectedModel.provider}
              </Badge>
            </div>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.values(AI_MODELS).map((model) => (
          <SelectItem key={model.id} value={model.id}>
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-muted-foreground">
                  {model.capabilities.slice(0, 3).join(', ')}
                </div>
              </div>
              <div className="flex space-x-1 ml-4">
                <Badge variant="outline" className="text-xs">
                  ${model.cost}
                </Badge>
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{
                    backgroundColor: model.provider === 'OpenAI' ? '#10B981' :
                                   model.provider === 'Anthropic' ? '#8B5CF6' :
                                   model.provider === 'Google' ? '#3B82F6' :
                                   model.provider === 'xAI' ? '#EF4444' :
                                   '#64748B'
                  }}
                >
                  {model.provider}
                </Badge>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}