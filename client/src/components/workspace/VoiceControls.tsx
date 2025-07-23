import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  VolumeX, 
  Volume2, 
  Pause, 
  Play, 
  RotateCcw,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface VoiceControlsProps {
  isAITalking: boolean;
  onMute: () => void;
  onUnmute: () => void;
  onStopAll: () => void;
  className?: string;
}

export default function VoiceControls({ 
  isAITalking, 
  onMute, 
  onUnmute, 
  onStopAll,
  className = '' 
}: VoiceControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isEmergencyMute, setIsEmergencyMute] = useState(false);
  const { toast } = useToast();

  // Emergency mute function - immediately stops all AI audio
  const emergencyMute = () => {
    console.log('Emergency mute activated - clearing all audio!');
    
    // Stop all speech synthesis immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('Speech synthesis cancelled');
    }
    
    // Stop all audio elements
    const audioElements = document.querySelectorAll('audio');
    console.log(`Found ${audioElements.length} audio elements`);
    audioElements.forEach((audio, index) => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      console.log(`Stopped audio element ${index}`);
    });

    // Stop all video elements (sometimes used for audio)
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      video.pause();
      video.currentTime = 0;
      video.volume = 0;
    });

    // Force stop any Web Audio API contexts
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.suspend();
    } catch (e) {
      console.log('AudioContext cleanup failed:', e);
    }

    setIsEmergencyMute(true);
    setIsMuted(true);
    
    // Call the parent's stop function
    onStopAll();
    
    // More aggressive stopping
    setTimeout(() => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }, 100);
    
    // Note: speechSynthesis is read-only, so we rely on aggressive cancellation instead

    toast({
      title: "EMERGENCY STOP ACTIVATED",
      description: "All AI audio has been forcibly terminated",
      variant: "destructive",
    });

    // Reset emergency state after 5 seconds
    setTimeout(() => {
      setIsEmergencyMute(false);
    }, 5000);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      onUnmute();
    } else {
      setIsMuted(true);
      onMute();
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    
    // Apply volume to all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = newVolume[0] / 100;
    });

    // Apply to speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices().forEach(voice => {
        // Volume control for speech synthesis is limited
      });
    }
  };

  // Auto-mute when user is recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar for emergency mute
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        emergencyMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-4 left-4 z-[9999] ${className}`}
    >
      <Card className="bg-background/95 backdrop-blur-sm border-red-500/20 min-w-[300px]">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Emergency Mute Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Voice Control</span>
                {isAITalking && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs animate-pulse">
                    AI TALKING
                  </Badge>
                )}
              </div>
              
              <Badge className={cn(
                "text-xs transition-all",
                isEmergencyMute ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-muted text-muted-foreground"
              )}>
                {isEmergencyMute ? "STOPPED" : "ACTIVE"}
              </Badge>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant={isMuted ? "default" : "outline"}
                onClick={toggleMute}
                className="min-w-[100px]"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Muted
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Unmute
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Voice Volume</span>
                <span className="text-xs text-muted-foreground">{volume[0]}%</span>
              </div>
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                min={0}
                step={5}
                className="w-full"
                disabled={isMuted}
              />
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded ${isMuted ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <div className="font-medium">
                  {isMuted ? '✓ Muted' : '⚠ Active'}
                </div>
                <div className="text-xs opacity-75">
                  {isMuted ? 'AI voice disabled' : 'AI can speak'}
                </div>
              </div>
              <div className={`p-2 rounded ${isAITalking ? 'bg-orange-500/10 text-orange-400' : 'bg-muted/50 text-muted-foreground'}`}>
                <div className="font-medium">
                  {isAITalking ? '🎤 Speaking' : '⏸ Silent'}
                </div>
                <div className="text-xs opacity-75">
                  {isAITalking ? 'Audio playing' : 'No audio'}
                </div>
              </div>
            </div>

            {/* Emergency Help */}
            <div className="pt-2 border-t border-muted/50">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>🚨 <span className="font-medium">Emergency:</span> Ctrl + Space to stop all audio</div>
                <div>🎙️ <span className="font-medium">Recording:</span> Use "STOP ALL" button first</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}