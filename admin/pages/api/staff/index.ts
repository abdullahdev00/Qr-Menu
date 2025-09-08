import { Request, Response } from 'express';
import { db } from '../../../lib/storage';
import { adminUsers } from '../../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'GET') {
    try {
      const { restaurantId } = req.query;

      if (!restaurantId) {
        return res.status(400).json({ error: 'Restaurant ID is required' });
      }

      const staff = await db
        .select({
          id: adminUsers.id,
          name: adminUsers.name,
          email: adminUsers.email,
          phone: adminUsers.phone,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          createdAt: adminUsers.createdAt
        })
        .from(adminUsers)
        .where(
          and(
            eq(adminUsers.restaurantId, restaurantId as string),
            eq(adminUsers.role, 'chef')
          )
        );

      const deliveryStaff = await db
        .select({
          id: adminUsers.id,
          name: adminUsers.name,
          email: adminUsers.email,
          phone: adminUsers.phone,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          createdAt: adminUsers.createdAt
        })
        .from(adminUsers)
        .where(
          and(
            eq(adminUsers.restaurantId, restaurantId as string),
            eq(adminUsers.role, 'delivery_boy')
          )
        );

      const allStaff = [...staff, ...deliveryStaff];
      res.json(allStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      res.status(500).json({ error: 'Failed to fetch staff members' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, phone, password, role, restaurantId } = req.body;

      if (!name || !email || !password || !role || !restaurantId) {
        return res.status(400).json({ error: 'Name, email, password, role, and restaurant ID are required' });
      }

      if (role !== 'chef' && role !== 'delivery_boy') {
        return res.status(400).json({ error: 'Role must be chef or delivery_boy' });
      }

      // Check if email already exists
      const existingUser = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create staff member
      const newStaff = await db
        .insert(adminUsers)
        .values({
          name,
          email,
          phone: phone || null,
          password: hashedPassword,
          role,
          restaurantId,
          isActive: true
        })
        .returning({
          id: adminUsers.id,
          name: adminUsers.name,
          email: adminUsers.email,
          phone: adminUsers.phone,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          createdAt: adminUsers.createdAt
        });

      res.status(201).json(newStaff[0]);
    } catch (error) {
      console.error('Error creating staff:', error);
      res.status(500).json({ error: 'Failed to create staff member' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}