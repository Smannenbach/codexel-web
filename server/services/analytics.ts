import { db } from '../db';
import { workspaceAnalytics, layoutRecommendations, projects } from '@shared/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
import type { WorkspaceAnalytic, InsertWorkspaceAnalytic, LayoutRecommendation, InsertLayoutRecommendation } from '@shared/schema';

export class WorkspaceAnalyticsService {
  private sessionId: string;
  private userId: number;
  private projectId: number;
  private startTime: number;
  private currentAnalytics: Partial<InsertWorkspaceAnalytic>;
  private updateInterval: NodeJS.Timer | null = null;

  constructor(userId: number, projectId: number) {
    this.userId = userId;
    this.projectId = projectId;
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    this.currentAnalytics = {
      userId,
      projectId,
      sessionId: this.sessionId,
      layoutConfiguration: {},
      panelSizes: [],
      totalActiveTime: 0,
      messagesSent: 0,
      aiInteractions: 0,
      panelResizeCount: 0,
      focusTime: {},
      preferredModelUsage: {},
    };

    // Start periodic updates
    this.startPeriodicUpdate();
  }

  private startPeriodicUpdate() {
    // Update analytics every 30 seconds
    this.updateInterval = setInterval(() => {
      this.saveAnalytics();
    }, 30000);
  }

  async trackLayoutChange(configuration: any, panelSizes: number[]) {
    this.currentAnalytics.layoutConfiguration = configuration;
    this.currentAnalytics.panelSizes = panelSizes;
    this.currentAnalytics.panelResizeCount = (this.currentAnalytics.panelResizeCount || 0) + 1;
  }

  async trackMessage(model: string) {
    this.currentAnalytics.messagesSent = (this.currentAnalytics.messagesSent || 0) + 1;
    this.currentAnalytics.aiInteractions = (this.currentAnalytics.aiInteractions || 0) + 1;
    
    const modelUsage = this.currentAnalytics.preferredModelUsage || {};
    modelUsage[model] = (modelUsage[model] || 0) + 1;
    this.currentAnalytics.preferredModelUsage = modelUsage;
  }

  async trackPanelFocus(panelName: string, duration: number) {
    const focusTime = this.currentAnalytics.focusTime || {};
    focusTime[panelName] = (focusTime[panelName] || 0) + duration;
    this.currentAnalytics.focusTime = focusTime;
    
    // Update most used panel
    const maxTime = Math.max(...Object.values(focusTime));
    const mostUsed = Object.entries(focusTime).find(([_, time]) => time === maxTime)?.[0];
    this.currentAnalytics.mostUsedPanel = mostUsed;
  }

