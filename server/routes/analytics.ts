import { Router } from 'express';
import { createAnalyticsTracker } from '../services/analytics';
import { db } from '../db';
import { workspaceAnalytics, layoutRecommendations } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();
const analyticsTrackers = new Map<string, ReturnType<typeof createAnalyticsTracker>>();

// Get or create analytics tracker for a user/project
const getTracker = (userId: number, projectId: number) => {
  const key = `${userId}_${projectId}`;
  if (!analyticsTrackers.has(key)) {
    analyticsTrackers.set(key, createAnalyticsTracker(userId, projectId));
  }
  return analyticsTrackers.get(key)!;
};

// Track workspace events
router.post('/api/analytics/track', async (req, res) => {
  try {
    const trackSchema = z.object({
      userId: z.number(),
      projectId: z.number(),
      event: z.enum(['layout_change', 'message_sent', 'panel_focus']),
      data: z.record(z.any()),
    });

    const { userId, projectId, event, data } = trackSchema.parse(req.body);
    const tracker = getTracker(userId, projectId);

    switch (event) {
      case 'layout_change':
        await tracker.trackLayoutChange(data.configuration, data.panelSizes);
        break;
      case 'message_sent':
        await tracker.trackMessage(data.model);
        break;
      case 'panel_focus':
        await tracker.trackPanelFocus(data.panelName, data.duration);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid tracking data', details: error.errors });
    } else {
      console.error('Analytics tracking error:', error);
      res.status(500).json({ error: 'Failed to track analytics' });
    }
  }
});

// Get productivity stats
router.get('/api/analytics/stats/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const userId = 1; // TODO: Get from authenticated user
    
    const tracker = getTracker(userId, projectId);
    const stats = await tracker.getProductivityStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch productivity stats' });
  }
});

// Get layout recommendations
router.get('/api/analytics/recommendations/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const recommendations = await db.select()
      .from(layoutRecommendations)
      .where(eq(layoutRecommendations.userId, userId))
      .orderBy(desc(layoutRecommendations.createdAt))
      .limit(5);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Generate new recommendations
router.post('/api/analytics/recommendations/generate', async (req, res) => {
  try {
    const { userId, projectId } = req.body;
    const tracker = getTracker(userId, projectId);
    
    const recommendations = await tracker.generateRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Accept a recommendation
router.post('/api/analytics/recommendations/:id/accept', async (req, res) => {
  try {
    const recommendationId = parseInt(req.params.id);
    
    await db.update(layoutRecommendations)
      .set({ accepted: true })
      .where(eq(layoutRecommendations.id, recommendationId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Accept recommendation error:', error);
    res.status(500).json({ error: 'Failed to accept recommendation' });
  }
});

// Get analytics summary
router.get('/api/analytics/summary/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    const analytics = await db.select()
      .from(workspaceAnalytics)
      .where(eq(workspaceAnalytics.userId, userId))
      .orderBy(desc(workspaceAnalytics.createdAt))
      .limit(100);
    
    const summary = {
      totalSessions: analytics.length,
      totalActiveTime: analytics.reduce((sum, a) => sum + a.totalActiveTime, 0),
      totalMessages: analytics.reduce((sum, a) => sum + a.messagesSent, 0),
      mostUsedPanels: {} as Record<string, number>,
      preferredModels: {} as Record<string, number>,
    };
    
    // Aggregate panel usage
    analytics.forEach(a => {
      if (a.mostUsedPanel) {
        summary.mostUsedPanels[a.mostUsedPanel] = 
          (summary.mostUsedPanels[a.mostUsedPanel] || 0) + 1;
      }
      
      // Aggregate model usage
      const modelUsage = a.preferredModelUsage as Record<string, number>;
      Object.entries(modelUsage).forEach(([model, count]) => {
        summary.preferredModels[model] = 
          (summary.preferredModels[model] || 0) + count;
      });
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

export default router;