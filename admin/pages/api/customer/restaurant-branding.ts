import { eq } from 'drizzle-orm';
import { db } from '../../../lib/storage';
import { restaurants } from '../../../../shared/schema';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ error: 'Restaurant slug is required' });
  }

  try {
    // Get restaurant by slug with branding info
    const [restaurant] = await db.select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      brandColors: restaurants.brandColors
    }).from(restaurants).where(eq(restaurants.slug, slug as string));
    
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }
    
    // Return restaurant branding with defaults if no custom branding
    const brandColors = restaurant.brandColors || {
      // Default branding colors
      primaryBg: '#ffffff',
      secondaryBg: '#f8fafc',
      cardBg: '#ffffff',
      primaryAccent: '#3b82f6',
      secondaryAccent: '#10b981',
      primaryText: '#1f2937',
      secondaryText: '#6b7280',
      linkText: '#3b82f6',
      buttonText: '#ffffff',
      successGreen: '#10b981',
      warningRed: '#ef4444',
      infoBlue: '#3b82f6',
      borderGray: '#e5e7eb',
      primaryFont: 'Inter, sans-serif',
      secondaryFont: 'Inter, sans-serif',
      headingScale: 1.25,
      bodySize: 16,
      lineHeight: 1.6,
      letterSpacing: 0
    };
    
    return res.status(200).json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug
      },
      branding: brandColors
    });
  } catch (error) {
    console.error('Restaurant branding fetch error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch restaurant branding'
    });
  }
}