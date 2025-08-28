import { storage } from '../../../lib/storage';
import { insertMenuItemSchema } from '../../../../shared/schema';
import { z } from 'zod';

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Get specific menu item
      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      return res.status(200).json(menuItem);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      // Validate request body
      const validatedData = insertMenuItemSchema.partial().parse(req.body);
      
      // Update menu item
      const menuItem = await storage.updateMenuItem(id, validatedData);
      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      return res.status(200).json(menuItem);
    }

    if (req.method === 'DELETE') {
      // Delete menu item
      const deleted = await storage.deleteMenuItem(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      return res.status(200).json({ message: 'Menu item deleted successfully' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Menu item API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}