import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress'; // Component doesn't exist, we'll create a simple one inline
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Play, Square, Upload, Wand2, Check, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { audioProcessor } from '@/utils/audioProcessing';
import NoiseReductionIndicator from './NoiseReductionIndicator';

interface VoiceCloneSetupProps {
  onVoiceCloned: (voiceId: string) => void;
  onClose?: () => void;
  className?: string;
}

interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export default function VoiceCloneSetup({ onVoiceCloned, onClose, className = '' }: VoiceCloneSetupProps) {
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [voiceName, setVoiceName] = useState('My Custom Voice');
  const [step, setStep] = useState<'instructions' | 'recording' | 'processing' | 'complete'>('instructions');
  const [audioLevels, setAudioLevels] = useState({ volume: 0, noise: 0, quality: 'poor' as const });
  const [recordingQuality, setRecordingQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('poor');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const sampleTexts = [
    "Hello, I'm excited to create my AI voice clone with Codexel. This technology will help me connect with clients in a more personal way.",
    "Thank you for choosing our services. I'm here to help you build an amazing business with cutting-edge AI technology.",
    "Welcome to the future of personalized AI assistants. Your success is our priority, and we're committed to delivering exceptional results."
  ];

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recording.audioUrl) URL.revokeObjectURL(recording.audioUrl);
      // Cleanup audio processor when component unmounts
      audioProcessor.cleanup();
    };
  }, [recording.audioUrl]);

  const startRecording = async () => {
    try {
      // Use enhanced audio processing for noise reduction
      const stream = await audioProcessor.getEnhancedMediaStream({
        audio: { 
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      const audioChunks: Blob[] = [];

      mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Process audio for enhanced quality and noise reduction
        const processedBlob = await audioProcessor.processRecordedAudio(audioBlob);
        const audioUrl = URL.createObjectURL(processedBlob);
        
        setRecording(prev => ({
          ...prev,
          audioBlob: processedBlob,
          audioUrl,
          isRecording: false
        }));
        
        stream.getTracks().forEach(track => track.stop());
        setStep('recording');
      });

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      
      setRecording(prev => ({ ...prev, isRecording: true, duration: 0 }));
      
      // Track duration and audio quality
      intervalRef.current = setInterval(() => {
        setRecording(prev => ({ ...prev, duration: prev.duration + 1 }));
        
        // Update audio levels for real-time feedback
        const levels = audioProcessor.getAudioLevels();
        setAudioLevels(levels);
        setRecordingQuality(levels.quality);
      }, 100); // Update more frequently for responsive feedback

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to record your voice.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording.isRecording) {
      mediaRecorderRef.current.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current && recording.audioUrl) {
      audioRef.current.play();
    }
  };

  const processVoiceClone = async () => {
    if (!recording.audioBlob) return;

    setIsProcessing(true);
    setStep('processing');
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const formData = new FormData();
      formData.append('audio', recording.audioBlob, 'voice-sample.wav');
      formData.append('name', voiceName);
      formData.append('description', 'Custom voice clone created with Codexel.ai');

      const response = await apiRequest('POST', '/api/voice/clone', formData);
      const result = await response.json();

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        setStep('complete');
        onVoiceCloned(result.voice_id);
        toast({
          title: "Voice Clone Created!",
          description: "Your personalized AI voice is ready to use.",
        });
      }, 1000);

    } catch (error) {
      console.error('Voice cloning error:', error);
      setStep('recording');
      toast({
        title: "Voice Cloning Failed",
        description: "Please try recording again with clear audio.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    if (recording.audioUrl) URL.revokeObjectURL(recording.audioUrl);
    setRecording({
      isRecording: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null
    });
    setStep('instructions');
    setProgress(0);
  };

  return (
    <div className="relative">
      {/* Noise Reduction Indicator */}
      <NoiseReductionIndicator 
        isActive={recording.isRecording}
        audioLevels={audioLevels}
      />
      
      <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-500" />
              Voice Clone Setup
            </CardTitle>
            <CardDescription>
              Create your personalized AI voice in 3 simple steps
            </CardDescription>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {['Instructions', 'Recording', 'Processing', 'Complete'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= ['instructions', 'recording', 'processing', 'complete'].indexOf(step)
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {index < ['instructions', 'recording', 'processing', 'complete'].indexOf(step) ? 
                  <Check className="w-4 h-4" /> : index + 1
                }
              </div>
              {index < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'instructions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <h3 className="font-medium text-purple-400 mb-2">Advanced Noise Reduction Active:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI-powered background noise elimination</li>
                  <li>• Real-time audio enhancement and filtering</li>
                  <li>• Dynamic range compression for clear voice</li>
                  <li>• Automatic gain control and echo cancellation</li>
                  <li>• Professional studio-quality processing</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Label>Choose a sample text to read:</Label>
                {sampleTexts.map((text, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded border text-sm">
                    "{text}"
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceName">Voice Name</Label>
                <Input
                  id="voiceName"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="My Custom Voice"
                />
              </div>

              <Button onClick={startRecording} className="w-full">
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            </motion.div>
          )}

          {step === 'recording' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center space-y-3">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  recording.isRecording ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {recording.isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
                  {recording.isRecording ? 'Recording...' : 'Recording Complete'}
                  <Badge variant="secondary">{Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}</Badge>
                </div>

                {/* Real-time audio quality feedback */}
                {recording.isRecording && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Volume:</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 transition-all duration-100" 
                            style={{ width: `${Math.min(audioLevels.volume * 2, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Noise:</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 transition-all duration-100" 
                            style={{ width: `${Math.min(audioLevels.noise * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <Badge 
                      className={`${
                        recordingQuality === 'excellent' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        recordingQuality === 'good' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        recordingQuality === 'fair' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}
                    >
                      Quality: {recordingQuality}
                    </Badge>
                  </div>
                )}
              </div>

              {recording.isRecording ? (
                <Button onClick={stopRecording} variant="destructive" className="w-full">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
              ) : recording.audioUrl ? (
                <div className="space-y-3">
                  <audio ref={audioRef} src={recording.audioUrl} className="w-full" />
                  <div className="flex gap-2">
                    <Button onClick={playRecording} variant="outline" className="flex-1">
                      <Play className="w-4 h-4 mr-2" />
                      Play Recording
                    </Button>
                    <Button onClick={resetProcess} variant="outline">
                      Re-record
                    </Button>
                  </div>
                  <Button onClick={processVoiceClone} className="w-full">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Create Voice Clone
                  </Button>
                </div>
              ) : null}
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-500/20 rounded-full">
                <Wand2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
              <h3 className="text-lg font-medium">Creating Your Voice Clone...</h3>
              <p className="text-muted-foreground">This may take a few moments</p>
              {/* Simple progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{progress}% Complete</p>
            </motion.div>
          )}

          {step === 'complete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 text-center"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-500/20 rounded-full">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-medium">Voice Clone Created!</h3>
              <p className="text-muted-foreground">
                Your AI assistant can now speak with your voice
              </p>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Ready to Use
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
    </div>
  );
}