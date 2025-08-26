import { storage } from '../../../lib/storage';
import { insertMenuItemSchema } from '../../../../shared/schema';

export default async function handler(req: any, res: any) {
  try {
    const { method } = req;
    
    switch (method) {
      case 'GET':
        const { restaurantId, categoryId, search } = req.query;
        if (!restaurantId) {
          return res.status(400).json({ error: 'Restaurant ID is required' });
        }
        
        let items;
        if (search) {
          items = await storage.searchMenuItems(restaurantId, search);
        } else {
          items = await storage.getMenuItems(restaurantId, categoryId);
        }
        
        return res.status(200).json(items);

      case 'POST':
        try {
          const validatedData = insertMenuItemSchema.parse(req.body);
          const newItem = await storage.createMenuItem(validatedData);
          return res.status(201).json(newItem);
        } catch (validationError: any) {
          return res.status(400).json({ 
            error: 'Invalid data', 
            details: validationError.errors || validationError.message 
          });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Menu items API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}