import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Palette, 
  Volume2, 
  Users, 
  Smile,
  Zap,
  Brain,
  Languages,
  Briefcase,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdvancedAvatarControlProps {
  onStyleChange: (style: AvatarStyle) => void;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
  onPersonalityChange: (personality: PersonalitySettings) => void;
}

export interface AvatarStyle {
  type: 'cartoon' | 'realistic' | 'professional' | 'futuristic';
  primaryColor: string;
  secondaryColor: string;
  animationSpeed: number;
  backgroundTheme: string;
}

export interface VoiceSettings {
  pitch: number;
  speed: number;
  emotion: 'neutral' | 'enthusiastic' | 'professional' | 'friendly' | 'empathetic';
  language: string;
  accent: string;
}

export interface PersonalitySettings {
  role: string;
  traits: string[];
  expertise: string[];
  conversationStyle: 'formal' | 'casual' | 'persuasive' | 'consultative';
}

export default function AdvancedAvatarControl({
  onStyleChange,
  onVoiceSettingsChange,
  onPersonalityChange
}: AdvancedAvatarControlProps) {
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>({
    type: 'professional',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    animationSpeed: 1,
    backgroundTheme: 'modern'
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    pitch: 1.0,
    speed: 1.0,
    emotion: 'enthusiastic',
    language: 'en-US',
    accent: 'american'
  });

  const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({
    role: 'AI Marketing Expert',
    traits: ['knowledgeable', 'friendly', 'persuasive', 'professional'],
    expertise: ['digital marketing', 'sales', 'branding', 'automation'],
    conversationStyle: 'persuasive'
  });

  const avatarStyles = [
    { id: 'cartoon', name: 'Cartoon', icon: Smile, color: 'bg-pink-500' },
    { id: 'realistic', name: 'Realistic', icon: Users, color: 'bg-blue-500' },
    { id: 'professional', name: 'Professional', icon: Briefcase, color: 'bg-gray-500' },
    { id: 'futuristic', name: 'Futuristic', icon: Zap, color: 'bg-purple-500' }
  ];

  const emotions = [
    { id: 'neutral', name: 'Neutral', icon: Users },
    { id: 'enthusiastic', name: 'Enthusiastic', icon: Sparkles },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'friendly', name: 'Friendly', icon: Smile },
    { id: 'empathetic', name: 'Empathetic', icon: Heart }
  ];

  const conversationStyles = [
    { id: 'formal', name: 'Formal', description: 'Professional and structured' },
    { id: 'casual', name: 'Casual', description: 'Relaxed and conversational' },
    { id: 'persuasive', name: 'Persuasive', description: 'Sales-focused and convincing' },
    { id: 'consultative', name: 'Consultative', description: 'Advisory and solution-oriented' }
  ];

  useEffect(() => {
    onStyleChange(avatarStyle);
  }, [avatarStyle, onStyleChange]);

  useEffect(() => {
    onVoiceSettingsChange(voiceSettings);
  }, [voiceSettings, onVoiceSettingsChange]);

  useEffect(() => {
    onPersonalityChange(personalitySettings);
  }, [personalitySettings, onPersonalityChange]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Advanced Avatar Control
        </CardTitle>
        <CardDescription>
          Customize your AI's appearance, voice, and personality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Avatar Style</h4>
              <div className="grid grid-cols-2 gap-2">
                {avatarStyles.map((style) => {
                  const Icon = style.icon;
                  return (
                    <Button
                      key={style.id}
                      variant={avatarStyle.type === style.id ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setAvatarStyle({ ...avatarStyle, type: style.id as any })}
                    >
                      <div className={`w-4 h-4 rounded ${style.color} mr-2`} />
                      <Icon className="w-4 h-4 mr-2" />
                      {style.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Color Scheme</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Primary Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={avatarStyle.primaryColor}
                      onChange={(e) => setAvatarStyle({ ...avatarStyle, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-sm font-mono">{avatarStyle.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Secondary Color</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={avatarStyle.secondaryColor}
                      onChange={(e) => setAvatarStyle({ ...avatarStyle, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <span className="text-sm font-mono">{avatarStyle.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Animation Speed</h4>
              <Slider
                value={[avatarStyle.animationSpeed]}
                onValueChange={(value) => setAvatarStyle({ ...avatarStyle, animationSpeed: value[0] })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slower</span>
                <span>{avatarStyle.animationSpeed}x</span>
                <span>Faster</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Voice Emotion</h4>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion) => {
                  const Icon = emotion.icon;
                  return (
                    <Button
                      key={emotion.id}
                      size="sm"
                      variant={voiceSettings.emotion === emotion.id ? 'default' : 'outline'}
                      onClick={() => setVoiceSettings({ ...voiceSettings, emotion: emotion.id as any })}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {emotion.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Speaking Speed</h4>
              <Slider
                value={[voiceSettings.speed]}
                onValueChange={(value) => setVoiceSettings({ ...voiceSettings, speed: value[0] })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Slower</span>
                <span>{voiceSettings.speed}x</span>
                <span>Faster</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Voice Pitch</h4>
              <Slider
                value={[voiceSettings.pitch]}
                onValueChange={(value) => setVoiceSettings({ ...voiceSettings, pitch: value[0] })}
                min={0.5}
                max={2}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Lower</span>
                <span>{voiceSettings.pitch}x</span>
                <span>Higher</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Language & Accent</h4>
              <div className="space-y-2">
                <select
                  value={voiceSettings.language}
                  onChange={(e) => setVoiceSettings({ ...voiceSettings, language: e.target.value })}
                  className="w-full p-2 rounded border bg-background"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="it-IT">Italian</option>
                  <option value="pt-BR">Portuguese (Brazil)</option>
                  <option value="zh-CN">Chinese (Mandarin)</option>
                  <option value="ja-JP">Japanese</option>
                </select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="personality" className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">AI Role</h4>
              <input
                type="text"
                value={personalitySettings.role}
                onChange={(e) => setPersonalitySettings({ ...personalitySettings, role: e.target.value })}
                className="w-full p-2 rounded border bg-background"
                placeholder="e.g., AI Marketing Expert"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Conversation Style</h4>
              <div className="space-y-2">
                {conversationStyles.map((style) => (
                  <Button
                    key={style.id}
                    variant={personalitySettings.conversationStyle === style.id ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setPersonalitySettings({ 
                      ...personalitySettings, 
                      conversationStyle: style.id as any 
                    })}
                  >
                    <div className="text-left">
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-muted-foreground">{style.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Personality Traits</h4>
              <div className="flex flex-wrap gap-2">
                {personalitySettings.traits.map((trait, index) => (
                  <Badge key={index} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Areas of Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {personalitySettings.expertise.map((area, index) => (
                  <Badge key={index} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}