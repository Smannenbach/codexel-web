import { useEffect, useRef } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface UseAnalyticsTrackingProps {
  userId: number;
  projectId: number;
}

export function useAnalyticsTracking({ userId, projectId }: UseAnalyticsTrackingProps) {
  const panelFocusRef = useRef<{ panel: string; startTime: number } | null>(null);
  
  const trackPanelFocus = async (panelName: string) => {
    // End previous panel focus if exists
    if (panelFocusRef.current) {
      const duration = Date.now() - panelFocusRef.current.startTime;
      await apiRequest('POST', '/api/analytics/track', {
        userId,
        projectId,
        event: 'panel_focus',
        data: {
          panelName: panelFocusRef.current.panel,
          duration: Math.floor(duration / 1000) // Convert to seconds
        }
      });
    }
    
    // Start new panel focus
    panelFocusRef.current = {
      panel: panelName,
      startTime: Date.now()
    };
  };
  
  // Track panel focus on unmount
  useEffect(() => {
    return () => {
      if (panelFocusRef.current) {
        const duration = Date.now() - panelFocusRef.current.startTime;
        navigator.sendBeacon('/api/analytics/track', JSON.stringify({
          userId,
          projectId,
          event: 'panel_focus',
          data: {
            panelName: panelFocusRef.current.panel,
            duration: Math.floor(duration / 1000)
          }
        }));
      }
    };
  }, [userId, projectId]);
  
  return { trackPanelFocus };
}