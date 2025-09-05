import type { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  // Payment request API is temporarily disabled
  // Users should contact WhatsApp for payments
  
  if (req.method === 'GET') {
    // Return empty array for history
    res.json([]);
  } else if (req.method === 'POST') {
    // Return message to use WhatsApp instead
    res.status(200).json({ 
      message: "Payment request feature is coming soon. Please send your payment receipt to WhatsApp: 03054288892",
      whatsapp: "03054288892",
      accountHolder: "Muhammad Abdullah",
      raastId: "03054288892"
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}