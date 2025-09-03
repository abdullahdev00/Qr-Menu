import { storage } from '../../../lib/storage';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { restaurantId, restaurantSlug } = req.query;
      
      // Get restaurant either by ID or slug
      let targetRestaurantId = restaurantId;
      let restaurantInfo = null;
      
      if (!targetRestaurantId && restaurantSlug) {
        const restaurants = await storage.getRestaurants();
        console.log('Available restaurants:', restaurants.map(r => ({id: r.id, name: r.name, slug: r.slug})));
        console.log('Looking for slug:', restaurantSlug);
        const restaurant = restaurants.find(r => r.slug === restaurantSlug);
        console.log('Found restaurant:', restaurant ? {id: restaurant.id, name: restaurant.name, slug: restaurant.slug} : 'null');
        if (restaurant) {
          targetRestaurantId = restaurant.id;
          restaurantInfo = restaurant;
        }
      }
      
      // Fallback to first restaurant if none specified
      if (!targetRestaurantId) {
        const restaurants = await storage.getRestaurants();
        if (restaurants.length > 0) {
          targetRestaurantId = restaurants[0].id;
          restaurantInfo = restaurants[0];
        }
      }
      
      // If we still don't have restaurant info, fetch it
      if (!restaurantInfo && targetRestaurantId) {
        restaurantInfo = await storage.getRestaurant(targetRestaurantId);
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
        })),
        restaurant: restaurantInfo ? {
          id: restaurantInfo.id,
          name: restaurantInfo.name,
          slug: restaurantInfo.slug,
          ownerName: restaurantInfo.ownerName,
          address: restaurantInfo.address,
          city: restaurantInfo.city,
          avgRating: restaurantInfo.avgRating,
          totalReviews: restaurantInfo.totalReviews
        } : null
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