import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Get public layouts with filtering
router.get('/api/layouts', async (req, res) => {
  try {
    const { category, sort, q } = req.query;
    
    // Get public layouts
    let layouts = await storage.getWorkspaceLayouts({ 
      isPublic: true,
      category: category as string
    });
    
    // Filter by search query
    if (q && typeof q === 'string') {
      const searchQuery = q.toLowerCase();
      layouts = layouts.filter(layout => 
        layout.name.toLowerCase().includes(searchQuery) ||
        layout.description?.toLowerCase().includes(searchQuery) ||
        layout.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }
    
    // Sort results
    if (sort === 'recent') {
      layouts.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (sort === 'rating') {
      layouts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    // Default sort is by downloads (already done in storage)
    
    res.json(layouts);
  } catch (error) {
    console.error('Get layouts error:', error);
    res.status(500).json({ error: 'Failed to fetch layouts' });
  }
});

// Get user's layouts
router.get('/api/layouts/my-layouts', async (req, res) => {
  try {
    const userId = 1; // TODO: Get from authenticated user
    const layouts = await storage.getWorkspaceLayouts({ userId });
    res.json(layouts);
  } catch (error) {
    console.error('Get my layouts error:', error);
    res.status(500).json({ error: 'Failed to fetch your layouts' });
  }
});

// Create new layout
const createLayoutSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  businessType: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  configuration: z.record(z.any()),
  preview: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

router.post('/api/layouts', async (req, res) => {
  try {
    const data = createLayoutSchema.parse(req.body);
    
    const layout = await storage.createWorkspaceLayout({
      ...data,
      userId: 1, // TODO: Get from authenticated user
    });
    
    res.json(layout);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid layout data', details: error.errors });
    } else {
      console.error('Create layout error:', error);
      res.status(500).json({ error: 'Failed to create layout' });
    }
  }
});

// Download layout (increment counter and return configuration)
router.post('/api/layouts/:id/download', async (req, res) => {
  try {
    const layoutId = parseInt(req.params.id);
    const layout = await storage.getWorkspaceLayout(layoutId);
    
    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }
    
    // Increment download counter
    await storage.incrementLayoutDownloads(layoutId);
    
    res.json({
      id: layout.id,
      name: layout.name,
      configuration: layout.configuration,
    });
  } catch (error) {
    console.error('Download layout error:', error);
    res.status(500).json({ error: 'Failed to download layout' });
  }
});

// Rate layout
const rateLayoutSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

router.post('/api/layouts/:id/rate', async (req, res) => {
  try {
    const layoutId = parseInt(req.params.id);
    const data = rateLayoutSchema.parse(req.body);
    const userId = 1; // TODO: Get from authenticated user
    
    // Check if user already rated this layout
    const existingRating = await storage.getUserLayoutRating(layoutId, userId);
    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this layout' });
    }
    
    const rating = await storage.createLayoutRating({
      layoutId,
      userId,
      rating: data.rating,
      comment: data.comment,
    });
    
    res.json(rating);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid rating data', details: error.errors });
    } else {
      console.error('Rate layout error:', error);
      res.status(500).json({ error: 'Failed to submit rating' });
    }
  }
});

export default router;