  async saveAnalytics() {
    const totalActiveTime = Math.floor((Date.now() - this.startTime) / 1000);
    this.currentAnalytics.totalActiveTime = totalActiveTime;
    this.currentAnalytics.peakProductivityHour = new Date().getHours();
    
    try {
      // Check if analytics for this session already exists
      const existing = await db.select()
        .from(workspaceAnalytics)
        .where(eq(workspaceAnalytics.sessionId, this.sessionId))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing
        await db.update(workspaceAnalytics)
          .set({
            ...this.currentAnalytics,
            updatedAt: new Date(),
          })
          .where(eq(workspaceAnalytics.sessionId, this.sessionId));
      } else {
        // Create new
        await db.insert(workspaceAnalytics)
          .values(this.currentAnalytics as InsertWorkspaceAnalytic);
      }
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  async generateRecommendations(): Promise<LayoutRecommendation[]> {
    try {
      // Get user's recent analytics (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentAnalytics = await db.select()
        .from(workspaceAnalytics)
        .where(and(
          eq(workspaceAnalytics.userId, this.userId),
          gte(workspaceAnalytics.createdAt, sevenDaysAgo)
        ))
        .orderBy(desc(workspaceAnalytics.createdAt));
      
      const recommendations: InsertLayoutRecommendation[] = [];
      
      // Analyze patterns
      if (recentAnalytics.length >= 5) {
        // Calculate average panel sizes
        const avgPanelSizes = this.calculateAveragePanelSizes(recentAnalytics);
        
        // Analyze productivity patterns
        const productivityMetrics = this.analyzeProductivityMetrics(recentAnalytics);
        
        // Generate recommendations based on patterns
        if (productivityMetrics.chatHeavy) {
          recommendations.push({
            userId: this.userId,
            projectType: 'chat-heavy',
            recommendedLayout: { type: 'chat-focused' },
            recommendedPanelSizes: [15, 55, 30],
            reason: 'Your usage patterns show heavy chat interaction. A larger chat panel can improve your workflow efficiency.',
            confidenceScore: 0.85,
            productivityImprovement: 15,
          });
        }
        
        if (productivityMetrics.previewFocused) {
          recommendations.push({
            userId: this.userId,
            projectType: 'preview-focused',
            recommendedLayout: { type: 'preview-focused' },
            recommendedPanelSizes: [20, 35, 45],
            reason: 'You spend significant time in the preview panel. A larger preview area can enhance your development experience.',
            confidenceScore: 0.8,
            productivityImprovement: 12,
          });
        }
        
        if (productivityMetrics.balancedUsage) {
          recommendations.push({
            userId: this.userId,
            projectType: 'balanced',
            recommendedLayout: { type: 'balanced' },
            recommendedPanelSizes: avgPanelSizes,
            reason: 'Your current balanced layout is optimal for your workflow. Consider saving it as a custom layout.',
            confidenceScore: 0.9,
            productivityImprovement: 5,
          });
        }
      }
      
      // Save recommendations
      const savedRecommendations: LayoutRecommendation[] = [];
      for (const rec of recommendations) {
        const [saved] = await db.insert(layoutRecommendations)
          .values(rec)
          .returning();
        savedRecommendations.push(saved);
      }
      
      return savedRecommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [];
    }
  }

  private calculateAveragePanelSizes(analytics: WorkspaceAnalytic[]): number[] {
    const panelSizesArray = analytics
      .map(a => a.panelSizes as number[])
      .filter(sizes => Array.isArray(sizes) && sizes.length === 3);
    
    if (panelSizesArray.length === 0) return [20, 45, 35];
    
    const avgSizes = [0, 0, 0];
    panelSizesArray.forEach(sizes => {
      sizes.forEach((size, i) => {
        avgSizes[i] += size;
      });
    });
    
    return avgSizes.map(sum => Math.round(sum / panelSizesArray.length));
  }

  private analyzeProductivityMetrics(analytics: WorkspaceAnalytic[]) {
    const totalFocusTime = analytics.reduce((acc, a) => {
      const focusTime = a.focusTime as Record<string, number>;
      Object.entries(focusTime).forEach(([panel, time]) => {
        acc[panel] = (acc[panel] || 0) + time;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const totalTime = Object.values(totalFocusTime).reduce((a, b) => a + b, 0);
    const chatPercentage = (totalFocusTime.chat || 0) / totalTime;
    const previewPercentage = (totalFocusTime.preview || 0) / totalTime;
    
    return {
      chatHeavy: chatPercentage > 0.5,
      previewFocused: previewPercentage > 0.4,
      balancedUsage: chatPercentage < 0.4 && previewPercentage < 0.4,
      totalFocusTime,
    };
  }

  async getProductivityStats() {
    const analytics = await db.select()
      .from(workspaceAnalytics)
      .where(and(
        eq(workspaceAnalytics.userId, this.userId),
        eq(workspaceAnalytics.projectId, this.projectId)
      ))
      .orderBy(desc(workspaceAnalytics.createdAt))
      .limit(100);
    
    const totalActiveTime = analytics.reduce((sum, a) => sum + a.totalActiveTime, 0);
    const totalMessages = analytics.reduce((sum, a) => sum + a.messagesSent, 0);
    const totalAiInteractions = analytics.reduce((sum, a) => sum + a.aiInteractions, 0);
    
    const hourlyProductivity = new Array(24).fill(0);
    analytics.forEach(a => {
      if (a.peakProductivityHour !== null) {
        hourlyProductivity[a.peakProductivityHour]++;
      }
    });
    
    const peakHour = hourlyProductivity.indexOf(Math.max(...hourlyProductivity));
    
    return {
      totalActiveTime,
      totalMessages,
      totalAiInteractions,
      averageSessionTime: totalActiveTime / analytics.length,
      messagesPerHour: (totalMessages / totalActiveTime) * 3600,
      peakProductivityHour: peakHour,
      sessionCount: analytics.length,
    };
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.saveAnalytics();
  }
}

export const createAnalyticsTracker = (userId: number, projectId: number) => {
  return new WorkspaceAnalyticsService(userId, projectId);
};