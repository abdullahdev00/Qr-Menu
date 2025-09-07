import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/storage';
import { otpVerifications, customerUsers } from '../../../../shared/schema.js';
import { eq, and, gte } from 'drizzle-orm';
import { z } from 'zod';

// Schema for request validation
const sendOtpSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\+92[0-9]{10}$/, "Phone number must be in +92xxxxxxxxxx format")
    .or(z.string().regex(/^03[0-9]{9}$/, "Phone number must be in 03xxxxxxxxx format")),
  purpose: z.enum(['registration', 'login', 'phone_change']).default('login')
});

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    const { phoneNumber: rawPhone, purpose } = sendOtpSchema.parse(req.body);
    const phoneNumber = formatPhoneNumber(rawPhone);

    // Check if user exists for registration purpose
    if (purpose === 'registration') {
      const existingUser = await db.select()
        .from(customerUsers)
        .where(eq(customerUsers.phoneNumber, phoneNumber))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(400).json({ 
          error: 'Phone number already registered. Try logging in instead.' 
        });
      }
    }

    // Check if user exists for login purpose
    if (purpose === 'login') {
      const existingUser = await db.select()
        .from(customerUsers)
        .where(eq(customerUsers.phoneNumber, phoneNumber))
        .limit(1);

      if (existingUser.length === 0) {
        return res.status(400).json({ 
          error: 'Phone number not registered. Please sign up first.' 
        });
      }
    }

    // Check for recent OTP requests (rate limiting)
    const recentOTP = await db.select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.phoneNumber, phoneNumber),
          eq(otpVerifications.purpose, purpose),
          gte(otpVerifications.createdAt, new Date(Date.now() - 60000)) // 1 minute
        )
      )
      .limit(1);

    if (recentOTP.length > 0) {
      return res.status(429).json({ 
        error: 'Please wait 1 minute before requesting another OTP' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to database
    await db.insert(otpVerifications).values({
      phoneNumber,
      otp,
      purpose,
      expiresAt,
      isUsed: false,
      attemptsCount: 0
    });

    // In production, send SMS via Twilio or other service
    // For development, we'll log the OTP
    console.log(`📱 OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      phoneNumber,
      // Remove this in production - only for development
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Failed to send OTP' });
  }
}