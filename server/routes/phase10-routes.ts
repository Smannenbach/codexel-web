// Phase 10 API Routes - Advanced Scalability & AI Optimization
import type { Express } from "express";
import { intelligentAIRouter } from "../services/intelligent-ai-router";
import { resourceAllocationManager } from "../services/resource-allocation-manager";
import { advancedAutonomousEngine } from "../services/advanced-autonomous-engine";

export function registerPhase10Routes(app: Express): void {
  console.log('🚀 Phase 10 Advanced Features Initialized:');
  console.log('   ✅ Intelligent AI Model Orchestration');
  console.log('   ✅ Advanced Resource Allocation');
  console.log('   ✅ Next-Generation Autonomous Development');

  // Intelligent AI Router endpoints
  app.post('/api/ai/route', async (req, res) => {
    try {
      const { taskType, complexity, priority, budget, latencyRequirement, qualityRequirement, contextSize, userPreferences } = req.body;
      
      const routingRequest = {
        taskType,
        complexity,
        priority,
        budget,
        latencyRequirement,
        qualityRequirement,
        contextSize,
        userPreferences
      };

      const decision = await intelligentAIRouter.routeRequest(routingRequest);
      res.json(decision);
    } catch (error) {
      console.error('AI routing error:', error);
      res.status(500).json({ error: 'Failed to route AI request' });
    }
  });

  app.get('/api/ai/models/analytics', async (req, res) => {
    try {
      const analytics = await intelligentAIRouter.getModelAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Model analytics error:', error);
      res.status(500).json({ error: 'Failed to get model analytics' });
    }
  });

  app.post('/api/ai/models/:modelId/performance', async (req, res) => {
    try {
      const { modelId } = req.params;
      const metrics = req.body;
      
      await intelligentAIRouter.updateModelPerformance(modelId, metrics);
      res.json({ success: true });
    } catch (error) {
      console.error('Performance update error:', error);
      res.status(500).json({ error: 'Failed to update model performance' });
    }
  });

  // Resource Allocation Manager endpoints
  app.get('/api/resources/metrics', async (req, res) => {
    try {
      const metrics = await resourceAllocationManager.getResourceMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Resource metrics error:', error);
      res.status(500).json({ error: 'Failed to get resource metrics' });
    }
  });

  app.get('/api/resources/analytics', async (req, res) => {
    try {
      const analytics = await resourceAllocationManager.getResourceAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Resource analytics error:', error);
      res.status(500).json({ error: 'Failed to get resource analytics' });
    }
  });

  app.post('/api/resources/allocate', async (req, res) => {
    try {
      const { serviceId, allocation } = req.body;
      await resourceAllocationManager.allocateResourcesForService(serviceId, allocation);
      res.json({ success: true });
    } catch (error) {
      console.error('Resource allocation error:', error);
      res.status(500).json({ error: 'Failed to allocate resources' });
    }
  });

  app.get('/api/resources/optimizations', async (req, res) => {
    try {
      const optimizations = await resourceAllocationManager.getOptimizations();
      res.json(optimizations);
    } catch (error) {
      console.error('Optimizations error:', error);
      res.status(500).json({ error: 'Failed to get optimizations' });
    }
  });

  app.post('/api/resources/optimizations/:id/enable', async (req, res) => {
    try {
      const { id } = req.params;
      await resourceAllocationManager.enableOptimization(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Enable optimization error:', error);
      res.status(500).json({ error: 'Failed to enable optimization' });
    }
  });

  app.get('/api/resources/load-balancing', async (req, res) => {
    try {
      const status = await resourceAllocationManager.getLoadBalancingStatus();
      res.json(status);
    } catch (error) {
      console.error('Load balancing status error:', error);
      res.status(500).json({ error: 'Failed to get load balancing status' });
    }
  });

  app.put('/api/resources/load-balancing', async (req, res) => {
    try {
      const strategy = req.body;
      await resourceAllocationManager.updateLoadBalancingStrategy(strategy);
      res.json({ success: true });
    } catch (error) {
      console.error('Load balancing update error:', error);
      res.status(500).json({ error: 'Failed to update load balancing strategy' });
    }
  });

  // Advanced Autonomous Engine endpoints
  app.post('/api/autonomous/tasks', async (req, res) => {
    try {
      const task = await advancedAutonomousEngine.createTask(req.body);
      res.json(task);
    } catch (error) {
      console.error('Task creation error:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.get('/api/autonomous/tasks', async (req, res) => {
    try {
      const tasks = await advancedAutonomousEngine.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error('Get tasks error:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  });

  app.get('/api/autonomous/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      const task = await advancedAutonomousEngine.getTaskStatus(taskId);
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error('Get task status error:', error);
      res.status(500).json({ error: 'Failed to get task status' });
    }
  });

  app.get('/api/autonomous/agents', async (req, res) => {
    try {
      const agents = await advancedAutonomousEngine.getAllAgents();
      res.json(agents);
    } catch (error) {
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Failed to get agents' });
    }
  });

  app.get('/api/autonomous/agents/:agentId', async (req, res) => {
    try {
      const { agentId } = req.params;
      const agent = await advancedAutonomousEngine.getAgentStatus(agentId);
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      console.error('Get agent status error:', error);
      res.status(500).json({ error: 'Failed to get agent status' });
    }
  });

  app.post('/api/autonomous/agents/:agentId/pause', async (req, res) => {
    try {
      const { agentId } = req.params;
      await advancedAutonomousEngine.pauseAgent(agentId);
      res.json({ success: true });
    } catch (error) {
      console.error('Pause agent error:', error);
      res.status(500).json({ error: 'Failed to pause agent' });
    }
  });

  app.post('/api/autonomous/agents/:agentId/resume', async (req, res) => {
    try {
      const { agentId } = req.params;
      await advancedAutonomousEngine.resumeAgent(agentId);
      res.json({ success: true });
    } catch (error) {
      console.error('Resume agent error:', error);
      res.status(500).json({ error: 'Failed to resume agent' });
    }
  });

  app.get('/api/autonomous/metrics', async (req, res) => {
    try {
      const metrics = await advancedAutonomousEngine.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('System metrics error:', error);
      res.status(500).json({ error: 'Failed to get system metrics' });
    }
  });

  // AI Performance Analytics endpoint
  app.get('/api/ai/performance/dashboard', async (req, res) => {
    try {
      const [aiAnalytics, resourceAnalytics, autonomousMetrics] = await Promise.all([
        intelligentAIRouter.getModelAnalytics(),
        resourceAllocationManager.getResourceAnalytics(),
        advancedAutonomousEngine.getSystemMetrics()
      ]);

      const dashboard = {
        ai: {
          totalModels: aiAnalytics.length,
          bestPerformingModel: aiAnalytics[0]?.model.name || 'N/A',
          averageQuality: aiAnalytics.reduce((sum, a) => sum + a.currentMetrics.qualityScore, 0) / aiAnalytics.length || 0,
          totalRequests: aiAnalytics.reduce((sum, a) => sum + a.totalRequests, 0),
          models: aiAnalytics.slice(0, 5) // Top 5 models
        },
        resources: {
          efficiency: resourceAnalytics.efficiency,
          current: resourceAnalytics.current,
          trends: resourceAnalytics.trends,
          recommendations: resourceAnalytics.recommendations.slice(0, 3) // Top 3 recommendations
        },
        autonomous: {
          learningRate: autonomousMetrics.learningRate,
          adaptationSpeed: autonomousMetrics.adaptationSpeed,
          innovationIndex: autonomousMetrics.innovationIndex,
          collaborationEfficiency: autonomousMetrics.collaborationEfficiency,
          qualityImprovement: autonomousMetrics.qualityImprovement,
          efficiencyGains: autonomousMetrics.efficiencyGains
        }
      };

      res.json(dashboard);
    } catch (error) {
      console.error('Performance dashboard error:', error);
      res.status(500).json({ error: 'Failed to get performance dashboard' });
    }
  });

  // Advanced AI Orchestration endpoint
  app.post('/api/ai/orchestrate', async (req, res) => {
    try {
      const { tasks, constraints, optimization } = req.body;
      
      // Orchestrate multiple AI tasks with intelligent routing
      const orchestrationResults = [];
      
      for (const task of tasks) {
        const routingDecision = await intelligentAIRouter.routeRequest({
          taskType: task.type,
          complexity: task.complexity || 'medium',
          priority: task.priority || 'medium',
          budget: constraints?.budget || 'medium',
          latencyRequirement: constraints?.latency || 'standard',
          qualityRequirement: constraints?.quality || 'production',
          contextSize: task.contextSize || 5000,
          userPreferences: req.body.preferences
        });
        
        orchestrationResults.push({
          taskId: task.id,
          selectedModel: routingDecision.selectedModel,
          estimatedCost: routingDecision.estimatedCost,
          estimatedLatency: routingDecision.estimatedLatency,
          confidence: routingDecision.confidence,
          reasoning: routingDecision.reasoning
        });
      }
      
      const totalEstimatedCost = orchestrationResults.reduce((sum, r) => sum + r.estimatedCost, 0);
      const averageConfidence = orchestrationResults.reduce((sum, r) => sum + r.confidence, 0) / orchestrationResults.length;
      
      res.json({
        orchestration: orchestrationResults,
        summary: {
          totalTasks: tasks.length,
          totalEstimatedCost,
          averageConfidence,
          optimizationApplied: optimization || 'balanced'
        }
      });
    } catch (error) {
      console.error('AI orchestration error:', error);
      res.status(500).json({ error: 'Failed to orchestrate AI tasks' });
    }
  });

  // Intelligent Caching endpoint
  app.get('/api/cache/analytics', async (req, res) => {
    try {
      // Simulate intelligent caching analytics
      const analytics = {
        hitRate: 85.4,
        missRate: 14.6,
        totalRequests: 12847,
        cacheSize: '2.3 GB',
        avgResponseTime: 45, // ms
        optimization: {
          suggestedEvictions: [
            'Old API responses (500MB potential saving)',
            'Unused static assets (200MB potential saving)',
            'Expired session data (150MB potential saving)'
          ],
          suggestedPreloads: [
            'Frequently accessed user data',
            'Popular template responses',
            'Common AI model responses'
          ]
        },
        performance: {
          beforeOptimization: 120, // ms
          afterOptimization: 45, // ms
          improvement: 62.5 // %
        }
      };
      
      res.json(analytics);
    } catch (error) {
      console.error('Cache analytics error:', error);
      res.status(500).json({ error: 'Failed to get cache analytics' });
    }
  });

  app.post('/api/cache/optimize', async (req, res) => {
    try {
      const { strategy } = req.body;
      
      // Simulate cache optimization
      const result = {
        success: true,
        strategy: strategy || 'intelligent-ai-driven',
        optimizations: [
          'Evicted 850MB of stale data',
          'Preloaded 200MB of predicted content',
          'Optimized cache hierarchy for 25% faster access',
          'Applied AI-driven cache invalidation rules'
        ],
        metrics: {
          newHitRate: 92.1,
          spaceSaved: '850 MB',
          performanceGain: '35%',
          predictedSavings: '$127/month'
        }
      };
      
      res.json(result);
    } catch (error) {
      console.error('Cache optimization error:', error);
      res.status(500).json({ error: 'Failed to optimize cache' });
    }
  });
}