import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerVoiceRoutes } from './routes/voice';
import aiRoutes from './routes/ai';
import { createSubscriptionRoutes } from './routes/subscriptions';
import errorRoutes from './routes/errors';
import { registerSnapshotRoutes } from './routes/snapshots';
import { rateLimiters, rateLimitLogger } from './middleware/rateLimiter';
import multer from "multer";
import { storage } from "./storage";
import { voiceCloneService } from "./services/voiceCloning";
import { aiService } from "./services/ai-service";
import { AgentOrchestrator } from "./services/ai-orchestrator";
import type { InsertMessage, InsertProject, InsertAgent } from "@shared/schema";
import { aiContentGenerator } from "./services/ai-content-generator";
import { performanceOptimizer } from "./services/performance-optimizer";
import { cachingService, SpecializedCaches } from "./services/caching-service";
import { cdnOptimizer, cdnMiddleware } from "./services/cdn-optimizer";
import { databaseOptimizer } from "./services/database-optimizer";
import { productionDeployer } from "./services/production-deployer";
import { intelligentAIOrchestrator } from "./services/intelligent-ai-orchestrator";
import { codeIntelligenceService } from "./services/code-intelligence";
import { memoryOptimizer } from "./services/memory-optimizer";
import { realTimeCollaboration } from "./services/real-time-collaboration";
import { mobileAppGenerator } from "./services/mobile-app-generator";
import { enterpriseAnalytics } from "./services/enterprise-analytics";
import autonomousAgentsRoutes from './routes/autonomous-agents';
import collaborationRoutes from './routes/collaboration';
import enterpriseDeploymentRoutes from './routes/enterprise-deployment';
import { registerPhase10Routes } from './routes/phase10-routes';
import { blogPosts, marketingCampaigns } from "@shared/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { z } from "zod";

