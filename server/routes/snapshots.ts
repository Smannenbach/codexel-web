import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { createInsertSchema } from 'drizzle-zod';
import { workspaceSnapshots } from '@shared/schema';

// Rate limiting middleware
const rateLimiters = {
  general: (req: any, res: any, next: any) => next(), // Placeholder for actual rate limiting
};

// Validation schemas
const snapshotSchema = createInsertSchema(workspaceSnapshots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true // Will be set from auth
});

const autoSaveSchema = z.object({
  projectId: z.number(),
  snapshotData: z.any()
});

const restoreSchema = z.object({
  snapshotId: z.number(),
  projectId: z.number()
});

export function registerSnapshotRoutes(app: express.Application) {
  // Get snapshots for a project
  app.get("/api/snapshots/project/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = 1; // In real app, get from authenticated user
      
      if (isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project ID" });
      }
      
      const snapshots = await storage.getWorkspaceSnapshots(userId, projectId);
      res.json({ snapshots });
    } catch (error) {
      console.error("Failed to fetch snapshots:", error);
      res.status(500).json({ error: "Failed to fetch snapshots" });
    }
  });

  // Create a workspace snapshot
  app.post("/api/snapshots", rateLimiters.general, async (req, res) => {
    try {
      const snapshot = snapshotSchema.parse(req.body);
      const userId = 1; // In real app, get from authenticated user

      const createdSnapshot = await storage.createWorkspaceSnapshot({
        ...snapshot,
        userId
      });

      res.json({ snapshot: createdSnapshot });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid snapshot data", details: error.errors });
      }
      
      console.error("Failed to create snapshot:", error);
      res.status(500).json({ error: "Failed to create snapshot" });
    }
  });

  // Auto-save endpoint (simplified snapshot creation)
  app.post("/api/snapshots/auto-save", rateLimiters.general, async (req, res) => {
    try {
      const { projectId, snapshotData } = autoSaveSchema.parse(req.body);
      const userId = 1; // In real app, get from authenticated user

      // Create auto-save snapshot with timestamp name
      const timestamp = new Date().toLocaleString();
      const autoSaveSnapshot = await storage.createWorkspaceSnapshot({
        userId,
        projectId,
        name: `Auto-save ${timestamp}`,
        description: "Automatic workspace backup",
        snapshotData,
        isAutoSaved: true,
        tags: ["auto-save"]
      });

      // Clean up old auto-saves (keep only last 10)
      await storage.cleanupAutoSaveSnapshots(userId, projectId, 10);

      res.json({ snapshot: autoSaveSnapshot });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid auto-save data", details: error.errors });
      }
      
      console.error("Failed to auto-save:", error);
      res.status(500).json({ error: "Failed to auto-save workspace" });
    }
  });

  // Restore a workspace snapshot
  app.post("/api/snapshots/restore", async (req, res) => {
    try {
      const { snapshotId, projectId } = restoreSchema.parse(req.body);
      const userId = 1; // In real app, get from authenticated user

      const snapshot = await storage.getWorkspaceSnapshotById(snapshotId, userId);
      
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }

      if (snapshot.projectId !== projectId) {
        return res.status(403).json({ error: "Snapshot does not belong to this project" });
      }

      res.json({ 
        snapshot: snapshot.snapshotData,
        metadata: {
          name: snapshot.name,
          description: snapshot.description,
          createdAt: snapshot.createdAt
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid restore data", details: error.errors });
      }
      
      console.error("Failed to restore snapshot:", error);
      res.status(500).json({ error: "Failed to restore snapshot" });
    }
  });

  // Delete a workspace snapshot
  app.delete("/api/snapshots/:id", async (req, res) => {
    try {
      const snapshotId = parseInt(req.params.id);
      const userId = 1; // In real app, get from authenticated user
      
      if (isNaN(snapshotId)) {
        return res.status(400).json({ error: "Invalid snapshot ID" });
      }

      const deleted = await storage.deleteWorkspaceSnapshot(snapshotId, userId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Snapshot not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete snapshot:", error);
      res.status(500).json({ error: "Failed to delete snapshot" });
    }
  });

  // Share a snapshot (create public link)
  app.post("/api/snapshots/:id/share", async (req, res) => {
    try {
      const snapshotId = parseInt(req.params.id);
      const userId = 1; // In real app, get from authenticated user
      
      if (isNaN(snapshotId)) {
        return res.status(400).json({ error: "Invalid snapshot ID" });
      }

      const snapshot = await storage.getWorkspaceSnapshotById(snapshotId, userId);
      
      if (!snapshot) {
        return res.status(404).json({ error: "Snapshot not found" });
      }

      // Generate shareable link (in real app, would create share token)
      const shareLink = `${req.protocol}://${req.get('Host')}/shared-workspace/${snapshotId}`;
      
      res.json({ 
        shareLink,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        snapshot: {
          name: snapshot.name,
          description: snapshot.description,
          createdAt: snapshot.createdAt
        }
      });
    } catch (error) {
      console.error("Failed to share snapshot:", error);
      res.status(500).json({ error: "Failed to share snapshot" });
    }
  });

  // Get shared snapshot (public endpoint)
  app.get("/api/shared-workspace/:id", async (req, res) => {
    try {
      const snapshotId = parseInt(req.params.id);
      
      if (isNaN(snapshotId)) {
        return res.status(400).json({ error: "Invalid snapshot ID" });
      }

      // In real app, would validate share token and expiration
      const snapshot = await storage.getWorkspaceSnapshotById(snapshotId, 1); // Get any user's snapshot for sharing
      
      if (!snapshot) {
        return res.status(404).json({ error: "Shared workspace not found or expired" });
      }

      res.json({
        snapshot: snapshot.snapshotData,
        metadata: {
          name: snapshot.name,
          description: snapshot.description,
          createdAt: snapshot.createdAt,
          tags: snapshot.tags
        },
        isShared: true,
        readOnly: true
      });
    } catch (error) {
      console.error("Failed to get shared snapshot:", error);
      res.status(500).json({ error: "Failed to load shared workspace" });
    }
  });
}