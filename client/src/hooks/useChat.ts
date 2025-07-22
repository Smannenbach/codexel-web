import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4');

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await apiRequest('POST', '/api/chat', {
        message: content,
        projectId: 1,
        model: 'gpt-4',
      });

      const data = await response.json();
      console.log('Chat response data:', data); // Debug log

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.content || 'No response received',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    selectedModel,
    setSelectedModel,
  };
}