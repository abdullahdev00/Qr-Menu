import { storage } from '../../../../lib/storage';
import { insertMenuCategorySchema } from '../../../../../shared/schema';

export default async function handler(req: any, res: any) {
  try {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    switch (method) {
      case 'GET':
        const category = await storage.getMenuCategory(id);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        return res.status(200).json(category);

      case 'PUT':
        try {
          const existingCategory = await storage.getMenuCategory(id);
          if (!existingCategory) {
            return res.status(404).json({ error: 'Category not found' });
          }

          // Only validate fields that are being updated
          const updatedCategory = await storage.updateMenuCategory(id, req.body);
          return res.status(200).json(updatedCategory);
        } catch (validationError: any) {
          return res.status(400).json({ 
            error: 'Invalid data', 
            details: validationError.errors || validationError.message 
          });
        }

      case 'DELETE':
        const categoryToDelete = await storage.getMenuCategory(id);
        if (!categoryToDelete) {
          return res.status(404).json({ error: 'Category not found' });
        }

        const success = await storage.deleteMenuCategory(id);
        if (success) {
          return res.status(204).end();
        } else {
          return res.status(500).json({ error: 'Failed to delete category' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Menu category API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}