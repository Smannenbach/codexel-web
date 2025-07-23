import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Send,
  Sparkles,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  User,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { MarketingStack } from '@shared/marketing-stacks';

interface AISalesAgentProps {
  selectedTemplate: any;
  availableStacks: MarketingStack[];
  onStackSelection: (stacks: string[]) => void;
  onComplete: () => void;
}

interface AgentMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const AGENT_PERSONAS = {
  emma: {
    name: 'Emma',
    role: 'Success Strategist',
    avatar: '👩‍💼',
    voice: 'en-US-AriaNeural',
    style: 'friendly and enthusiastic',
  },
  alex: {
    name: 'Alex',
    role: 'Growth Advisor',
    avatar: '👨‍💻',
    voice: 'en-US-GuyNeural',
    style: 'professional and data-driven',
  }
};

export default function AISalesAgent({ 
  selectedTemplate, 
  availableStacks, 
  onStackSelection,
  onComplete 
}: AISalesAgentProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [currentAgent] = useState(AGENT_PERSONAS.emma);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize with personalized greeting based on template
  useEffect(() => {
    const initialMessage: AgentMessage = {
      id: '1',
      role: 'agent',
      content: `Hi! I'm ${currentAgent.name}, your AI Success Strategist. I see you've chosen the ${selectedTemplate.name} template - excellent choice! 🎯\n\nLet me tell you about something that will save you MONTHS of development time and thousands of dollars...`,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    speakMessage(initialMessage.content);

    // Follow up with value proposition
    setTimeout(() => {
      addAgentMessage(
        "Here's the thing - you could spend 6-12 months building all the marketing automation yourself, OR you could have it all working TODAY with our AI-powered Vibe Packs. Time is the one thing you can't get back, right?"
      );
    }, 8000);

    setTimeout(() => {
      addAgentMessage(
        "Let me show you what successful law firms are using to generate 50+ leads per month automatically..."
      );
      showStackRecommendations();
    }, 16000);
  }, []);

  const speakMessage = (text: string) => {
    if (!voiceEnabled) return;

    // Use Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    
    // Select voice based on agent
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Aria') || v.name.includes('Female'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
    synthRef.current = utterance;
  };

  const addAgentMessage = (content: string) => {
    const newMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'agent',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    speakMessage(content);
  };

  const showStackRecommendations = () => {
    const recommendations = [
      {
        stack: 'ai-blog-writer',
        pitch: "The AI Blog Writer generates 20+ SEO-optimized articles per month, each worth $200 if you hired a writer. That's $4,000/month in content value for just $199!",
        savings: '$3,800/month saved',
      },
      {
        stack: 'ai-social-media',
        pitch: "Social Media Manager costs $2,000-4,000/month. Our AI does it better, posting 3x daily across all platforms with perfect timing. Only $149/month!",
        savings: '$2,850/month saved',
      },
      {
        stack: 'ai-lead-manager',
        pitch: "Never lose another lead! AI responds in <2 minutes 24/7. Law firms using this close 3x more cases. Your competitors probably already have this...",
        savings: '3x more revenue',
      }
    ];

    recommendations.forEach((rec, index) => {
      setTimeout(() => {
        const stack = availableStacks.find(s => s.id === rec.stack);
        if (stack) {
          addAgentMessage(`${stack.icon} ${stack.name}: ${rec.pitch}`);
        }
      }, index * 6000);
    });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // AI responds intelligently based on user input with objection handling
    setTimeout(() => {
      if (inputValue.toLowerCase().includes('price') || inputValue.toLowerCase().includes('cost')) {
        addAgentMessage(
          "I get it - budget concerns are real! But here's what I tell every successful law firm owner: What's the cost of NOT having leads? Missing just ONE case could cost you $50,000+. Our entire marketing stack costs less than what you charge for a single case consultation!"
        );
        setTimeout(() => {
          addAgentMessage("Plus, we have ROI guarantee - if you don't see measurable results in 90 days, we refund everything. How many marketing companies offer that?");
        }, 5000);
      } else if (inputValue.toLowerCase().includes('time') || inputValue.toLowerCase().includes('busy')) {
        addAgentMessage(
          "That's exactly WHY you need this! You're too busy to be manually posting on social media, writing blogs, and following up with leads. Time is the one thing you can't get back - every hour you spend on marketing tasks is an hour not practicing law. Let AI handle the marketing so you can focus on what you do best!"
        );
        setTimeout(() => {
          addAgentMessage("Our clients typically save 20+ hours per week on marketing tasks. That's 20 more hours for billable work or family time. What's that worth to you?");
        }, 4000);
      } else if (inputValue.toLowerCase().includes('think about it') || inputValue.toLowerCase().includes('later')) {
        addAgentMessage(
          "I totally understand wanting to think it over! But here's what I've seen - law firms that wait usually come back in 3-6 months saying they wish they'd started sooner. Your competitors are already using AI marketing. Every day of delay is potential clients going to them instead of you. What specific concerns can I address right now?"
        );
      } else {
        addAgentMessage(
          "That's a great point! Let me address that specifically for your law firm. The beauty of our system is it adapts to YOUR practice area and client base automatically. No generic templates - everything is customized by AI to match your firm's voice and values."
        );
      }
    }, 1500);
  };

  const handleStackToggle = (stackId: string) => {
    setSelectedStacks(prev => 
      prev.includes(stackId) 
        ? prev.filter(id => id !== stackId)
        : [...prev, stackId]
    );
  };

  const calculateSavings = () => {
    const monthlySavings = selectedStacks.reduce((total, stackId) => {
      const stack = availableStacks.find(s => s.id === stackId);
      if (stack) {
        // Calculate based on what manual work would cost
        const manualCosts: Record<string, number> = {
          'ai-blog-writer': 4000,
          'ai-social-media': 3000,
          'ai-emailer': 2000,
          'ai-advertiser': 5000,
          'ai-lead-manager': 3500,
          'ai-sales-agent': 4500,
        };
        return total + (manualCosts[stackId] || 2000) - stack.price;
      }
      return total;
    }, 0);

    return monthlySavings;
  };

  const totalPrice = selectedStacks.reduce((sum, stackId) => {
    const stack = availableStacks.find(s => s.id === stackId);
    return sum + (stack?.price || 0);
  }, 0);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{currentAgent.avatar}</div>
                <div>
                  <CardTitle className="text-lg">{currentAgent.name}</CardTitle>
                  <CardDescription>{currentAgent.role} • Online</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant={voiceEnabled ? "default" : "outline"}
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled && synthRef.current) {
                      speechSynthesis.cancel();
                    }
                  }}
                >
                  {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' && "flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                      message.role === 'agent' ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      {message.role === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "flex-1 rounded-lg p-4 max-w-[80%]",
                      message.role === 'agent' 
                        ? "bg-primary/10 text-foreground" 
                        : "bg-muted ml-auto"
                    )}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isSpeaking && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-primary rounded-full animate-pulse" />
                    <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
                    <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-150" />
                  </div>
                  <span className="text-sm">Emma is speaking...</span>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about pricing, features, or success stories..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>

        {/* Stack Selection and Value Proposition */}
        <div className="space-y-6">
          {/* Value Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-2xl font-bold">${calculateSavings().toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Monthly Savings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-blue-600">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">480 hrs</span>
                </div>
                <p className="text-sm text-muted-foreground">Development Time Saved</p>
              </CardContent>
            </Card>
          </div>

          {/* Stack Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Your AI Marketing Team</CardTitle>
              <CardDescription>
                Select the AI agents that will work 24/7 for your law firm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {availableStacks.map((stack) => (
                    <motion.div
                      key={stack.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={cn(
                          "cursor-pointer transition-all",
                          selectedStacks.includes(stack.id) && "ring-2 ring-primary"
                        )}
                        onClick={() => handleStackToggle(stack.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{stack.icon}</span>
                                <h4 className="font-semibold">{stack.name}</h4>

                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {stack.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold">${stack.price}</div>
                              <div className="text-xs text-muted-foreground">/month</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg">Total Investment:</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">${totalPrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => {
                    onStackSelection(selectedStacks);
                    onComplete();
                  }}
                  disabled={selectedStacks.length === 0}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Launch My AI Marketing Team
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    addAgentMessage(
                      "Smart thinking! Let me send you our ROI calculator. Law firms typically see 300-500% ROI in the first 90 days. What's your email?"
                    );
                  }}
                >
                  Show Me The ROI Calculator
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}