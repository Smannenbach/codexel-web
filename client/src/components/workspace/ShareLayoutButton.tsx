import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Save } from 'lucide-react';
import LayoutShareDialog from './LayoutShareDialog';
import { useToast } from '@/hooks/use-toast';

interface ShareLayoutButtonProps {
  className?: string;
}

export default function ShareLayoutButton({ className }: ShareLayoutButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const getCurrentLayout = () => {
    // Get the current panel sizes from localStorage
    const savedLayout = localStorage.getItem('react-resizable-panels:workspace-layout');
    const advancedConfig = localStorage.getItem('workspace-advanced-config');
    
    return {
      panels: savedLayout ? JSON.parse(savedLayout) : null,
      advanced: advancedConfig ? JSON.parse(advancedConfig) : null,
      timestamp: Date.now(),
    };
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Layout
      </Button>

      <LayoutShareDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        currentLayout={getCurrentLayout()}
      />
    </>
  );
}