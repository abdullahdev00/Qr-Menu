import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../server/db.js';
import { otpVerifications, customerUsers, insertCustomerUserSchema } from '../../../../shared/schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';
import { z } from 'zod';

const verifyOtpSchema = z.object({
  phoneNumber: z.string(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(['registration', 'login', 'phone_change']),
  // Required for registration
  name: z.string().optional(),
  email: z.string().email().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, otp, purpose, name, email } = verifyOtpSchema.parse(req.body);

    // Find valid OTP
    const otpRecord = await db.select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          eq(otpVerifications.otp, otp),
          eq(otpVerifications.purpose, purpose),
          eq(otpVerifications.isUsed, false),
          gte(otpVerifications.expiresAt, new Date())
        )
      )
      .limit(1);

    if (otpRecord.length === 0) {
      // Increment attempt count for existing OTP
      await db.update(otpVerifications)
        .set({ attemptsCount: sql`${otpVerifications.attemptsCount} + 1` })
        .where(
          and(
            eq(otpVerifications.phoneNumber, phoneNumber),
            eq(otpVerifications.purpose, purpose),
            eq(otpVerifications.isUsed, false)
          )
        );

      return res.status(400).json({ 
        error: 'Invalid or expired OTP' 
      });
    }

    // Mark OTP as used
    await db.update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, otpRecord[0].id));

    let user;

    if (purpose === 'registration') {
      // Create new user
      if (!name) {
        return res.status(400).json({ 
          error: 'Name is required for registration' 
        });
      }

      const newUser = await db.insert(customerUsers)
        .values({
          phoneNumber,
          name,
          email: email || null,
          isPhoneVerified: true,
          isActive: true
        })
        .returning();

      user = newUser[0];
    } else if (purpose === 'login') {
      // Get existing user
      const existingUser = await db.select()
        .from(customerUsers)
        .where(eq(customerUsers.phoneNumber, phoneNumber))
        .limit(1);

      if (existingUser.length === 0) {
        return res.status(400).json({ 
          error: 'User not found' 
        });
      }

      user = existingUser[0];

      // Update phone verification status
      await db.update(customerUsers)
        .set({ 
          isPhoneVerified: true,
          updatedAt: new Date()
        })
        .where(eq(customerUsers.id, user.id));
    } else if (purpose === 'phone_change') {
      // Handle phone number change - would need current user context
      return res.status(501).json({ 
        error: 'Phone change not implemented yet' 
      });
    }

    // Return user data (exclude sensitive information)
    const userResponse = {
      id: user.id,
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      user: userResponse,
      isNewUser: purpose === 'registration'
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}