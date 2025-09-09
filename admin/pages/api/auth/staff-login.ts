import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/storage';
import { staff, restaurants } from '@shared/schema';
import { eq, and, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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

    console.log(`🔍 Staff login attempt: ${email || phone} with role: ${role}`);

    // Find staff member using staff table
    const staffQuery = db
      .select()
      .from(staff)
      .where(
        and(
          email ? eq(staff.email, email) : eq(staff.phone, phone || ''),
          role ? eq(staff.role, role) : undefined
        )
      );

    const staffMembers = await staffQuery;
    const staffMember = staffMembers[0];
    
    console.log(`📋 Staff found: ${staffMember ? 'Yes' : 'No'}`);
    
    if (!staffMember) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, staffMember.password);
    
    if (!isPasswordValid) {
      console.log('❌ Password validation failed');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('✅ Password validation successful');

    if (!staffMember.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    // Get restaurant info
    let restaurantInfo = null;
    if (staffMember.restaurantId) {
      const restaurantData = await db
        .select({
          name: restaurants.name,
          slug: restaurants.slug
        })
        .from(restaurants)
        .where(eq(restaurants.id, staffMember.restaurantId))
        .limit(1);
      
      restaurantInfo = restaurantData[0] || null;
    }

    // Return staff user data
    const userData = {
      id: staffMember.id,
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      role: staffMember.role,
      restaurantId: staffMember.restaurantId,
      restaurantName: restaurantInfo?.name,
      restaurantSlug: restaurantInfo?.slug
    };

    console.log(`✅ Staff login successful: ${userData.name} (${userData.role})`);

    res.json({ 
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}