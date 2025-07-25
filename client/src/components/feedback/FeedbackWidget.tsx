import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  X, 
  Bug, 
  Plus, 
  ArrowUp, 
  Heart,
  Layout,
  Zap,
  Brain,
  Rocket,
  Star,
  Send,
  CheckCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FeedbackConfig {
  enabled: boolean;
  position: string;
  triggers: string[];
  categories: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
  types: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

export default function FeedbackWidget() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'trigger' | 'type' | 'form' | 'success'>('trigger');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Get widget configuration
  const { data: config, error } = useQuery<FeedbackConfig>({
    queryKey: ['/api/feedback/widget/config'],
    enabled: true,
    retry: 1
  });

  // Submit feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: any) => {
      return apiRequest('POST', '/api/feedback/submit', feedback);
    },
    onSuccess: () => {
      setStep('success');
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  // Quick feedback mutation
  const quickFeedbackMutation = useMutation({
    mutationFn: async (data: { feature: string; rating: 'like' | 'dislike'; context?: string }) => {
      return apiRequest('POST', '/api/feedback/quick', {
        userId: 'user_1', // In real app, get from auth
        ...data
      });
    },
    onSuccess: () => {
      toast({
        title: "Thanks for the feedback!",
        description: "Your quick rating helps us improve.",
      });
    }
  });

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'bug': Bug,
      'plus': Plus,
      'arrow-up': ArrowUp,
      'heart': Heart,
      'layout': Layout,
      'zap': Zap,
      'brain': Brain,
      'rocket': Rocket,
      'message-circle': MessageSquare
    };
    return icons[iconName] || MessageSquare;
  };

  const handleSubmit = () => {
    if (!selectedType || !selectedCategory || !formData.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitFeedbackMutation.mutate({
      userId: 'user_1', // In real app, get from auth
      type: selectedType,
      category: selectedCategory,
      title: formData.title,
      description: formData.description,
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: `session_${Date.now()}`,
        browserInfo: {
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: new Date().toISOString()
        }
      }
    });
  };

  const resetWidget = () => {
    setStep('trigger');
    setSelectedType('');
    setSelectedCategory('');
    setFormData({ title: '', description: '' });
    setIsOpen(false);
  };



  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Feedback Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96">
          <Card className="shadow-xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Feedback</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetWidget}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                {step === 'trigger' && "Help us improve Codexel.ai"}
                {step === 'type' && "What type of feedback do you have?"}
                {step === 'form' && "Tell us more about your experience"}
                {step === 'success' && "Thank you for your feedback!"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Step 1: Feedback Type Selection */}
              {step === 'type' && config?.types && (
                <div className="space-y-3">
                  {config.types.map((type) => {
                    const IconComponent = getIcon(type.icon);
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          setSelectedType(type.id);
                          setStep('form');
                        }}
                        className="w-full p-3 text-left border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Feedback Form */}
              {step === 'form' && (
                <div className="space-y-4">
                  {/* Category Selection */}
                  <div>
                    <Label>Category</Label>
                    <select
                      className="w-full mt-1 p-2 border rounded-md"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {config?.categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief summary of your feedback"
                      maxLength={200}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Provide more details about your feedback"
                      rows={3}
                      maxLength={2000}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep('type')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitFeedbackMutation.isPending || !formData.title.trim()}
                      className="flex-1 gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Success State */}
              {step === 'success' && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Thank You!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your feedback helps us make Codexel.ai better for everyone.
                    </p>
                  </div>
                  <Button onClick={resetWidget} className="w-full">
                    Close
                  </Button>
                </div>
              )}

              {/* Initial Trigger State */}
              {step === 'trigger' && (
                <div className="space-y-3">
                  <Button 
                    onClick={() => setStep('type')}
                    className="w-full gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Give Feedback
                  </Button>
                  
                  {/* Quick Rating Options */}
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Quick rating:</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickFeedbackMutation.mutate({ 
                          feature: 'overall_experience', 
                          rating: 'like' 
                        })}
                        disabled={quickFeedbackMutation.isPending}
                        className="flex-1 gap-1"
                      >
                        <Heart className="h-3 w-3" />
                        Love it
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => quickFeedbackMutation.mutate({ 
                          feature: 'overall_experience', 
                          rating: 'dislike' 
                        })}
                        disabled={quickFeedbackMutation.isPending}
                        className="flex-1 gap-1"
                      >
                        <Star className="h-3 w-3" />
                        Could be better
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Quick feedback hook for inline use
export function useQuickFeedback() {
  const quickFeedbackMutation = useMutation({
    mutationFn: async (data: { feature: string; rating: 'like' | 'dislike'; context?: string }) => {
      return apiRequest('POST', '/api/feedback/quick', {
        userId: 'user_1', // In real app, get from auth
        ...data
      });
    }
  });

  return quickFeedbackMutation.mutate;
}