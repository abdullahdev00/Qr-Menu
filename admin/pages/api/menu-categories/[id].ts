import { storage } from '../../../lib/storage';
import { insertMenuCategorySchema } from '../../../../shared/schema';
import { z } from 'zod';

export default async function handler(req: any, res: any) {
  try {
    const { id } = req.query;

    if (req.method === 'PUT') {
      // Validate request body
      const validatedData = insertMenuCategorySchema.parse(req.body);
      
      // Update menu category
      const category = await storage.updateMenuCategory(id, validatedData);
      return res.status(200).json(category);
    }

    if (req.method === 'DELETE') {
      // Delete menu category
      await storage.deleteMenuCategory(id);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Menu category API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}