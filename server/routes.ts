import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerVoiceRoutes } from './routes/voice';
import aiRoutes from './routes/ai';
import { createSubscriptionRoutes } from './routes/subscriptions';
import multer from "multer";
import { storage } from "./storage";
import { voiceCloneService } from "./services/voiceCloning";
import { aiService } from "./services/ai-service";
import { AgentOrchestrator } from "./services/ai-orchestrator";
import type { InsertMessage, InsertProject, InsertAgent } from "@shared/schema";
import { aiContentGenerator } from "./services/ai-content-generator";
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
  // Register voice cloning routes
  registerVoiceRoutes(app);
  
  // Register AI chat routes
  app.use('/api/ai', aiRoutes);
  
  // Register subscription routes
  app.use('/api/subscriptions', createSubscriptionRoutes());
  
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

  const httpServer = createServer(app);
  return httpServer;
}