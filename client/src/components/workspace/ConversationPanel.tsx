import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Sparkles } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { AIModel } from '@/lib/ai-models';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationPanelProps {
  messages: Message[];
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ConversationPanel({ 
  messages, 
  selectedModel, 
  onModelChange, 
  onSendMessage, 
  isLoading 
}: ConversationPanelProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Conversation
            </h2>
            <p className="text-sm text-muted-foreground">Chat with {selectedModel}</p>
          </div>
          <ModelSelector value={selectedModel} onChange={onModelChange} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <p>Start a conversation to begin building your application</p>
          </div>
        ) : (
          messages.map((message) => (
            <Card key={message.id} className={`p-3 ${
              message.role === 'user' 
                ? 'ml-8 bg-primary text-primary-foreground' 
                : 'mr-8 bg-muted'
            }`}>
              <div className="text-sm font-medium mb-1">
                {message.role === 'user' ? 'You' : selectedModel}
              </div>
              <div className="text-sm">{message.content}</div>
            </Card>
          ))
        )}
        
        {isLoading && (
          <Card className="mr-8 bg-muted p-3">
            <div className="text-sm font-medium mb-1">{selectedModel}</div>
            <div className="text-sm text-muted-foreground">Thinking...</div>
          </Card>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you want to build..."
            className="min-h-[60px] resize-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}