import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/ai-service";
import { AgentOrchestrator } from "./services/ai-orchestrator";
import type { InsertMessage, InsertProject, InsertAgent } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { content, projectId, model } = req.body;
      
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
        // Use agent orchestrator for complex requests
        const orchestrator = new AgentOrchestrator();
        aiResponse = await orchestrator.processMessage(actualProjectId, content);
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
        userId: "1",
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
      const projects = await storage.getProjects("1");
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

  // Send message endpoint
  app.post('/api/projects/:projectId/messages', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { content } = req.body;

      // Get project to determine model
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Process message through orchestrator
      const orchestrator = new AgentOrchestrator();
      const aiResponse = await orchestrator.processMessage(parseInt(projectId), content);

      // Save user message
      const userMessage = await storage.createMessage({
        projectId: parseInt(projectId),
        content,
        role: 'user',
      });

      // Save AI response
      const assistantMessage = await storage.createMessage({
        projectId: parseInt(projectId),
        content: aiResponse,
        role: 'assistant',
        model: project.config?.primaryModel || 'gpt-4',
      });

      // Update project progress
      const checklistItems = await storage.getChecklistItemsByProject(parseInt(projectId));
      const completedItems = checklistItems.filter(item => item.status === 'completed').length;
      const progress = Math.round((completedItems / checklistItems.length) * 100);
      
      await storage.updateProject(parseInt(projectId), { progress });

      res.json(assistantMessage);
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(500).json({ error: error.message });
    }
  });

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

  const httpServer = createServer(app);
  return httpServer;
}