import { Router } from 'express';
import { storage } from '../storage';
import { usageTracker } from '../services/usageTracker';
import { isAuthenticated } from '../auth';
import { z } from 'zod';

const router = Router();

// Get current user profile with usage information
router.get('/user/profile', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent usage stats
    const recentStats = await storage.getUserUsageStats(userId, 'daily');
    const currentUsage = user.usageQuota || {
      aiCalls: 0,
      storageGB: 0,
      workspaceHours: 0,
      projectCount: 0,
      resetDate: new Date().toISOString()
    };

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      subscriptionStatus: user.subscriptionStatus,
      usage: {
        current: currentUsage,
        limits: getUsageLimits(user.subscriptionStatus || 'free'),
        recentStats: recentStats.slice(0, 7) // Last 7 days
      }
    });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed usage analytics
router.get('/user/usage', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { period = 'daily', limit = 30 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await storage.getUserUsageStats(userId, period as string);
    
    res.json({
      period,
      stats: stats.slice(0, parseInt(limit as string)),
      summary: {
        totalAiCalls: stats.reduce((sum, s) => sum + (s.metrics?.aiCalls || 0), 0),
        totalTokens: stats.reduce((sum, s) => sum + (s.metrics?.tokensUsed || 0), 0),
        totalWorkspaceTime: stats.reduce((sum, s) => sum + (s.metrics?.workspaceMinutes || 0), 0),
        totalProjects: stats.reduce((sum, s) => sum + (s.metrics?.projectsCreated || 0), 0)
      }
    });
  } catch (error) {
    console.error('Failed to get usage analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track AI usage (called by AI services)
router.post('/usage/ai', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const schema = z.object({
      model: z.string(),
      feature: z.string(),
      inputTokens: z.number(),
      outputTokens: z.number(),
      cost: z.number(),
      projectId: z.number().optional(),
      sessionId: z.string().optional(),
      metadata: z.any().optional()
    });

    const data = schema.parse(req.body);

    await usageTracker.trackAiUsage(userId, data);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to track AI usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track workspace session time
router.post('/usage/workspace-time', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const schema = z.object({
      sessionId: z.string(),
      minutes: z.number()
    });

    const { sessionId, minutes } = schema.parse(req.body);

    await usageTracker.trackWorkspaceTime(userId, sessionId, minutes);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to track workspace time:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user can perform action based on quota
router.get('/usage/check/:action', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    const { action } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usage = user.usageQuota || {
      aiCalls: 0,
      storageGB: 0,
      workspaceHours: 0,
      projectCount: 0,
      resetDate: new Date().toISOString()
    };

    const limits = getUsageLimits(user.subscriptionStatus || 'free');
    
    let canPerform = true;
    let reason = '';

    switch (action) {
      case 'ai-call':
        canPerform = usage.aiCalls < limits.aiCalls;
        reason = canPerform ? '' : 'AI call limit exceeded';
        break;
      case 'create-project':
        canPerform = usage.projectCount < limits.projectCount;
        reason = canPerform ? '' : 'Project limit exceeded';
        break;
      case 'upload-file':
        const fileSizeMB = parseFloat(req.query.sizeMB as string || '0');
        canPerform = (usage.storageGB + fileSizeMB / 1024) < limits.storageGB;
        reason = canPerform ? '' : 'Storage limit exceeded';
        break;
      default:
        canPerform = true;
    }

    res.json({
      canPerform,
      reason,
      currentUsage: usage,
      limits
    });
  } catch (error) {
    console.error('Failed to check usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get usage limits based on subscription
function getUsageLimits(subscriptionStatus: string) {
  switch (subscriptionStatus) {
    case 'free':
      return {
        aiCalls: 1000,
        storageGB: 1,
        workspaceHours: 50,
        projectCount: 5
      };
    case 'pro':
      return {
        aiCalls: 10000,
        storageGB: 10,
        workspaceHours: 200,
        projectCount: 25
      };
    case 'enterprise':
      return {
        aiCalls: 100000,
        storageGB: 100,
        workspaceHours: 1000,
        projectCount: 100
      };
    default:
      return {
        aiCalls: 1000,
        storageGB: 1,
        workspaceHours: 50,
        projectCount: 5
      };
  }
}

export default router;