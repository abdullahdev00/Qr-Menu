import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/storage';
import { customerAddresses, insertCustomerAddressSchema, updateCustomerAddressSchema } from '../../../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const getAddressesSchema = z.object({
  customerId: z.string().uuid()
});

const createAddressSchema = insertCustomerAddressSchema.extend({
  customerId: z.string().uuid()
});

const updateAddressSchema = z.object({
  addressId: z.string().uuid(),
  customerId: z.string().uuid(),
  title: z.string().min(1).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).optional(),
  area: z.string().optional(),
  postalCode: z.string().optional(),
  landmark: z.string().optional(),
  isDefault: z.boolean().optional()
});

const deleteAddressSchema = z.object({
  addressId: z.string().uuid(),
  customerId: z.string().uuid()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { customerId } = getAddressesSchema.parse(req.query);

      const addresses = await db.select()
        .from(customerAddresses)
        .where(eq(customerAddresses.customerId, customerId))
        .orderBy(customerAddresses.isDefault, customerAddresses.createdAt);

      return res.status(200).json({ addresses });

    } else if (req.method === 'POST') {
      const data = createAddressSchema.parse(req.body);

      // If this is set as default, unset other default addresses
      if (data.isDefault) {
        await db.update(customerAddresses)
          .set({ isDefault: false })
          .where(eq(customerAddresses.customerId, data.customerId));
      }

      const newAddress = await db.insert(customerAddresses)
        .values({
          customerId: data.customerId,
          title: data.title,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          area: data.area || null,
          postalCode: data.postalCode || null,
          landmark: data.landmark || null,
          isDefault: data.isDefault || false
        })
        .returning();

      return res.status(201).json({ 
        success: true,
        address: newAddress[0] 
      });

    } else if (req.method === 'PATCH') {
      const { addressId, customerId, ...updates } = updateAddressSchema.parse({
        ...req.query,
        ...req.body
      });

      // If setting as default, unset other default addresses
      if (updates.isDefault) {
        await db.update(customerAddresses)
          .set({ isDefault: false })
          .where(eq(customerAddresses.customerId, customerId));
      }

      const updatedAddress = await db.update(customerAddresses)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(customerAddresses.id, addressId),
            eq(customerAddresses.customerId, customerId)
          )
        )
        .returning();

      if (updatedAddress.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }

      return res.status(200).json({ 
        success: true,
        address: updatedAddress[0] 
      });

    } else if (req.method === 'DELETE') {
      const { addressId, customerId } = deleteAddressSchema.parse({
        ...req.query,
        ...req.body
      });

      const deletedAddress = await db.delete(customerAddresses)
        .where(
          and(
            eq(customerAddresses.id, addressId),
            eq(customerAddresses.customerId, customerId)
          )
        )
        .returning();

      if (deletedAddress.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }

      return res.status(200).json({ 
        success: true,
        message: 'Address deleted successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Addresses API error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid input', 
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}