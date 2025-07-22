import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/ai-service";
import type { InsertMessage, InsertProject, InsertAgent } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, projectId, model } = req.body;
      
      // Create user message
      await storage.createMessage({
        projectId: projectId || 1,
        role: 'user',
        content: message,
        model: null,
      });

      // Generate AI response
      const aiResponse = await AIService.generateResponse(message, model || 'gpt-4');

      // Create AI response message
      const response = await storage.createMessage({
        projectId: projectId || 1,
        role: 'assistant', 
        content: aiResponse.content,
        model: aiResponse.model,
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
        projectId: req.body.projectId || 1,
        name: req.body.name || "Agent",
        role: req.body.role || "developer",
        model: req.body.model || "gpt-4",
        color: req.body.color || "#3B82F6",
        icon: req.body.icon || "🤖",
      });

      res.json(agent);
    } catch (error) {
      console.error("Agent creation error:", error);
      res.status(500).json({ message: "Failed to create agent" });
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

  // Usage stats
  app.get("/api/usage/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const usage = await storage.getAiUsageByUser(userId);
      
      const totalTokens = usage.reduce((sum: number, record: any) => 
        sum + (record.inputTokens || 0) + (record.outputTokens || 0), 0
      );
      
      const totalCost = usage.reduce((sum: number, record: any) => 
        sum + (record.cost || 0), 0
      );

      res.json({
        totalTokens,
        totalCost,
        requestCount: usage.length,
      });
    } catch (error) {
      console.error("Usage stats error:", error);
      res.status(500).json({ message: "Failed to get usage stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}