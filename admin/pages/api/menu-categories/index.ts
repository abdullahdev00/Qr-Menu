import { storage } from '../../../lib/storage';
import { insertMenuCategorySchema } from '../../../../shared/schema';
import { z } from 'zod';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      // Get all menu categories (you may want to filter by restaurant)
      const categories = await storage.getMenuCategories();
      return res.status(200).json(categories);
    }

    if (req.method === 'POST') {
      // Validate request body
      const validatedData = insertMenuCategorySchema.parse(req.body);
      
      // Create menu category
      const category = await storage.createMenuCategory(validatedData);
      return res.status(201).json(category);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Menu categories API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}