import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Command, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';

interface VoiceControlProps {
  onLayoutCommand: (command: string, params?: any) => void;
  onNavigationCommand: (route: string) => void;
  onPanelCommand: (panel: string, action: string) => void;
  className?: string;
}

export default function VoiceControl({
  onLayoutCommand,
  onNavigationCommand,
  onPanelCommand,
  className = ''
}: VoiceControlProps) {
  const [showCommands, setShowCommands] = useState(false);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);

  const {
    isListening,
    isSupported,
    lastCommand,
    confidence,
    startListening,
    stopListening,
    toggleListening,
    availableCommands
  } = useVoiceCommands({
    onLayoutCommand: (command, params) => {
      addRecentCommand(`Layout: ${command}`);
      onLayoutCommand(command, params);
    },
    onNavigationCommand: (route) => {
      addRecentCommand(`Navigate: ${route}`);
      onNavigationCommand(route);
    },
    onPanelCommand: (panel, action) => {
      addRecentCommand(`Panel: ${action} ${panel}`);
      onPanelCommand(panel, action);
    }
  });

  const addRecentCommand = (command: string) => {
    setRecentCommands(prev => [command, ...prev.slice(0, 4)]);
  };

  if (!isSupported) {
    return (
      <Card className={`bg-muted/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MicOff className="w-4 h-4" />
            <span className="text-sm">Voice commands not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Voice Control Panel */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Command className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-purple-400">Voice Control</span>
              {isListening && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse">
                  Listening
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={showCommands ? "default" : "outline"}
                onClick={() => setShowCommands(!showCommands)}
                className="text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                Commands
              </Button>
              
              <Button
                size="sm"
                variant={isListening ? "destructive" : "default"}
                onClick={toggleListening}
                className={isListening ? "animate-pulse" : ""}
              >
                {isListening ? <MicOff className="w-4 h-4 mr-1" /> : <Mic className="w-4 h-4 mr-1" />}
                {isListening ? 'Stop' : 'Listen'}
              </Button>
            </div>
          </div>

          {/* Last Command & Confidence */}
          {lastCommand && (
            <div className="mb-3 p-2 bg-black/20 rounded border border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">"{lastCommand}"</span>
                <Badge 
                  variant={confidence > 0.8 ? "default" : confidence > 0.6 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {Math.round(confidence * 100)}%
                </Badge>
              </div>
            </div>
          )}

          {/* Recent Commands */}
          {recentCommands.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-1">Recent:</div>
              <div className="flex flex-wrap gap-1">
                {recentCommands.map((cmd, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {cmd}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Voice Commands Help */}
          <AnimatePresence>
            {showCommands && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="text-xs text-muted-foreground mb-2">Try saying:</div>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className="p-2 bg-black/10 rounded border border-blue-500/20">
                    <span className="text-blue-400">"maximize preview panel"</span> - Expand the preview area
                  </div>
                  <div className="p-2 bg-black/10 rounded border border-green-500/20">
                    <span className="text-green-400">"focus on conversation"</span> - Highlight chat area
                  </div>
                  <div className="p-2 bg-black/10 rounded border border-purple-500/20">
                    <span className="text-purple-400">"show sidebar"</span> - Display navigation panel
                  </div>
                  <div className="p-2 bg-black/10 rounded border border-orange-500/20">
                    <span className="text-orange-400">"split screen"</span> - Enable split view mode
                  </div>
                  <div className="p-2 bg-black/10 rounded border border-red-500/20">
                    <span className="text-red-400">"reset layout"</span> - Return to default view
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Floating Voice Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 right-4 z-50"
          >
            <Card className="bg-green-500/90 border-green-400 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-white">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Voice Control Active</span>
                </div>
                <div className="text-xs text-green-100 mt-1">Say a command...</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}