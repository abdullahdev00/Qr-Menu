import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@shared/db';
import { customerUsers } from '@shared/schema';
import bcrypt from 'bcryptjs';

const setPasswordSchema = z.object({
  phoneNumber: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, password } = setPasswordSchema.parse(req.body);

    // Find user by phone number
    const user = await db.select()
      .from(customerUsers)
      .where(eq(customerUsers.phoneNumber, phoneNumber))
      .limit(1);

    if (user.length === 0) {
      return res.status(400).json({ 
        error: 'User not found. Please register first.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user with password
    await db.update(customerUsers)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(customerUsers.id, user[0].id));

    res.status(200).json({
      success: true,
      message: 'Password set successfully'
    });

  } catch (error) {
    console.error('Set password error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors[0].message 
      });
    }
    res.status(500).json({ error: 'Failed to set password' });
  }
}