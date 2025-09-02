import type { Request, Response } from "express";
import { db } from "../../../lib/storage";
import { restaurants, qrCodes, restaurantTables } from "@shared/schema";
import { decodeTableParam } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { encodedTable, restaurantSlug } = req.body;

    if (!encodedTable || !restaurantSlug) {
      return res.status(400).json({ 
        error: 'Encoded table parameter and restaurant slug are required',
        success: false 
      });
    }

    // Decode the table parameter
    const decodedData = decodeTableParam(encodedTable);
    
    if (!decodedData) {
      return res.status(400).json({ 
        error: 'Invalid or corrupted table parameter',
        success: false 
      });
    }

    const { restaurantId, tableNumber } = decodedData;

    // Verify restaurant exists and matches slug
    const [restaurant] = await db
      .select()
      .from(restaurants)
      .where(and(
        eq(restaurants.id, restaurantId),
        eq(restaurants.slug, restaurantSlug),
        eq(restaurants.status, 'active')
      ));

    if (!restaurant) {
      return res.status(404).json({ 
        error: 'Restaurant not found or inactive',
        success: false 
      });
    }

    // Find the QR code for this restaurant and table
    const qrCodesData = await db
      .select({
        qrCode: qrCodes,
        table: restaurantTables
      })
      .from(qrCodes)
      .leftJoin(restaurantTables, eq(qrCodes.tableId, restaurantTables.id))
      .where(and(
        eq(qrCodes.restaurantId, restaurantId),
        eq(restaurantTables.tableNumber, tableNumber.toString())
      ));

    const qrCodeData = qrCodesData[0];
    
    if (!qrCodeData || !qrCodeData.qrCode) {
      return res.status(404).json({ 
        error: 'QR code not found for this table',
        success: false 
      });
    }

    // Check if QR code is active
    if (!qrCodeData.qrCode.isActive) {
      return res.status(403).json({ 
        error: 'This QR code has been deactivated',
        success: false 
      });
    }

    // Update scan count
    await db
      .update(qrCodes)
      .set({ 
        scansCount: (qrCodeData.qrCode.scansCount || 0) + 1,
        lastScanned: new Date()
      })
      .where(eq(qrCodes.id, qrCodeData.qrCode.id));

    // Return success with table information
    res.json({
      success: true,
      tableNumber: tableNumber,
      restaurantId: restaurantId,
      restaurantName: restaurant.name,
      qrCodeId: qrCodeData.qrCode.id,
      message: 'Valid QR code'
    });

  } catch (error) {
    console.error("Error validating table parameter:", error);
    res.status(500).json({ 
      error: "Failed to validate table parameter",
      success: false 
    });
  }
}