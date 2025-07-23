import { Button } from '@/components/ui/button';
import { VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmergencyStopButtonProps {
  onClick: () => void;
  className?: string;
}

export default function EmergencyStopButton({ onClick, className = '' }: EmergencyStopButtonProps) {
  const handleEmergencyStop = () => {
    console.log('EMERGENCY STOP ACTIVATED');
    
    // Multiple stop methods
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
    }
    
    // Stop all audio elements
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
      audio.src = '';
    });
    
    // Stop all video elements
    document.querySelectorAll('video').forEach(video => {
      video.pause();
      video.currentTime = 0;
      video.volume = 0;
    });
    
    // Call parent handler
    onClick();
    
    // Nuclear option - override speechSynthesis
    (window as any).speechSynthesis = {
      ...window.speechSynthesis,
      speak: () => console.log('Speech blocked by emergency stop'),
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      getVoices: () => [],
      pending: false,
      speaking: false,
      paused: false,
    };
    
    // Show confirmation
    const notification = document.createElement('div');
    notification.innerHTML = '🚨 ALL AUDIO STOPPED 🚨';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 99999;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  return (
    <motion.div
      className={`fixed top-4 right-4 z-[99999] ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={handleEmergencyStop}
        size="lg"
        variant="destructive"
        className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 text-lg border-2 border-red-500 shadow-lg hover:shadow-xl transition-all"
      >
        <VolumeX className="w-6 h-6 mr-2" />
        EMERGENCY STOP
      </Button>
    </motion.div>
  );
}