import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceCommand {
  pattern: RegExp;
  action: string;
  description: string;
}

interface VoiceCommandsConfig {
  onLayoutCommand: (command: string, params?: any) => void;
  onNavigationCommand: (route: string) => void;
  onPanelCommand: (panel: string, action: string) => void;
}

export function useVoiceCommands(config: VoiceCommandsConfig) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);

  // Voice commands configuration
  const commands: VoiceCommand[] = [
    // Layout commands
    { pattern: /maximize\s+(preview|chat|avatar|conversation)/i, action: 'maximize', description: 'Maximize a panel' },
    { pattern: /minimize\s+(preview|chat|avatar|conversation)/i, action: 'minimize', description: 'Minimize a panel' },
    { pattern: /focus\s+(on\s+)?(preview|chat|avatar|conversation)/i, action: 'focus', description: 'Focus on a panel' },
    { pattern: /expand\s+(preview|chat|avatar|conversation)/i, action: 'expand', description: 'Expand a panel' },
    { pattern: /collapse\s+(preview|chat|avatar|conversation)/i, action: 'collapse', description: 'Collapse a panel' },
    
    // Panel commands
    { pattern: /show\s+(sidebar|panel|menu)/i, action: 'show', description: 'Show sidebar/panel' },
    { pattern: /hide\s+(sidebar|panel|menu)/i, action: 'hide', description: 'Hide sidebar/panel' },
    { pattern: /toggle\s+(sidebar|panel|menu)/i, action: 'toggle', description: 'Toggle sidebar/panel' },
    
    // Split screen commands
    { pattern: /split\s+(screen|view)/i, action: 'split', description: 'Split screen view' },
    { pattern: /full\s*screen/i, action: 'fullscreen', description: 'Go fullscreen' },
    { pattern: /exit\s+full\s*screen/i, action: 'exit_fullscreen', description: 'Exit fullscreen' },
    
    // Navigation commands
    { pattern: /go\s+to\s+(home|dashboard|templates|workspace)/i, action: 'navigate', description: 'Navigate to page' },
    { pattern: /open\s+(templates|workspace|settings)/i, action: 'navigate', description: 'Open page' },
    
    // AI commands
    { pattern: /start\s+recording/i, action: 'start_recording', description: 'Start voice recording' },
    { pattern: /stop\s+recording/i, action: 'stop_recording', description: 'Stop voice recording' },
    { pattern: /mute\s+(audio|voice|sound)/i, action: 'mute', description: 'Mute audio' },
    { pattern: /unmute\s+(audio|voice|sound)/i, action: 'unmute', description: 'Unmute audio' },
    
    // Reset commands
    { pattern: /reset\s+(layout|view)/i, action: 'reset', description: 'Reset layout to default' },
    { pattern: /default\s+(layout|view)/i, action: 'reset', description: 'Reset to default layout' },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        const transcript = lastResult[0].transcript.trim().toLowerCase();
        const confidenceScore = lastResult[0].confidence;
        
        setLastCommand(transcript);
        setConfidence(confidenceScore);
        
        // Process the command
        processVoiceCommand(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Restart listening after a brief pause
          setTimeout(() => {
            if (isListening) {
              recognition.start();
            }
          }, 1000);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          // Restart listening to maintain continuous listening
          setTimeout(() => {
            recognition.start();
          }, 100);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const processVoiceCommand = useCallback((transcript: string) => {
    for (const command of commands) {
      const match = transcript.match(command.pattern);
      if (match) {
        const panel = match[2] || match[3]; // Extract panel name from regex groups
        
        switch (command.action) {
          case 'maximize':
          case 'minimize':
          case 'focus':
          case 'expand':
          case 'collapse':
            config.onPanelCommand(panel || 'main', command.action);
            break;
            
          case 'show':
          case 'hide':
          case 'toggle':
            config.onPanelCommand('sidebar', command.action);
            break;
            
          case 'split':
          case 'fullscreen':
          case 'exit_fullscreen':
          case 'reset':
            config.onLayoutCommand(command.action);
            break;
            
          case 'navigate':
            const destination = match[1];
            config.onNavigationCommand(destination);
            break;
            
          case 'start_recording':
          case 'stop_recording':
          case 'mute':
          case 'unmute':
            config.onPanelCommand('avatar', command.action);
            break;
        }
        
        // Command executed successfully
        console.log(`Voice command executed: ${command.action}`, { panel, confidence });
        break;
      }
    }
  }, [config]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isSupported,
    lastCommand,
    confidence,
    startListening,
    stopListening,
    toggleListening,
    availableCommands: commands.map(cmd => cmd.description)
  };
}

// Global type declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}