import { useState, useEffect } from 'react';

export type LayoutMode = 'development' | 'preview' | 'balanced' | 'focus' | 'conversation';

export interface WorkspaceState {
  sidebarWidth: number;
  leftPanelWidth: number;
  rightPanelWidth: number;
  layout: LayoutMode;
  sidebarCollapsed: boolean;
}

export function useWorkspace() {
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50);
  const [rightPanelWidth, setRightPanelWidth] = useState(50);
  const [layout, setLayout] = useState<LayoutMode>('balanced');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('workspace-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setSidebarWidth(parsed.sidebarWidth || 280);
        setLeftPanelWidth(parsed.leftPanelWidth || 50);
        setRightPanelWidth(parsed.rightPanelWidth || 50);
        setLayout(parsed.layout || 'balanced');
        setSidebarCollapsed(parsed.sidebarCollapsed || false);
      } catch (error) {
        console.error('Failed to parse workspace state:', error);
      }
    }
  }, []);

  const saveState = (state: Partial<WorkspaceState>) => {
    const currentState = {
      sidebarWidth,
      leftPanelWidth,
      rightPanelWidth,
      layout,
      sidebarCollapsed,
      ...state,
    };
    localStorage.setItem('workspace-state', JSON.stringify(currentState));
  };

  const updateSidebarWidth = (width: number) => {
    setSidebarWidth(width);
    saveState({ sidebarWidth: width });
  };

  const updateLeftPanelWidth = (width: number) => {
    setLeftPanelWidth(width);
    setRightPanelWidth(100 - width);
    saveState({ leftPanelWidth: width, rightPanelWidth: 100 - width });
  };

  const updateLayout = (newLayout: LayoutMode) => {
    setLayout(newLayout);
    saveState({ layout: newLayout });
  };

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    saveState({ sidebarCollapsed: newCollapsed });
  };

  return {
    sidebarWidth,
    leftPanelWidth,
    rightPanelWidth,
    layout: {
      preset: layout,
      sidebarWidth: sidebarCollapsed ? 0 : 25,
      conversationWidth: leftPanelWidth,
      previewWidth: rightPanelWidth
    },
    sidebarCollapsed,
    updateSidebarWidth,
    updateLeftPanelWidth,
    updateLayout,
    toggleSidebar,
    applyPreset: updateLayout,
    resizeSidebar: updateSidebarWidth,
  };
}