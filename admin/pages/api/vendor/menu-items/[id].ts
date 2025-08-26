import { storage } from '../../../../lib/storage';

export default async function handler(req: any, res: any) {
  try {
    const { method } = req;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Item ID is required' });
    }

    switch (method) {
      case 'GET':
        const item = await storage.getMenuItem(id);
        if (!item) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        return res.status(200).json(item);

      case 'PUT':
        try {
          const existingItem = await storage.getMenuItem(id);
          if (!existingItem) {
            return res.status(404).json({ error: 'Menu item not found' });
          }

          const updatedItem = await storage.updateMenuItem(id, req.body);
          return res.status(200).json(updatedItem);
        } catch (validationError: any) {
          return res.status(400).json({ 
            error: 'Invalid data', 
            details: validationError.errors || validationError.message 
          });
        }

      case 'DELETE':
        const itemToDelete = await storage.getMenuItem(id);
        if (!itemToDelete) {
          return res.status(404).json({ error: 'Menu item not found' });
        }

        const success = await storage.deleteMenuItem(id);
        if (success) {
          return res.status(204).end();
        } else {
          return res.status(500).json({ error: 'Failed to delete menu item' });
        }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} not allowed` });
    }
  } catch (error) {
    console.error('Menu item API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}