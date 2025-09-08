import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/storage';
import { adminUsers, restaurants } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, phone, password, role } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone is required' });
    }

    // Find staff member (chef or delivery_boy)
    const staffQuery = db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        phone: adminUsers.phone,
        role: adminUsers.role,
        restaurantId: adminUsers.restaurantId,
        isActive: adminUsers.isActive,
        password: adminUsers.password
      })
      .from(adminUsers)
      .where(
        and(
          email ? eq(adminUsers.email, email) : eq(adminUsers.phone, phone || ''),
          role ? eq(adminUsers.role, role) : undefined
        )
      );

    const staffMembers = await staffQuery;
    const staff = staffMembers[0];
    
    if (!staff || staff.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!staff.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Verify role is chef or delivery_boy
    if (staff.role !== 'chef' && staff.role !== 'delivery_boy') {
      return res.status(401).json({ error: 'Invalid role for staff login' });
    }

    // Get restaurant info if assigned
    let restaurantInfo = null;
    if (staff.restaurantId) {
      const restaurantData = await db
        .select({
          name: restaurants.name,
          slug: restaurants.slug
        })
        .from(restaurants)
        .where(eq(restaurants.id, staff.restaurantId))
        .limit(1);
      
      restaurantInfo = restaurantData[0] || null;
    }

    // Return staff user data
    const userData = {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      restaurantId: staff.restaurantId,
      restaurantName: restaurantInfo?.name,
      restaurantSlug: restaurantInfo?.slug
    };

    res.json({ 
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}