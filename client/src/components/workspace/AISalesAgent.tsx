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
import Avatar3D from './Avatar3D';
import VoiceCloneSetup from './VoiceCloneSetup';
import VoiceControls from './VoiceControls';
import EmergencyStopButton from './EmergencyStopButton';
import { speakWithVoice } from "@/utils/voiceUtils";

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
  const [avatarImage, setAvatarImage] = useState<string>();
  const [voiceRecording, setVoiceRecording] = useState<string>();
  const [isRecording, setIsRecording] = useState(false);
  const [isAITalking, setIsAITalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customVoiceId, setCustomVoiceId] = useState<string>();
  const [showVoiceSetup, setShowVoiceSetup] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize with personalized greeting and load saved avatar/voice
  useEffect(() => {
    // Load saved avatar image and voice settings
    const savedAvatarImage = localStorage.getItem('codexel_avatar_image');
    const savedVoiceRecording = localStorage.getItem('codexel_voice_recording');
    const savedCustomVoiceId = localStorage.getItem('codexel_custom_voice_id');
    
    if (savedAvatarImage) {
      setAvatarImage(savedAvatarImage);
    }
    if (savedVoiceRecording) {
      setVoiceRecording(savedVoiceRecording);
    }
    if (savedCustomVoiceId) {
      setCustomVoiceId(savedCustomVoiceId);
    }
    
    // Always show voice setup initially for better user experience
    setShowVoiceSetup(true);

    const initialMessage: AgentMessage = {
      id: '1',
      role: 'agent',
      content: `Hi! I'm ${currentAgent.name}, your AI Success Strategist. I see you've chosen the ${selectedTemplate.name} template - excellent choice! 🎯

${savedAvatarImage ? 'I can see your photo is already loaded - I look just like you!' : 'Upload your photo above to make me look exactly like you!'} ${savedCustomVoiceId ? 'And I can speak with YOUR cloned voice! This is the ultimate personalized AI experience!' : 'Complete the voice setup to make me speak with your actual voice - ultimate personalization!'}

Let me tell you about something that will save you MONTHS of development time and thousands of dollars...`,
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
    // Don't automatically speak the initial message

    // Remove automatic messages - user controls the conversation
  }, []);

  const speakMessage = async (text: string) => {
    if (!voiceEnabled || isMuted) return;

    setIsSpeaking(true);
    setIsAITalking(true);

    // Use custom voice clone if available
    if (customVoiceId) {
      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voiceId: customVoiceId
          })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.onended = () => {
            setIsSpeaking(false);
            setIsAITalking(false);
            URL.revokeObjectURL(audioUrl);
          };
          
          await audio.play();
          return;
        }
      } catch (error) {
        console.error('Custom voice failed, falling back to browser TTS:', error);
      }
    }

    // Fallback to Web Speech API
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    
    // Select voice based on agent
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Aria') || v.name.includes('Female'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsAITalking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsAITalking(false);
    };

    speechSynthesis.speak(utterance);
    synthRef.current = utterance;
  };

  const stopAllAudio = () => {
    console.log('stopAllAudio called from AISalesAgent');
    
    // Stop speech synthesis immediately and forcefully
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      // Clear the queue
      while (window.speechSynthesis.pending || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      console.log('Speech synthesis forcefully stopped');
    }
    
    // Stop current synthesis reference
    if (synthRef.current) {
      synthRef.current.onend = null;
      synthRef.current = null;
    }
    
    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio');
    console.log(`Stopping ${audioElements.length} audio elements`);
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.src = '';
    });

    setIsSpeaking(false);
    setIsAITalking(false);
    setVoiceEnabled(false); // Completely disable voice
    
    // Note: Cannot override speechSynthesis as it's read-only
    // Instead, we rely on the aggressive cancellation above
    
    console.log('All audio stopped, voice disabled, speechSynthesis overridden');
  };

  const handleMute = () => {
    setIsMuted(true);
    stopAllAudio();
  };

  const handleUnmute = () => {
    setIsMuted(false);
  };

  const addAgentMessage = (content: string) => {
    const newMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'agent',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    // Only speak if user explicitly enables voice or clicks a speak button
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

    // Show recommendations only when user requests them
    recommendations.forEach((rec, index) => {
      const stack = availableStacks.find(s => s.id === rec.stack);
      if (stack) {
        const newMessage: AgentMessage = {
          id: `rec-${index}`,
          role: 'agent',
          content: `${stack.icon} ${stack.name}: ${rec.pitch}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
      }
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

    // AI responds only when user sends a message - no automatic responses
    if (inputValue.toLowerCase().includes('price') || inputValue.toLowerCase().includes('cost')) {
      const responseMessage: AgentMessage = {
        id: Date.now().toString() + '-response',
        role: 'agent',
        content: "I get it - budget concerns are real! But here's what I tell every successful law firm owner: What's the cost of NOT having leads? Missing just ONE case could cost you $50,000+. Our entire marketing stack costs less than what you charge for a single case consultation!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
    } else if (inputValue.toLowerCase().includes('time') || inputValue.toLowerCase().includes('busy')) {
      const responseMessage: AgentMessage = {
        id: Date.now().toString() + '-response',
        role: 'agent',
        content: "That's exactly WHY you need this! You're too busy to be manually posting on social media, writing blogs, and following up with leads. Time is the one thing you can't get back - every hour you spend on marketing tasks is an hour not practicing law. Let AI handle the marketing so you can focus on what you do best!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
    } else if (inputValue.toLowerCase().includes('think about it') || inputValue.toLowerCase().includes('later')) {
      const responseMessage: AgentMessage = {
        id: Date.now().toString() + '-response',
        role: 'agent',
        content: "I totally understand wanting to think it over! But here's what I've seen - law firms that wait usually come back in 3-6 months saying they wish they'd started sooner. Your competitors are already using AI marketing. Every day of delay is potential clients going to them instead of you. What specific concerns can I address right now?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
    } else if (inputValue.toLowerCase().includes('show me') || inputValue.toLowerCase().includes('recommendations')) {
      showStackRecommendations();
    } else {
      const responseMessage: AgentMessage = {
        id: Date.now().toString() + '-response',
        role: 'agent',
        content: "Thanks for your message! I'm here to help you build amazing applications with AI. What would you like to know about our development platform?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, responseMessage]);
    }
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

  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageDataUrl = e.target.result as string;
        setAvatarImage(imageDataUrl);
        
        // Store in localStorage for persistence across sessions
        localStorage.setItem('codexel_avatar_image', imageDataUrl);
        localStorage.setItem('codexel_avatar_name', file.name);
        
        // Add personalized response from the AI agent
        setTimeout(() => {
          addAgentMessage(
            `🎉 WOW! This is incredible - I can see you now and I look just like you! This is absolutely revolutionary technology that doesn't exist anywhere else!

You've just created the world's first truly personalized AI sales assistant. When your clients see YOUR face as their AI helper, it builds instant trust and connection. This gives you an unfair competitive advantage!

${voiceRecording ? 'And since I already have your voice recording, I can speak exactly like you too! Complete personalization!' : 'Now record your voice so I can speak exactly like you - complete visual and audio personalization!'}

No other platform offers this level of customization where your AI agent looks AND sounds like YOU. Your competitors will be asking "How did they do that?!"

Your AI-powered business is going to be unstoppable! 🚀`
          );
        }, 500);
      }
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceRecording(audioUrl);
        
        // Convert to base64 and store
        const reader = new FileReader();
        reader.onload = () => {
          const base64Audio = reader.result as string;
          localStorage.setItem('codexel_voice_recording', base64Audio);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Voice recording complete - no automatic response
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 30000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      addAgentMessage('Sorry, I need microphone access to record your voice. Please allow microphone permissions and try again.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      
      {/* Emergency Stop Button - Always Visible */}
      <EmergencyStopButton onClick={stopAllAudio} />
      
      {/* Voice Controls - Hidden for clean UI */}
      <div className="hidden">
        <VoiceControls 
          isAITalking={isAITalking}
          onMute={handleMute}
          onUnmute={handleUnmute}
          onStopAll={stopAllAudio}
        />
      </div>
      
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Avatar Interface - Modern Glassmorphism */}
          <div className="h-[700px] backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">AI Sales Agent</h2>
                  <p className="text-sm text-gray-400 mt-1">Your Personalized AI Assistant</p>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    Live
                  </div>
                </Badge>
              </div>
            </div>
            <div className="h-[calc(100%-88px)]">
              <Avatar3D
                isSpeaking={isSpeaking}
                isMuted={!voiceEnabled}
                onToggleMute={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled && synthRef.current) {
                    speechSynthesis.cancel();
                  }
                }}
                message={messages[messages.length - 1]?.content || ''}
                onImageUpload={handleAvatarUpload}
                avatarUrl={avatarImage}
                onStartRecording={startVoiceRecording}
                onStopRecording={stopVoiceRecording}
                isRecording={isRecording}
                hasVoiceRecording={!!voiceRecording}
              />
            </div>
          </div>

        {/* Voice Setup Modal */}
        {showVoiceSetup && (
          <Card className="fixed inset-4 z-50 bg-background/95 backdrop-blur-sm border shadow-2xl">
            <CardContent className="p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Complete Your Voice Setup</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVoiceSetup(false)}
                >
                  Skip for Now
                </Button>
              </div>
              <VoiceCloneSetup 
                onVoiceCloned={(voiceId) => {
                  setCustomVoiceId(voiceId);
                  localStorage.setItem('codexel_custom_voice_id', voiceId);
                  setShowVoiceSetup(false);
                  addAgentMessage("🎉 Perfect! I can now speak with your actual voice! This is revolutionary - your clients will hear YOUR voice speaking to them. This creates unprecedented trust and connection!");
                }}
              />
            </CardContent>
          </Card>
        )}

          {/* Chat Interface - Modern Glassmorphism */}
          <div className="h-[700px] backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{currentAgent.avatar}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{currentAgent.name}</h3>
                    <p className="text-sm text-gray-400">{currentAgent.role} • Online</p>
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
                <Badge className="bg-white/10 text-gray-300 border-white/20 text-xs">
                  {messages.length} messages
                </Badge>
              </div>
            </div>
          
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
          
            <div className="p-4 border-t border-white/10">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about pricing, features, or success stories..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
                <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>

        {/* Stack Selection and Value Proposition */}
        <div className="space-y-6">
          {/* Value Metrics - Modern Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="backdrop-blur-xl bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold">${calculateSavings().toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Monthly Savings</p>
            </div>
            <div className="backdrop-blur-xl bg-blue-500/10 rounded-xl border border-blue-500/20 p-4">
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">480 hrs</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">Development Time Saved</p>
            </div>
          </div>

          {/* Stack Selection - Modern Glassmorphism */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">Your AI Marketing Team</h3>
              <p className="text-sm text-gray-400 mt-1">
                Select the AI agents that will work 24/7 for your law firm
              </p>
            </div>
            <div className="p-6">
              <ScrollArea className="h-[320px] pr-4">
                <div className="space-y-3">
                  {availableStacks.map((stack) => (
                    <motion.div
                      key={stack.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div 
                        className={cn(
                          "relative backdrop-blur-xl bg-white/5 rounded-xl border cursor-pointer transition-all duration-300 hover:bg-white/10",
                          selectedStacks.includes(stack.id) 
                            ? "border-primary bg-primary/10" 
                            : "border-white/10"
                        )}
                        onClick={() => handleStackToggle(stack.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl filter drop-shadow-lg">{stack.icon}</span>
                                <h4 className="font-semibold text-white">{stack.name}</h4>

                              </div>
                              <p className="text-sm text-gray-400 mt-1">
                                {stack.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-3">
                                {stack.features.map((feature) => (
                                  <Badge key={feature} className="text-xs bg-white/10 text-gray-300 border-white/20">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500 line-through">
                                ${stack.originalPrice}/mo
                              </p>
                              <p className="text-lg font-bold text-emerald-400">
                                ${stack.bundlePrice}/mo
                              </p>
                            </div>
                          </div>
                          {selectedStacks.includes(stack.id) && (
                            <div className="absolute top-2 right-2">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Action Buttons - Modern Glassmorphism */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-lg text-gray-300">Total Investment:</span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">${totalPrice}</div>
                    <div className="text-sm text-gray-400">per month</div>
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
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
                  className="w-full border-white/10 text-gray-300 hover:bg-white/5"
                  onClick={() => {
                    addAgentMessage(
                      "Smart thinking! Let me send you our ROI calculator. Law firms typically see 300-500% ROI in the first 90 days. What's your email?"
                    );
                  }}
                >
                  Show Me The ROI Calculator
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}