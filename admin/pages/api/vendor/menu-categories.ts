import { storage } from '../../../lib/storage';
import { insertMenuCategorySchema } from '../../../../shared/schema';

export default async function handler(req: any, res: any) {
  try {
    const { method } = req;
    
    switch (method) {
      case 'GET':
        const { restaurantId } = req.query;
        if (!restaurantId) {
          return res.status(400).json({ error: 'Restaurant ID is required' });
        }
        
        const categories = await storage.getMenuCategories(restaurantId);
        return res.status(200).json(categories);

      case 'POST':
        try {
          const validatedData = insertMenuCategorySchema.parse(req.body);
          const newCategory = await storage.createMenuCategory(validatedData);
          return res.status(201).json(newCategory);
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
    console.error('Menu categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}