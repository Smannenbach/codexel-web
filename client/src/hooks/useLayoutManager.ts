import { useState, useCallback } from 'react';

export type PanelSize = 'minimized' | 'normal' | 'expanded' | 'maximized';
export type LayoutMode = 'default' | 'split' | 'focus' | 'fullscreen';

interface PanelState {
  size: PanelSize;
  visible: boolean;
  focused: boolean;
}

interface LayoutState {
  mode: LayoutMode;
  panels: {
    avatar: PanelState;
    chat: PanelState;
    preview: PanelState;
    sidebar: PanelState;
  };
  activePanel: string | null;
}

const defaultLayoutState: LayoutState = {
  mode: 'default',
  panels: {
    avatar: { size: 'normal', visible: true, focused: false },
    chat: { size: 'normal', visible: true, focused: false },
    preview: { size: 'normal', visible: true, focused: false },
    sidebar: { size: 'normal', visible: true, focused: false }
  },
  activePanel: null
};

export function useLayoutManager() {
  const [layout, setLayout] = useState<LayoutState>(defaultLayoutState);

  const updatePanel = useCallback((panelName: keyof LayoutState['panels'], updates: Partial<PanelState>) => {
    setLayout(prev => ({
      ...prev,
      panels: {
        ...prev.panels,
        [panelName]: { ...prev.panels[panelName], ...updates }
      }
    }));
  }, []);

  const setLayoutMode = useCallback((mode: LayoutMode) => {
    setLayout(prev => ({ ...prev, mode }));
  }, []);

  const setActivePanel = useCallback((panelName: string | null) => {
    setLayout(prev => ({
      ...prev,
      activePanel: panelName,
      panels: Object.fromEntries(
        Object.entries(prev.panels).map(([name, panel]) => [
          name,
          { ...panel, focused: name === panelName }
        ])
      ) as LayoutState['panels']
    }));
  }, []);

  // Voice command handlers
  const handleLayoutCommand = useCallback((command: string, params?: any) => {
    switch (command) {
      case 'split':
        setLayoutMode('split');
        break;
      case 'fullscreen':
        setLayoutMode('fullscreen');
        break;
      case 'exit_fullscreen':
        setLayoutMode('default');
        break;
      case 'reset':
        setLayout(defaultLayoutState);
        break;
    }
  }, []);

  const handlePanelCommand = useCallback((panelName: string, action: string) => {
    // Map voice command panel names to actual panel names
    const panelMap: Record<string, keyof LayoutState['panels']> = {
      'preview': 'preview',
      'chat': 'chat',
      'conversation': 'chat',
      'avatar': 'avatar',
      'sidebar': 'sidebar',
      'panel': 'sidebar',
      'menu': 'sidebar'
    };

    const actualPanelName = panelMap[panelName.toLowerCase()];
    if (!actualPanelName) return;

    switch (action) {
      case 'maximize':
        updatePanel(actualPanelName, { size: 'maximized' });
        setActivePanel(actualPanelName);
        break;
        
      case 'minimize':
        updatePanel(actualPanelName, { size: 'minimized' });
        break;
        
      case 'expand':
        updatePanel(actualPanelName, { size: 'expanded' });
        break;
        
      case 'collapse':
        updatePanel(actualPanelName, { size: 'normal' });
        break;
        
      case 'focus':
        setActivePanel(actualPanelName);
        updatePanel(actualPanelName, { focused: true });
        break;
        
      case 'show':
        updatePanel(actualPanelName, { visible: true });
        break;
        
      case 'hide':
        updatePanel(actualPanelName, { visible: false });
        break;
        
      case 'toggle':
        setLayout(prev => {
          const currentPanel = prev.panels[actualPanelName];
          return {
            ...prev,
            panels: {
              ...prev.panels,
              [actualPanelName]: {
                ...currentPanel,
                visible: !currentPanel.visible
              }
            }
          };
        });
        break;
    }
  }, [updatePanel, setActivePanel]);

  // CSS classes for layout
  const getLayoutClasses = useCallback(() => {
    const { mode, activePanel } = layout;
    
    let containerClass = 'transition-all duration-300 ease-in-out ';
    let gridClass = '';

    switch (mode) {
      case 'split':
        containerClass += 'grid-cols-2 ';
        gridClass = 'grid grid-cols-1 lg:grid-cols-2 gap-6';
        break;
      case 'fullscreen':
        containerClass += 'fixed inset-0 z-50 bg-background ';
        gridClass = 'h-full w-full';
        break;
      case 'focus':
        gridClass = 'grid grid-cols-1 gap-6';
        break;
      default:
        gridClass = 'grid grid-cols-1 lg:grid-cols-3 gap-6';
    }

    return { containerClass, gridClass };
  }, [layout]);

  // Panel sizing classes
  const getPanelClasses = useCallback((panelName: keyof LayoutState['panels']) => {
    const panel = layout.panels[panelName];
    const isActive = layout.activePanel === panelName;
    
    let classes = 'transition-all duration-300 ease-in-out ';
    
    if (!panel.visible) {
      classes += 'hidden ';
      return classes;
    }

    // Base visibility
    classes += 'block ';

    // Focus effects
    if (panel.focused || isActive) {
      classes += 'ring-2 ring-primary/50 shadow-lg ';
    }

    // Size-based classes
    switch (panel.size) {
      case 'minimized':
        classes += 'h-16 overflow-hidden ';
        break;
      case 'expanded':
        if (layout.mode === 'split') {
          classes += 'col-span-1 row-span-2 ';
        } else {
          classes += 'lg:col-span-2 h-[700px] ';
        }
        break;
      case 'maximized':
        if (layout.mode !== 'fullscreen') {
          classes += 'fixed inset-4 z-40 max-w-6xl max-h-[90vh] mx-auto ';
        }
        break;
      case 'normal':
      default:
        classes += 'h-[600px] ';
    }

    return classes;
  }, [layout]);

  return {
    layout,
    handleLayoutCommand,
    handlePanelCommand,
    updatePanel,
    setLayoutMode,
    setActivePanel,
    getLayoutClasses,
    getPanelClasses,
    resetLayout: () => setLayout(defaultLayoutState)
  };
}