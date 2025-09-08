import { Request, Response } from 'express';
import { db } from '../../../lib/storage';
import { adminUsers } from '../../../../shared/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Staff ID is required' });
      }

      // Check if staff member exists
      const staff = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, id as string))
        .limit(1);

      if (staff.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      // Verify it's a staff role
      if (staff[0].role !== 'chef' && staff[0].role !== 'delivery_boy') {
        return res.status(400).json({ error: 'Can only delete chef or delivery staff' });
      }

      // Delete staff member
      await db
        .delete(adminUsers)
        .where(eq(adminUsers.id, id as string));

      res.json({ message: 'Staff member deleted successfully' });
    } catch (error) {
      console.error('Error deleting staff:', error);
      res.status(500).json({ error: 'Failed to delete staff member' });
    }
  } else if (req.method === 'PUT') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'Staff ID is required' });
      }

      const { isActive } = req.body;

      // Update staff member status
      const updatedStaff = await db
        .update(adminUsers)
        .set({ isActive })
        .where(eq(adminUsers.id, id as string))
        .returning({
          id: adminUsers.id,
          name: adminUsers.name,
          email: adminUsers.email,
          phone: adminUsers.phone,
          role: adminUsers.role,
          isActive: adminUsers.isActive,
          createdAt: adminUsers.createdAt
        });

      if (updatedStaff.length === 0) {
        return res.status(404).json({ error: 'Staff member not found' });
      }

      res.json(updatedStaff[0]);
    } catch (error) {
      console.error('Error updating staff:', error);
      res.status(500).json({ error: 'Failed to update staff member' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}