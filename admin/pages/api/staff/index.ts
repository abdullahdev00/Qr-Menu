import { Request, Response } from 'express';
import { db } from '../../../lib/storage';
import { staff, insertStaffSchema } from '../../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default async function handler(req: Request, res: Response) {
  console.log(`🏢 Staff API: ${req.method} request received`);

  if (req.method === 'GET') {
    try {
      const { restaurantId } = req.query;
      
      let staffData;
      if (restaurantId) {
        // Get staff for specific restaurant
        console.log(`🔍 Fetching staff for restaurant: ${restaurantId}`);
        staffData = await db.select().from(staff).where(eq(staff.restaurantId, restaurantId as string));
      } else {
        // Get all staff
        console.log('🔍 Fetching all staff');
        staffData = await db.select().from(staff);
      }

      console.log(`✅ Staff fetched successfully: ${staffData.length} records`);
      res.json(staffData);
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  } else if (req.method === 'POST') {
    try {
      console.log('📝 Creating new staff member:', req.body);
      
      const validatedData = insertStaffSchema.parse(req.body);
      
      // Check if email already exists
      const existingStaff = await db
        .select()
        .from(staff)
        .where(eq(staff.email, validatedData.email))
        .limit(1);

      if (existingStaff.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      
      const newStaff = await db.insert(staff).values({
        ...validatedData,
        password: hashedPassword,
      }).returning();

      console.log('✅ Staff member created successfully:', newStaff[0].id);
      res.status(201).json(newStaff[0]);
    } catch (error) {
      console.error('❌ Error creating staff member:', error);
      if (error instanceof Error) {
        // Check for unique constraint violation (duplicate email)
        if (error.message.includes('unique constraint')) {
          res.status(409).json({ error: 'Email already exists' });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to create staff member' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}