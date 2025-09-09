import { Request, Response } from 'express';
import { db } from '../../../lib/storage';
import { staff, updateStaffSchema } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default async function handler(req: Request, res: Response) {
  const { id } = req.query;
  console.log(`🏢 Staff ID API: ${req.method} request for ID: ${id}`);

  if (req.method === 'GET') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Staff ID is required' });
      }

      const staffMember = await db
        .select()
        .from(staff)
        .where(eq(staff.id, id as string))
        .limit(1);

      if (staffMember.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      console.log(`✅ Staff member fetched: ${staffMember[0].name}`);
      res.json(staffMember[0]);
    } catch (error) {
      console.error('❌ Error fetching staff member:', error);
      res.status(500).json({ error: 'Failed to fetch staff member' });
    }
  } else if (req.method === 'PUT') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Staff ID is required' });
      }

      console.log('📝 Updating staff member:', req.body);
      const validatedData = updateStaffSchema.parse(req.body);

      // Hash password if provided
      if (validatedData.password) {
        validatedData.password = await bcrypt.hash(validatedData.password, 12);
      }

      // Update staff member
      const updatedStaff = await db
        .update(staff)
        .set({
          ...validatedData,
          updatedAt: new Date(),
        })
        .where(eq(staff.id, id as string))
        .returning();

      if (updatedStaff.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      console.log(`✅ Staff member updated: ${updatedStaff[0].name}`);
      res.json(updatedStaff[0]);
    } catch (error) {
      console.error('❌ Error updating staff member:', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update staff member' });
      }
    }
  } else if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Staff ID is required' });
      }

      // Check if staff member exists
      const staffMember = await db
        .select()
        .from(staff)
        .where(eq(staff.id, id as string))
        .limit(1);

      if (staffMember.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Delete staff member
      await db
        .delete(staff)
        .where(eq(staff.id, id as string));

      console.log(`✅ Staff member deleted: ${staffMember[0].name}`);
      res.json({ message: 'Staff member deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting staff member:', error);
      res.status(500).json({ error: 'Failed to delete staff member' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}