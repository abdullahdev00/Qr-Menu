import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../../../lib/storage';
import { customerUsers } from '../../../shared/schema';
import bcrypt from 'bcryptjs';

const passwordLoginSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\+92[0-9]{10}$/, "Phone number must be in +92xxxxxxxxxx format")
    .or(z.string().regex(/^03[0-9]{9}$/, "Phone number must be in 03xxxxxxxxx format")),
  password: z.string().min(1, "Password is required")
});

// Format phone number to international format
function formatPhoneNumber(phone: string): string {
  if (phone.startsWith('03')) {
    return '+92' + phone.substring(1);
  }
  return phone;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber: rawPhone, password } = passwordLoginSchema.parse(req.body);
    const phoneNumber = formatPhoneNumber(rawPhone);

    // Find user by phone number
    const user = await db.select()
      .from(customerUsers)
      .where(eq(customerUsers.phoneNumber, phoneNumber))
      .limit(1);

    if (user.length === 0) {
      return res.status(400).json({ 
        error: 'Phone number not registered. Please sign up first.' 
      });
    }

    const existingUser = user[0];

    // Check if user has password set
    if (!existingUser.password) {
      return res.status(400).json({ 
        error: 'No password set for this account. Please use OTP login or set a password first.' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ 
        error: 'Invalid password. Please try again.' 
      });
    }

    // Update last login timestamp
    await db.update(customerUsers)
      .set({ updatedAt: new Date() })
      .where(eq(customerUsers.id, existingUser.id));

    // Return success with user data (excluding password)
    const { password: _, ...userWithoutPassword } = existingUser;
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      isNewUser: false
    });

  } catch (error) {
    console.error('Password login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors[0].message 
      });
    }
    res.status(500).json({ error: 'Login failed' });
  }
}