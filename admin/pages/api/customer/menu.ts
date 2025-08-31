import { storage } from '../../../lib/storage';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { restaurantId, restaurantSlug } = req.query;
      
      // Get restaurant either by ID or slug
      let targetRestaurantId = restaurantId;
      if (!targetRestaurantId && restaurantSlug) {
        const restaurants = await storage.getRestaurants();
        const restaurant = restaurants.find(r => r.slug === restaurantSlug);
        if (restaurant) {
          targetRestaurantId = restaurant.id;
        }
      }
      
      // Fallback to first restaurant if none specified
      if (!targetRestaurantId) {
        const restaurants = await storage.getRestaurants();
        if (restaurants.length > 0) {
          targetRestaurantId = restaurants[0].id;
        }
      }
      
      const menuItems = await storage.getMenuItems(targetRestaurantId);
      const categories = await storage.getMenuCategories(targetRestaurantId);
      
      // Format data for customer website
      const formattedItems = menuItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: parseFloat(item.price),
        category: categories.find(c => c.id === item.categoryId)?.name || 'uncategorized',
        image: item.image,
        images: item.images || [item.image], // Use multiple images if available
        rating: 4.5 + (Math.random() * 0.5), // Random rating for demo
        reviewsCount: Math.floor(Math.random() * 200) + 50,
        preparationTime: item.preparationTime || 20,
        dietary: [],
        spiceLevel: item.isSpicy ? 3 : 1,
        allergens: item.allergens || [],
        calories: item.calories || 300,
        availability: item.isAvailable,
        isSpecial: false,
        tags: item.isSpicy ? ['spicy'] : []
      }));
      
      res.status(200).json({
        success: true,
        items: formattedItems,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description
        }))
      });
    } catch (error) {
      console.error('Error fetching menu:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch menu items' 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}