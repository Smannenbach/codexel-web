import { Router } from 'express';
import { storage } from '../storage';
import { fileUploadService } from '../services/fileUploadService';
import { isAuthenticated } from '../auth';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

const router = Router();

// Upload files
router.post('/upload', isAuthenticated, (req: any, res, next) => {
  // Apply upload middleware
  fileUploadService.getUploadMiddleware()(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files provided' });
      }

      // Get project ID from query or body
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;

      // Check storage quota for all files
      const totalSizeMB = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
      const hasQuota = await fileUploadService.checkStorageQuota(userId, totalSizeMB);
      
      if (!hasQuota) {
        // Clean up uploaded files if quota exceeded
        files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.error('Failed to clean up file:', e);
          }
        });
        return res.status(413).json({ error: 'Storage quota exceeded' });
      }

      // Process uploaded files
      const processedFiles = await fileUploadService.processUploadedFiles(files, userId, projectId);

      res.json({
        success: true,
        files: processedFiles,
        totalFiles: processedFiles.length,
        totalSize: totalSizeMB
      });

    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  });
});

// Get user's uploaded files
router.get('/', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const files = await storage.getFileAttachments(userId, projectId);

    res.json({
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        type: file.mimeType,
        url: file.url,
        isPublic: file.isPublic,
        uploadedAt: file.createdAt,
        projectId: file.projectId
      }))
    });
  } catch (error) {
    console.error('Failed to get files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a file
router.delete('/:fileId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const deleted = await fileUploadService.deleteFile(fileId, userId);

    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found or access denied' });
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get file by ID (for serving/downloading)
router.get('/:fileId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const files = await storage.getFileAttachments(userId);
    const file = files.find(f => f.id === fileId);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // If it's a download request, send the file
    if (req.query.download === 'true') {
      const filePath = path.join(process.cwd(), 'public', file.url);
      
      if (fs.existsSync(filePath)) {
        res.download(filePath, file.originalName);
      } else {
        res.status(404).json({ error: 'File not found on disk' });
      }
    } else {
      // Otherwise, return file metadata
      res.json({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        type: file.mimeType,
        url: file.url,
        isPublic: file.isPublic,
        uploadedAt: file.createdAt,
        projectId: file.projectId,
        metadata: file.metadata
      });
    }
  } catch (error) {
    console.error('Failed to get file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update file metadata
router.patch('/:fileId', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const fileId = parseInt(req.params.fileId);
    if (isNaN(fileId)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const schema = z.object({
      isPublic: z.boolean().optional(),
      metadata: z.any().optional()
    });

    const updates = schema.parse(req.body);

    // TODO: Implement updateFileAttachment in storage
    // For now, return success
    res.json({ success: true });

  } catch (error) {
    console.error('Failed to update file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;