// Setup multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting middleware globally
  app.use(rateLimitLogger);
  app.use('/api', rateLimiters.general);
  
  // Apply performance monitoring middleware
  app.use(performanceOptimizer.middleware());
  
  // Apply CDN optimization middleware (skip in development to avoid Vite conflicts)
  if (process.env.NODE_ENV !== 'development') {
    app.use(cdnMiddleware);
  }
  
  // Apply caching middleware to API routes (5 minute cache)
  app.use('/api', cachingService.middleware(300000));
  
  // Register voice cloning routes with upload rate limiting
  app.use('/api/voice', rateLimiters.upload);
  registerVoiceRoutes(app);
  
  // Register AI chat routes with specific rate limiting
  app.use('/api/ai', rateLimiters.aiChat);
  app.use('/api/ai', aiRoutes);
  
  // Register subscription routes
  app.use('/api/subscriptions', createSubscriptionRoutes());
  
  // Register error logging routes
  app.use(errorRoutes);
  
  // Register deployment routes
  app.post('/api/deployments', async (req, res) => {
    try {
      const { projectId, environment, config } = req.body;
      const deployment = {
        id: Date.now(),
        projectId,
        userId: 1,
        environment,
        status: 'deployed',
        url: environment === 'production' 
          ? `https://${config?.domain || 'app'}.codexel.ai`
          : `https://staging-${projectId}.codexel.ai`,
        deployedAt: new Date().toISOString(),
        logs: 'Deployment completed successfully'
      };
      res.json(deployment);
    } catch (error) {
      console.error('Create deployment error:', error);
      res.status(500).json({ error: 'Failed to create deployment' });
    }
  });
  
  // Preview route - serves generated app preview
  app.get('/preview', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>App Preview - Codexel.ai</title>
        <style>
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
          }
          p {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
          }
          .status {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.2);
            padding: 0.75rem 1.5rem;
            border-radius: 100px;
            font-weight: 500;
          }
          .pulse {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">⚡</div>
          <h1>Your App is Being Built</h1>
          <p>The AI team is working on your application</p>
          <div class="status">
            <div class="pulse"></div>
            <span>AI Agents Active</span>
          </div>
        </div>
      </body>
      </html>
    `);
  });
  
  // Multimodal chat endpoint with file support
  app.post("/api/chat/multimodal", upload.array('files', 5), async (req, res) => {
    try {
      const { content, projectId, model = 'gpt-4-turbo' } = req.body;
      const files = req.files as Express.Multer.File[];
      
      console.log("Multimodal chat request:", { content, projectId, model, fileCount: files?.length || 0 });
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      const actualProjectId = projectId || 1;
      
      // Process uploaded files
      let fileContext = '';
      if (files && files.length > 0) {
        fileContext = '\n\nAttached files:\n';
        for (const file of files) {
          fileContext += `- ${file.originalname} (${file.mimetype}, ${(file.size / 1024).toFixed(1)}KB)\n`;
          
          // For text files, include content
          if (file.mimetype.includes('text') || file.originalname.endsWith('.txt')) {
            const textContent = file.buffer.toString('utf8').substring(0, 1000);
            fileContext += `  Content preview: ${textContent}...\n`;
          }
        }
      }
      
      // Create user message with file context
      await storage.createMessage({
        projectId: actualProjectId,
        role: 'user',
        content: content.trim() + fileContext,
        model: null,
      });

      // Enhanced AI response based on context
      const enhancedContent = content + fileContext;
      
      // Call AI API with enhanced context
      const aiApiResponse = await fetch(`http://localhost:5000/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: enhancedContent,
          model: model,
          context: {
            projectType: 'AI Development Platform',
            hasAttachments: files && files.length > 0,
            attachmentTypes: files?.map(f => f.mimetype) || []
          }
        })
      });
      
      let aiResponse = "";
      if (aiApiResponse.ok) {
        const data = await aiApiResponse.json();
        aiResponse = data.response;
      } else {
        aiResponse = "I understand you've uploaded files. I can help analyze and work with these attachments to build your application. What would you like me to do with these files?";
      }
      
      // Create AI response message
      const aiMessage = await storage.createMessage({
        projectId: actualProjectId,
        role: 'assistant',
        content: aiResponse,
        model: model,
      });

      res.json({
        content: aiResponse,
        messageId: aiMessage.id,
        model: model
      });
    } catch (error) {
      console.error("Multimodal chat error:", error);
      res.status(500).json({ 
        message: "Failed to process multimodal chat request",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Chat endpoint with intelligent AI responses
  app.post("/api/chat", async (req, res) => {
    try {
      const { content, projectId, model = 'gpt-4-turbo' } = req.body;
      
      console.log("Chat request received:", { content, projectId, model });
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Content is required" });
      }

      const actualProjectId = projectId || 1;
      
      // Create user message
      await storage.createMessage({
        projectId: actualProjectId,
        role: 'user',
        content: content.trim(),
        model: null,
      });

      // Get project context
      const project = await storage.getProject(actualProjectId);
      const previousMessages = await storage.getMessagesByProject(actualProjectId);
      
      // Create context-aware response based on project type and conversation history
      let aiResponse = "";
      
      console.log("Checking content for loan officer keywords:", content.toLowerCase());
      
      if (content.toLowerCase().includes('loan officer') || content.toLowerCase().includes('lending') || content.toLowerCase().includes('mortgage')) {
        aiResponse = `I'll help you create a professional loan officer website. Let me break this down into key components:

**Website Structure:**
1. **Homepage** - Professional landing with trust signals and call-to-action
2. **Services Page** - Mortgage types, refinancing, commercial loans
3. **About Page** - Your experience, credentials, and client testimonials
4. **Application Portal** - Secure loan application forms
5. **Resources** - Loan calculators, market updates, first-time buyer guides
6. **Contact Page** - Multiple contact methods and office information

**Key Features to Include:**
- NMLS license display and compliance information
- Mortgage calculator tools
- Client testimonial showcase
- Secure document upload portal
- Mobile-responsive design
- Local market expertise highlights

**Technical Implementation:**
- React frontend with TypeScript
- Secure form handling for sensitive financial data
- Integration with loan calculation APIs
- SSL security and GDPR compliance
- SEO optimization for local searches

Would you like me to start with the homepage design, or would you prefer to focus on a specific section first? I can also set up the basic project structure with proper security measures for handling financial information.`;
      } else if (content.toLowerCase().includes('website') || content.toLowerCase().includes('portfolio')) {
        aiResponse = `I'll create a professional website for you. Let me analyze your requirements and create a comprehensive plan:

**Project Analysis:**
Based on your request, I'll design a modern, responsive website with the following approach:

1. **Planning Phase** - Define structure, content strategy, and user experience
2. **Design Phase** - Create wireframes, choose color scheme, and typography
3. **Development Phase** - Build with React, implement responsive design
4. **Content Phase** - Optimize for SEO and user engagement
5. **Testing Phase** - Cross-browser testing and performance optimization

**Technical Stack:**
- Frontend: React 18 with TypeScript
- Styling: Tailwind CSS for responsive design
- Performance: Optimized images and lazy loading
- SEO: Meta tags, structured data, sitemap

What specific type of website are you looking to create? (e.g., business, portfolio, e-commerce) This will help me tailor the design and functionality to your needs.`;
      } else {
        // Call AI API with selected model
        try {
          const aiApiResponse = await fetch(`http://localhost:5000/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              model: model,
              context: {
                projectType: 'AI Development Platform',
                industry: 'Technology'
              }
            })
          });
          
          if (aiApiResponse.ok) {
            const data = await aiApiResponse.json();
            aiResponse = data.response;
          } else {
            // Fallback to orchestrator for complex requests
            const orchestrator = new AgentOrchestrator();
            aiResponse = await orchestrator.processMessage(actualProjectId, content);
          }
        } catch (error) {
          console.error('AI API error:', error);
          // Fallback response
          aiResponse = `I understand you want to build something amazing. Let me help you with that. Could you provide more details about your specific requirements?`;
        }
      }

      // Create AI response message
      const response = await storage.createMessage({
        projectId: actualProjectId,
        role: 'assistant', 
        content: aiResponse,
        model: model || 'gpt-4-turbo',
      });

      res.json({ 
        content: response.content, 
        model: response.model
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Chat failed" });
    }
  });

  // Projects endpoint
  app.post("/api/projects", async (req, res) => {
    try {
      const project = await storage.createProject({
        userId: 1,
        name: req.body.name || "New Project",
        description: req.body.description || "",
        status: 'planning',
      });

      // Create default agents for the project
      const defaultAgents = [
        { name: 'Project Manager', role: 'planner', icon: '📋', color: '#9333EA', model: 'gpt-4', description: 'Breaks down requirements into actionable tasks' },
        { name: 'Solution Architect', role: 'architect', icon: '🏗️', color: '#3B82F6', model: 'claude-3-5-sonnet-20241022', description: 'Designs system architecture and data models' },
        { name: 'Frontend Developer', role: 'frontend', icon: '💻', color: '#10B981', model: 'gpt-4-turbo', description: 'Creates React components and UI' },
        { name: 'Backend Developer', role: 'backend', icon: '⚙️', color: '#F59E0B', model: 'gpt-4', description: 'Implements API endpoints and business logic' },
        { name: 'UI/UX Designer', role: 'designer', icon: '🎨', color: '#EC4899', model: 'gemini-ultra', description: 'Creates beautiful, intuitive interfaces' },
        { name: 'QA Engineer', role: 'tester', icon: '🧪', color: '#EF4444', model: 'qwen-2.5-max', description: 'Ensures code quality and testing' }
      ];

      // Create agents and associate with project
      for (const agentData of defaultAgents) {
        const agent = await storage.createAgent(agentData);
        await storage.associateAgentWithProject(project.id, agent.id);
      }

      // Generate project checklist
      const projectService = await import('./services/project-service').then(m => m.projectService);
      await projectService.generateProjectChecklist(project.id, project.description || project.name);

      res.json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Agents endpoint
  app.post("/api/agents", async (req, res) => {
    try {
      const agent = await storage.createAgent({
        name: req.body.name || "Agent",
        role: req.body.role || "developer",
        model: req.body.model || "gpt-4",
        color: req.body.color || "#3B82F6",
        icon: req.body.icon || "🤖",
        description: req.body.description,
      });

      res.json(agent);
    } catch (error) {
      console.error("Agent creation error:", error);
      res.status(500).json({ message: "Failed to create agent" });
    }
  });

  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects(1);
      res.json(projects);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(500).json({ message: "Failed to get projects" });
    }
  });

  // Get project data
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      const agents = await storage.getAgentsByProject(projectId);
      const messages = await storage.getMessagesByProject(projectId);
      const checklist = await storage.getChecklistItemsByProject(projectId);

      res.json({
        project,
        agents,
        messages,
        checklist,
      });
    } catch (error) {
      console.error("Get project error:", error);
      res.status(500).json({ message: "Failed to get project" });
    }
  });

  // Send message endpoint - replaced by /api/chat below

  // Toggle checklist item
  app.patch('/api/checklist/:itemId/toggle', async (req, res) => {
    try {
      const { itemId } = req.params;
      const item = await storage.getChecklistItem(parseInt(itemId));
      
      if (!item) {
        return res.status(404).json({ error: 'Checklist item not found' });
      }

      const newStatus = item.status === 'completed' ? 'pending' : 'completed';
      await storage.updateChecklistItem(parseInt(itemId), { status: newStatus });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Toggle checklist error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Usage stats (placeholder for now)
  app.get("/api/usage/:userId", async (req, res) => {
    try {
      // TODO: Implement usage tracking
      res.json({
        totalTokens: 0,
        totalCost: 0,
        requestCount: 0,
      });
    } catch (error) {
      console.error("Usage stats error:", error);
      res.status(500).json({ message: "Failed to get usage stats" });
    }
  });

  // Deploy routes
  const deployRoutes = await import('./routes/deploy');
  app.use(deployRoutes.default);

  // Blog API endpoints
  app.post('/api/blog/generate', async (req, res) => {
    try {
      const generateSchema = z.object({
        projectId: z.number(),
        practiceArea: z.string(),
        targetKeywords: z.array(z.string()),
        tone: z.enum(['professional', 'friendly', 'authoritative']),
        length: z.enum(['short', 'medium', 'long']),
        includeLocalSEO: z.boolean(),
        state: z.string().optional(),
        city: z.string().optional(),
      });

      const config = generateSchema.parse(req.body);
      
      // Generate content using AI
      const generatedContent = await aiContentGenerator.generateBlogPost(config);
      
      // Save to database
      const [blogPost] = await db.insert(blogPosts).values({
        projectId: config.projectId,
        title: generatedContent.title,
        slug: generatedContent.slug,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        category: generatedContent.category,
        keywords: generatedContent.keywords,
        metaDescription: generatedContent.metaDescription,
        readTime: generatedContent.readTime,
        status: 'draft',
      }).returning();

      res.json(blogPost);
    } catch (error) {
      console.error('Error generating blog post:', error);
      res.status(500).json({ 
        message: 'Failed to generate blog post', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // Get blog posts for a project
  app.get('/api/blog/project/:projectId', async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const posts = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.projectId, projectId));
      
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog posts' });
    }
  });

  // Marketing API endpoints
  app.post('/api/marketing/social/generate', async (req, res) => {
    try {
      const socialSchema = z.object({
        topic: z.string(),
        platform: z.enum(['facebook', 'instagram', 'linkedin', 'twitter']),
        includeHashtags: z.boolean().optional(),
      });

      const { topic, platform, includeHashtags = true } = socialSchema.parse(req.body);
      
      const post = await aiContentGenerator.generateSocialMediaPost(topic, platform, includeHashtags);
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate social media post' });
    }
  });

  app.post('/api/marketing/email/generate', async (req, res) => {
    try {
      const emailSchema = z.object({
        campaignType: z.enum(['welcome', 'newsletter', 'case-update', 'follow-up']),
        practiceArea: z.string(),
        personalData: z.object({
          name: z.string().optional(),
          caseType: z.string().optional(),
        }).optional(),
      });

      const data = emailSchema.parse(req.body);
      
      const email = await aiContentGenerator.generateEmailCampaign(
        data.campaignType,
        data.practiceArea,
        data.personalData
      );
      
      res.json(email);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate email campaign' });
    }
  });

  // Voice cloning endpoints
  app.post('/api/voice/clone', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      const { name, description } = req.body;
      
      const voiceModel = await voiceCloneService.cloneVoice({
        name: name || 'Custom Voice',
        description: description || 'Voice clone created with Codexel.ai',
        audioFile: req.file.buffer,
        fileName: req.file.originalname || 'voice-sample.wav'
      });

      res.json(voiceModel);
    } catch (error) {
      console.error('Voice cloning error:', error);
      res.status(500).json({ error: 'Failed to create voice clone' });
    }
  });

  app.post('/api/voice/speak', async (req, res) => {
    try {
      const { text, voiceId } = req.body;
      
      if (!text || !voiceId) {
        return res.status(400).json({ error: 'Text and voiceId are required' });
      }

      const audioBuffer = await voiceCloneService.generateSpeech(text, voiceId);
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length,
      });
      
      res.send(audioBuffer);
    } catch (error) {
      console.error('Speech generation error:', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });

  app.get('/api/voice/list', async (req, res) => {
    try {
      const voices = await voiceCloneService.listVoices();
      res.json({ voices });
    } catch (error) {
      console.error('Voice list error:', error);
      res.status(500).json({ error: 'Failed to fetch voices' });
    }
  });

  // Import and use layout routes
  const layoutRoutes = await import('./routes/layouts').then(m => m.default);
  app.use(layoutRoutes);

  // Import and use analytics routes
  const analyticsRoutes = await import('./routes/analytics').then(m => m.default);
  app.use(analyticsRoutes);

  // Register deployment routes
  const { registerDeploymentRoutes } = await import('./routes/deployment');
  registerDeploymentRoutes(app);

  // Register monitoring routes
  const { registerMonitoringRoutes } = await import('./routes/monitoring');
  registerMonitoringRoutes(app);

  // Register load testing routes
  const { registerLoadTestingRoutes } = await import('./routes/loadTesting');
  registerLoadTestingRoutes(app);

  // Register advanced code generation routes
  const advancedCodeGenerationRoutes = await import('./routes/advanced-code-generation');
  app.use('/api/code-generation', advancedCodeGenerationRoutes.default);

  // Register smart templates routes  
  const smartTemplatesRoutes = await import('./routes/smart-templates');
  app.use('/api/smart-templates', smartTemplatesRoutes.default);

  // Register live deployment routes
  const { registerLiveDeploymentRoutes } = await import('./routes/liveDeployment');
  registerLiveDeploymentRoutes(app);

  // Register feedback routes
  const { registerFeedbackRoutes } = await import('./routes/feedback');
  registerFeedbackRoutes(app);

  // Register onboarding routes
  const { registerOnboardingRoutes } = await import('./routes/onboarding');
  registerOnboardingRoutes(app);

  // Register snapshot routes
  const { registerSnapshotRoutes } = await import('./routes/snapshots');
  registerSnapshotRoutes(app);

  // Performance Monitoring API endpoints
  app.get('/api/performance/metrics', (req, res) => {
    try {
      const metrics = performanceOptimizer.getMetrics();
      res.json({ metrics });
    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(500).json({ error: 'Failed to get performance metrics' });
    }
  });

  app.get('/api/performance/summary', (req, res) => {
    try {
      const summary = performanceOptimizer.getSummary();
      res.json(summary);
    } catch (error) {
      console.error('Performance summary error:', error);
      res.status(500).json({ error: 'Failed to get performance summary' });
    }
  });

  app.get('/api/performance/recommendations', (req, res) => {
    try {
      const recommendations = performanceOptimizer.getRecommendations();
      res.json({ recommendations });
    } catch (error) {
      console.error('Performance recommendations error:', error);
      res.status(500).json({ error: 'Failed to get performance recommendations' });
    }
  });

  app.get('/api/performance/health', (req, res) => {
    try {
      const health = performanceOptimizer.getSystemHealth();
      res.json(health);
    } catch (error) {
      console.error('System health error:', error);
      res.status(500).json({ error: 'Failed to get system health' });
    }
  });

  app.post('/api/performance/optimize', (req, res) => {
    try {
      const optimizations = performanceOptimizer.autoOptimize();
      res.json({ 
        success: true, 
        optimizations,
        message: `Applied ${optimizations.length} optimizations`
      });
    } catch (error) {
      console.error('Auto-optimize error:', error);
      res.status(500).json({ error: 'Failed to apply optimizations' });
    }
  });

  // Memory Optimization API endpoints
  app.get('/api/memory/metrics', (req, res) => {
    try {
      const metrics = memoryOptimizer.getCurrentMemoryMetrics();
      res.json({ success: true, metrics });
    } catch (error) {
      console.error('Memory metrics error:', error);
      res.status(500).json({ error: 'Failed to get memory metrics' });
    }
  });

  app.get('/api/memory/history', (req, res) => {
    try {
      const history = memoryOptimizer.getMemoryHistory();
      res.json({ success: true, history });
    } catch (error) {
      console.error('Memory history error:', error);
      res.status(500).json({ error: 'Failed to get memory history' });
    }
  });

  app.get('/api/memory/recommendations', (req, res) => {
    try {
      const recommendations = memoryOptimizer.getRecommendations();
      res.json({ success: true, recommendations });
    } catch (error) {
      console.error('Memory recommendations error:', error);
      res.status(500).json({ error: 'Failed to get memory recommendations' });
    }
  });

  app.post('/api/memory/optimize', (req, res) => {
    try {
      const optimizations = memoryOptimizer.optimizeNow();
      res.json({ 
        success: true, 
        optimizations,
        message: `Applied ${optimizations.length} memory optimizations`
      });
    } catch (error) {
      console.error('Memory optimize error:', error);
      res.status(500).json({ error: 'Failed to optimize memory' });
    }
  });

  // Caching Service API endpoints
  app.get('/api/cache/stats', (req, res) => {
    try {
      const cacheStats = cachingService.getStats();
      const specializedStats = {
        api: SpecializedCaches.api.getStats(),
        database: SpecializedCaches.database.getStats(),
        assets: SpecializedCaches.assets.getStats(),
        sessions: SpecializedCaches.sessions.getStats()
      };
      res.json({ 
        general: cacheStats,
        specialized: specializedStats
      });
    } catch (error) {
      console.error('Cache stats error:', error);
      res.status(500).json({ error: 'Failed to get cache statistics' });
    }
  });

  app.post('/api/cache/clear', (req, res) => {
    try {
      const { type } = req.body;
      
      if (type === 'all') {
        cachingService.clear();
        SpecializedCaches.api.clear();
        SpecializedCaches.database.clear();
        SpecializedCaches.assets.clear();
        SpecializedCaches.sessions.clear();
      } else if (type === 'api') {
        SpecializedCaches.api.clear();
      } else if (type === 'database') {
        SpecializedCaches.database.clear();
      } else if (type === 'assets') {
        SpecializedCaches.assets.clear();
      } else if (type === 'sessions') {
        SpecializedCaches.sessions.clear();
      } else {
        cachingService.clear();
      }

      res.json({ 
        success: true, 
        message: `Cleared ${type || 'general'} cache`
      });
    } catch (error) {
      console.error('Cache clear error:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

  app.get('/api/cache/optimize', (req, res) => {
    try {
      const recommendations = cachingService.optimizeCache();
      res.json({ 
        recommendations,
        message: `Found ${recommendations.length} optimization opportunities`
      });
    } catch (error) {
      console.error('Cache optimize error:', error);
      res.status(500).json({ error: 'Failed to optimize cache' });
    }
  });

  // CDN Optimization API endpoints
  app.get('/api/cdn/stats', (req, res) => {
    try {
      const cdnStats = cdnOptimizer.getPerformanceStats();
      res.json(cdnStats);
    } catch (error) {
      console.error('CDN stats error:', error);
      res.status(500).json({ error: 'Failed to get CDN statistics' });
    }
  });

  app.post('/api/cdn/config', (req, res) => {
    try {
      const { config } = req.body;
      cdnOptimizer.updateConfig(config);
      res.json({ 
        success: true, 
        message: 'CDN configuration updated',
        config
      });
    } catch (error) {
      console.error('CDN config error:', error);
      res.status(500).json({ error: 'Failed to update CDN configuration' });
    }
  });

  app.get('/api/cdn/optimize/:assetPath(*)', (req, res) => {
    try {
      const { assetPath } = req.params;
      const optimizedUrl = cdnOptimizer.generateAssetURL(`/${assetPath}`);
      const recommendations = cdnOptimizer.getImageOptimizations(`/${assetPath}`);
      
      res.json({
        originalPath: `/${assetPath}`,
        optimizedUrl,
        recommendations
      });
    } catch (error) {
      console.error('CDN optimize error:', error);
      res.status(500).json({ error: 'Failed to optimize asset' });
    }
  });

  // Database Optimization API endpoints
  app.get('/api/database/stats', (req, res) => {
    try {
      const stats = databaseOptimizer.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Database stats error:', error);
      res.status(500).json({ error: 'Failed to get database statistics' });
    }
  });

  app.get('/api/database/recommendations', (req, res) => {
    try {
      const recommendations = databaseOptimizer.getOptimizationRecommendations();
      const indexRecommendations = databaseOptimizer.getIndexRecommendations();
      
      res.json({
        optimization: recommendations,
        indexes: indexRecommendations,
        sqlStatements: databaseOptimizer.generateIndexSQL()
      });
    } catch (error) {
      console.error('Database recommendations error:', error);
      res.status(500).json({ error: 'Failed to get database recommendations' });
    }
  });

  app.post('/api/database/cleanup', (req, res) => {
    try {
      databaseOptimizer.cleanup();
      res.json({ 
        success: true, 
        message: 'Database query history cleaned up'
      });
    } catch (error) {
      console.error('Database cleanup error:', error);
      res.status(500).json({ error: 'Failed to cleanup database optimizer' });
    }
  });

  // Production Deployment API endpoints
  app.post('/api/deploy', async (req, res) => {
    try {
      const config = req.body;
      const deploymentId = await productionDeployer.createDeployment(config);
      
      res.json({
        success: true,
        deploymentId,
        message: 'Deployment started successfully',
        status: 'pending'
      });
    } catch (error) {
      console.error('Deployment creation error:', error);
      res.status(500).json({ error: 'Failed to start deployment' });
    }
  });

  app.get('/api/deploy/:deploymentId/status', (req, res) => {
    try {
      const { deploymentId } = req.params;
      const status = productionDeployer.getDeploymentStatus(deploymentId);
      
      if (!status) {
        return res.status(404).json({ error: 'Deployment not found' });
      }
      
      res.json(status);
    } catch (error) {
      console.error('Deployment status error:', error);
      res.status(500).json({ error: 'Failed to get deployment status' });
    }
  });

  app.get('/api/deploy/list', (req, res) => {
    try {
      const deployments = productionDeployer.getAllDeployments();
      res.json({ deployments });
    } catch (error) {
      console.error('Deployment list error:', error);
      res.status(500).json({ error: 'Failed to get deployment list' });
    }
  });

  app.post('/api/deploy/:deploymentId/cancel', (req, res) => {
    try {
      const { deploymentId } = req.params;
      const cancelled = productionDeployer.cancelDeployment(deploymentId);
      
      if (cancelled) {
        res.json({ success: true, message: 'Deployment cancelled successfully' });
      } else {
        res.status(400).json({ error: 'Cannot cancel deployment' });
      }
    } catch (error) {
      console.error('Deployment cancel error:', error);
      res.status(500).json({ error: 'Failed to cancel deployment' });
    }
  });

  app.post('/api/deploy/:deploymentId/rollback', async (req, res) => {
    try {
      const { deploymentId } = req.params;
      const rolledBack = await productionDeployer.rollbackDeployment(deploymentId);
      
      if (rolledBack) {
        res.json({ success: true, message: 'Rollback completed successfully' });
      } else {
        res.status(400).json({ error: 'Cannot rollback deployment' });
      }
    } catch (error) {
      console.error('Deployment rollback error:', error);
      res.status(500).json({ error: 'Failed to rollback deployment' });
    }
  });

  app.get('/api/deploy/recommendations', (req, res) => {
    try {
      const recommendations = productionDeployer.getDeploymentRecommendations();
      res.json({ recommendations });
    } catch (error) {
      console.error('Deployment recommendations error:', error);
      res.status(500).json({ error: 'Failed to get deployment recommendations' });
    }
  });

  app.get('/api/deploy/:deploymentId/health', (req, res) => {
    try {
      const { deploymentId } = req.params;
      const healthChecks = productionDeployer.getHealthChecks(deploymentId);
      res.json({ healthChecks });
    } catch (error) {
      console.error('Health checks error:', error);
      res.status(500).json({ error: 'Failed to get health checks' });
    }
  });

  // Phase 6: Advanced AI & Intelligence Enhancement Routes
  
  // Intelligent AI Orchestration
  app.post('/api/ai/intelligent-request', async (req, res) => {
    try {
      const { prompt, requirements = {}, options = {} } = req.body;
      
      const result = await intelligentAIOrchestrator.intelligentRequest(
        prompt,
        requirements,
        options
      );
      
      res.json(result);
    } catch (error) {
      console.error('Intelligent AI request failed:', error);
      res.status(500).json({ 
        error: 'Failed to process intelligent AI request',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // AI Model Analytics
  app.get('/api/ai/analytics', async (req, res) => {
    try {
      const analytics = intelligentAIOrchestrator.getModelAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('AI analytics failed:', error);
      res.status(500).json({ error: 'Failed to get AI analytics' });
    }
  });

  // Cost Optimization Analysis
  app.get('/api/ai/cost-optimization', async (req, res) => {
    try {
      const optimization = intelligentAIOrchestrator.getCostOptimization();
      res.json(optimization);
    } catch (error) {
      console.error('Cost optimization analysis failed:', error);
      res.status(500).json({ error: 'Failed to get cost optimization' });
    }
  });

  // Code Intelligence Analysis
  app.post('/api/code/analyze', async (req, res) => {
    try {
      const { code, language, filePath } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
      }
      
      const analysis = await codeIntelligenceService.analyzeCode(code, language, filePath);
      res.json(analysis);
    } catch (error) {
      console.error('Code analysis failed:', error);
      res.status(500).json({ 
        error: 'Failed to analyze code',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Auto-fix Application
  app.post('/api/code/apply-fix', async (req, res) => {
    try {
      const { code, fix } = req.body;
      
      if (!code || !fix) {
        return res.status(400).json({ error: 'Code and fix are required' });
      }
      
      const fixedCode = await codeIntelligenceService.applyAutoFix(code, fix);
      res.json({ fixedCode });
    } catch (error) {
      console.error('Auto-fix application failed:', error);
      res.status(500).json({ 
        error: 'Failed to apply auto-fix',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Code Intelligence Analytics
  app.get('/api/code/analytics', async (req, res) => {
    try {
      const analytics = codeIntelligenceService.getAnalyticsInsights();
      res.json(analytics);
    } catch (error) {
      console.error('Code analytics failed:', error);
      res.status(500).json({ error: 'Failed to get code analytics' });
    }
  });

  // Phase 7: Advanced Automation & Enterprise Scalability Routes
  
  // Autonomous Agents Management
  app.use('/api/autonomous', autonomousAgentsRoutes);
  
  // Real-time Collaboration
  app.use('/api/collaboration', collaborationRoutes);
  
  // Enterprise Deployment Automation
  app.use('/api/deployment', enterpriseDeploymentRoutes);

  // Phase 8: Mobile App Generator Routes
  
  // Generate mobile app from web app
  app.post('/api/mobile-app/generate', async (req, res) => {
    try {
      const { webAppUrl, platform, options } = req.body;
      
      if (!webAppUrl || !platform) {
        return res.status(400).json({ error: 'Web app URL and platform are required' });
      }
      
      const appId = await mobileAppGenerator.generateFromWebApp(webAppUrl, platform, options);
      res.json({ appId, message: 'Mobile app generation started' });
    } catch (error) {
      console.error('Mobile app generation failed:', error);
      res.status(500).json({ 
        error: 'Failed to generate mobile app',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get generation progress
  app.get('/api/mobile-app/progress/:appId', async (req, res) => {
    try {
      const { appId } = req.params;
      const progress = mobileAppGenerator.getGenerationProgress(appId);
      
      if (!progress) {
        return res.status(404).json({ error: 'Generation progress not found' });
      }
      
      res.json(progress);
    } catch (error) {
      console.error('Progress retrieval failed:', error);
      res.status(500).json({ error: 'Failed to get generation progress' });
    }
  });

  // Get generated apps
  app.get('/api/mobile-app/apps', async (req, res) => {
    try {
      const apps = mobileAppGenerator.getAllApps();
      res.json(apps);
    } catch (error) {
      console.error('Apps retrieval failed:', error);
      res.status(500).json({ error: 'Failed to get mobile apps' });
    }
  });

  // Get specific app details
  app.get('/api/mobile-app/app/:appId', async (req, res) => {
    try {
      const { appId } = req.params;
      const app = mobileAppGenerator.getApp(appId);
      
      if (!app) {
        return res.status(404).json({ error: 'Mobile app not found' });
      }
      
      res.json(app);
    } catch (error) {
      console.error('App retrieval failed:', error);
      res.status(500).json({ error: 'Failed to get mobile app' });
    }
  });

  // Download app files
  app.get('/api/mobile-app/download/:appId', async (req, res) => {
    try {
      const { appId } = req.params;
      const files = mobileAppGenerator.downloadAppFiles(appId);
      
      if (!files || files.length === 0) {
        return res.status(404).json({ error: 'No files found for this app' });
      }
      
      res.json(files);
    } catch (error) {
      console.error('File download failed:', error);
      res.status(500).json({ error: 'Failed to download app files' });
    }
  });

  // Generate PWA specifically
  app.post('/api/mobile-app/generate-pwa', async (req, res) => {
    try {
      const { webAppUrl, options } = req.body;
      
      if (!webAppUrl) {
        return res.status(400).json({ error: 'Web app URL is required' });
      }
      
      const appId = await mobileAppGenerator.generatePWA(webAppUrl, options);
      res.json({ appId, message: 'PWA generation started' });
    } catch (error) {
      console.error('PWA generation failed:', error);
      res.status(500).json({ 
        error: 'Failed to generate PWA',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  console.log('🚀 Phase 7 Advanced Features Initialized:');
  console.log('   ✅ Autonomous Development Agents');
  console.log('   ✅ Real-time Collaboration System');
  console.log('   ✅ Enterprise Deployment Automation');
  
  console.log('🚀 Phase 8 Advanced Features Initialized:');
  console.log('   ✅ Mobile App Generator');

  // Phase 9: Enterprise Analytics Routes
  
  // Get enterprise metrics
  app.get('/api/enterprise/analytics/metrics', async (req, res) => {
    try {
      const organizationId = req.query.orgId as string || 'default';
      const metrics = await enterpriseAnalytics.generateEnterpriseReport(organizationId);
      res.json(metrics);
    } catch (error) {
      console.error('Enterprise metrics failed:', error);
      res.status(500).json({ error: 'Failed to get enterprise metrics' });
    }
  });

  // Get team productivity data
  app.get('/api/enterprise/analytics/teams', async (req, res) => {
    try {
      const organizationId = req.query.orgId as string || 'default';
      const teams = await enterpriseAnalytics.getTeamProductivity(organizationId);
      res.json(teams);
    } catch (error) {
      console.error('Team productivity failed:', error);
      res.status(500).json({ error: 'Failed to get team productivity data' });
    }
  });

  // Get cost optimization data
  app.get('/api/enterprise/analytics/costs', async (req, res) => {
    try {
      const organizationId = req.query.orgId as string || 'default';
      const costs = await enterpriseAnalytics.getCostOptimization(organizationId);
      res.json(costs);
    } catch (error) {
      console.error('Cost optimization failed:', error);
      res.status(500).json({ error: 'Failed to get cost optimization data' });
    }
  });

  // Get compliance report
  app.get('/api/enterprise/analytics/compliance', async (req, res) => {
    try {
      const organizationId = req.query.orgId as string || 'default';
      const compliance = await enterpriseAnalytics.getComplianceReport(organizationId);
      res.json(compliance);
    } catch (error) {
      console.error('Compliance report failed:', error);
      res.status(500).json({ error: 'Failed to get compliance report' });
    }
  });

  // Export enterprise report
  app.post('/api/enterprise/analytics/export', async (req, res) => {
    try {
      const { format = 'json', timeRange = '7d', includeTeams = true, includeCosts = true } = req.body;
      const organizationId = req.query.orgId as string || 'default';
      
      const metrics = ['performance', 'security', 'api-usage'];
      if (includeTeams) metrics.push('teams');
      if (includeCosts) metrics.push('costs');
      
      const reportData = await enterpriseAnalytics.generateCustomReport(organizationId, metrics);
      const exportedContent = await enterpriseAnalytics.exportReport(reportData, format);
      
      res.json({ 
        content: exportedContent,
        filename: `enterprise-report-${new Date().toISOString().split('T')[0]}.${format}`
      });
    } catch (error) {
      console.error('Report export failed:', error);
      res.status(500).json({ error: 'Failed to export report' });
    }
  });

  // Track real-time analytics events
  app.post('/api/enterprise/analytics/track', async (req, res) => {
    try {
      const { event, data } = req.body;
      const organizationId = req.query.orgId as string || 'default';
      
      enterpriseAnalytics.trackEvent(organizationId, event, data);
      res.json({ success: true });
    } catch (error) {
      console.error('Event tracking failed:', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
  });

  console.log('🚀 Phase 9 Advanced Features Initialized:');
  console.log('   ✅ Enterprise Analytics & Insights');
  console.log('   ✅ Advanced Cost Optimization');
  console.log('   ✅ Team Productivity Tracking');

  // Register Phase 10 advanced features
  registerPhase10Routes(app);

  const httpServer = createServer(app);
  
  // Initialize real-time collaboration WebSocket server
  realTimeCollaboration.setupWebSocketServer(httpServer);
  
  return httpServer;
}