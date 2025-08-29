import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../server/db.js';
import { customerUsers, updateCustomerUserSchema } from '../../../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const getProfileSchema = z.object({
  userId: z.string().uuid()
});

const updateProfileSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      // Handle profile creation after OTP verification
      const createProfileSchema = z.object({
        phoneNumber: z.string(),
        name: z.string().min(1, "Name is required"),
        email: z.string().email().optional()
      });

      const { phoneNumber, name, email } = createProfileSchema.parse(req.body);

      // Check if user exists
      const existingUser = await db.select()
        .from(customerUsers)
        .where(eq(customerUsers.phoneNumber, phoneNumber))
        .limit(1);

      if (existingUser.length === 0) {
        return res.status(404).json({ error: 'User not found. Please verify your phone number first.' });
      }

      // Update user profile
      const updatedUser = await db.update(customerUsers)
        .set({ 
          name, 
          email: email || null,
          updatedAt: new Date()
        })
        .where(eq(customerUsers.phoneNumber, phoneNumber))
        .returning();

      const userResponse = {
        id: updatedUser[0].id,
        phoneNumber: updatedUser[0].phoneNumber,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        isPhoneVerified: updatedUser[0].isPhoneVerified,
        isActive: updatedUser[0].isActive,
        createdAt: updatedUser[0].createdAt,
        updatedAt: updatedUser[0].updatedAt
      };

      return res.status(200).json({ 
        success: true,
        user: userResponse 
      });

    } else if (req.method === 'PUT') {
      // Handle profile updates
      const updateProfileSchema = z.object({
        phoneNumber: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email().optional()
      });

      const { phoneNumber, name, email } = updateProfileSchema.parse(req.body);

      const updates: any = { updatedAt: new Date() };
      if (name) updates.name = name;
      if (email !== undefined) updates.email = email;

      const updatedUser = await db.update(customerUsers)
        .set(updates)
        .where(eq(customerUsers.phoneNumber, phoneNumber))
        .returning();

      if (updatedUser.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userResponse = {
        id: updatedUser[0].id,
        phoneNumber: updatedUser[0].phoneNumber,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        isPhoneVerified: updatedUser[0].isPhoneVerified,
        isActive: updatedUser[0].isActive,
        createdAt: updatedUser[0].createdAt,
        updatedAt: updatedUser[0].updatedAt
      };

      return res.status(200).json({ 
        success: true,
        user: userResponse 
      });

    } else if (req.method === 'GET') {
      const { userId } = getProfileSchema.parse(req.query);

      const user = await db.select()
        .from(customerUsers)
        .where(eq(customerUsers.id, userId))
        .limit(1);

      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return user data (exclude sensitive information)
      const userResponse = {
        id: user[0].id,
        phoneNumber: user[0].phoneNumber,
        name: user[0].name,
        email: user[0].email,
        isPhoneVerified: user[0].isPhoneVerified,
        isActive: user[0].isActive,
        createdAt: user[0].createdAt,
        updatedAt: user[0].updatedAt
      };

      return res.status(200).json({ user: userResponse });

    } else if (req.method === 'PATCH') {
      const { userId, name, email } = updateProfileSchema.parse({
        ...req.query,
        ...req.body
      });

      const updates: any = { updatedAt: new Date() };
      if (name) updates.name = name;
      if (email) updates.email = email;

      const updatedUser = await db.update(customerUsers)
        .set(updates)
        .where(eq(customerUsers.id, userId))
        .returning();

      if (updatedUser.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return updated user data
      const userResponse = {
        id: updatedUser[0].id,
        phoneNumber: updatedUser[0].phoneNumber,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        isPhoneVerified: updatedUser[0].isPhoneVerified,
        isActive: updatedUser[0].isActive,
        createdAt: updatedUser[0].createdAt,
        updatedAt: updatedUser[0].updatedAt
      };

      return res.status(200).json({ 
        success: true,
        user: userResponse 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Profile API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}