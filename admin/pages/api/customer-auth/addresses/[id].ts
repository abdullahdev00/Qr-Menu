import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '@shared/db';
import { customerAddresses, updateCustomerAddressSchema } from '@shared/schema';

// PUT: Update address
// DELETE: Delete address
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const addressId = query.id as string;

  if (!addressId) {
    return res.status(400).json({ error: 'Address ID is required' });
  }

  if (method === 'PUT') {
    try {
      const addressData = updateCustomerAddressSchema.parse(req.body);

      // If this is set as default, remove default from other addresses first
      if (addressData.isDefault) {
        // Get the address to find customerId
        const existingAddress = await db.select()
          .from(customerAddresses)
          .where(eq(customerAddresses.id, addressId))
          .limit(1);

        if (existingAddress.length > 0) {
          await db.update(customerAddresses)
            .set({ isDefault: false })
            .where(eq(customerAddresses.customerId, existingAddress[0].customerId));
        }
      }

      const [updatedAddress] = await db.update(customerAddresses)
        .set({
          ...addressData,
          updatedAt: new Date(),
        })
        .where(eq(customerAddresses.id, addressId))
        .returning();

      if (!updatedAddress) {
        return res.status(404).json({ error: 'Address not found' });
      }

      res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        address: updatedAddress
      });

    } catch (error) {
      console.error('Update address error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: error.errors[0].message 
        });
      }
      res.status(500).json({ error: 'Failed to update address' });
    }
  }

  else if (method === 'DELETE') {
    try {
      // Check if address exists and get its details
      const existingAddress = await db.select()
        .from(customerAddresses)
        .where(eq(customerAddresses.id, addressId))
        .limit(1);

      if (existingAddress.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }

      // Delete the address
      await db.delete(customerAddresses)
        .where(eq(customerAddresses.id, addressId));

      // If this was the default address, set another address as default
      if (existingAddress[0].isDefault) {
        const otherAddresses = await db.select()
          .from(customerAddresses)
          .where(eq(customerAddresses.customerId, existingAddress[0].customerId))
          .limit(1);

        if (otherAddresses.length > 0) {
          await db.update(customerAddresses)
            .set({ isDefault: true })
            .where(eq(customerAddresses.id, otherAddresses[0].id));
        }
      }

      res.status(200).json({
        success: true,
        message: 'Address deleted successfully'
      });

    } catch (error) {
      console.error('Delete address error:', error);
      res.status(500).json({ error: 'Failed to delete address' });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}