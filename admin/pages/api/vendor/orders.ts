import type { NextApiRequest, NextApiResponse } from 'next'
import { storage } from '../../../lib/storage'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { restaurantId } = req.query
    
    // Get orders for specific restaurant or all orders
    const orders = await storage.getOrders(restaurantId as string)
    
    // Get order items for each order with menu item details
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await storage.getOrderItems(order.id)
        
        // Get menu item details for each order item
        const itemsWithMenuDetails = await Promise.all(
          orderItems.map(async (item) => {
            const menuItem = await storage.getMenuItem(item.menuItemId)
            return {
              ...item,
              menuItem: menuItem || {
                id: item.menuItemId,
                name: 'Unknown Item',
                price: '0.00',
                description: 'Item not found'
              }
            }
          })
        )
        
        return {
          ...order,
          items: itemsWithMenuDetails
        }
      })
    )

    res.json(ordersWithItems)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ message: 'Failed to fetch orders' })
  }
}