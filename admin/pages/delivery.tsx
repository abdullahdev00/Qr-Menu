import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'
import { 
  Truck, 
  Clock, 
  CheckCircle, 
  Package, 
  MapPin,
  User,
  Phone,
  Navigation,
  DollarSign
} from 'lucide-react'
import { Order, OrderItem } from '@shared/schema'
import { format } from 'date-fns'

interface OrderWithItems extends Order {
  items: (OrderItem & { menuItem: { name: string; price: string } })[]
  restaurant?: { name: string }
}

export default function DeliveryDashboard() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Get restaurant ID from current user (will be set after auth implementation)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const restaurantId = currentUser.restaurantId

  // Fetch ready orders for delivery only
  const { data: orders = [], isLoading, refetch } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/delivery/orders', restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/delivery/orders?restaurantId=${restaurantId}&deliveryType=delivery&status=ready`);
      if (!response.ok) throw new Error('Failed to fetch delivery orders');
      return response.json();
    },
    enabled: !!restaurantId,
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  });

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update order');
      return response.json();
    },
    onSuccess: (data, { newStatus }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/delivery/orders'] });
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
        variant: "default"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  });

  // Handle status updates for delivery workflow
  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    let newStatus = '';
    switch (currentStatus) {
      case 'ready':
        newStatus = 'out_for_delivery';
        break;
      case 'out_for_delivery':
        newStatus = 'delivered';
        break;
      default:
        return;
    }
    updateOrderStatus.mutate({ orderId, newStatus });
  };

  // Real-time WebSocket connection for delivery updates
  useEffect(() => {
    if (!restaurantId) return;
    
    const ws = new WebSocket(`ws://${window.location.host}/ws`);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join-restaurant',
        restaurantId: restaurantId
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order-update') {
        refetch(); // Refresh orders when updates come
      }
    };
    
    return () => ws.close();
  }, [restaurantId, refetch]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-bounce" />
          <h2 className="text-2xl font-bold">Loading Delivery Orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          <Truck className="w-10 h-10 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Delivery Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Ready for Delivery ({orders.length})</p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No Delivery Orders</h3>
          <p className="text-gray-500">Ready delivery orders will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card 
              key={order.id}
              className={`shadow-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                order.status === 'ready' 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20' 
                  : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
              }`}
              onDoubleClick={() => handleStatusUpdate(order.id, order.status)}
              data-testid={`delivery-order-${order.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">
                    Order #{order.orderNumber}
                  </CardTitle>
                  <Badge 
                    className={`text-lg px-3 py-1 ${
                      order.status === 'ready' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {order.status === 'out_for_delivery' ? 'OUT FOR DELIVERY' : order.status.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Customer & Delivery Details */}
                <div className="space-y-2">
                  {order.customerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                  )}
                  
                  {order.customerPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <span className="text-blue-600 font-medium">{order.customerPhone}</span>
                    </div>
                  )}
                  
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <span className="text-sm leading-tight">{order.deliveryAddress}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>{order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : 'N/A'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                      <span className="font-bold">PKR {order.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Menu Items Summary */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Items ({order.items?.length || 0}):</h4>
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-gray-800 rounded">
                      <span>{item.quantity}x {item.menuItem?.name}</span>
                      <span className="font-medium">PKR {item.totalPrice}</span>
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Delivery Instructions: {order.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Payment Status */}
                <div className="mb-4 p-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment:</span>
                    <Badge 
                      variant={order.paymentStatus === 'paid' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {order.paymentStatus.toUpperCase()} - {order.paymentMethod.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {order.status === 'ready' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                      disabled={updateOrderStatus.isPending}
                      className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="start-delivery-btn"
                    >
                      <Truck className="w-6 h-6 mr-2" />
                      START DELIVERY
                    </Button>
                  )}
                  
                  {order.status === 'out_for_delivery' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order.id, 'out_for_delivery')}
                      disabled={updateOrderStatus.isPending}
                      className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                      data-testid="mark-delivered-btn"
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      MARK DELIVERED
                    </Button>
                  )}
                  
                  {/* Navigation Button */}
                  {order.deliveryAddress && (
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const address = encodeURIComponent(order.deliveryAddress || '');
                        window.open(`https://maps.google.com/maps?q=${address}`, '_blank');
                      }}
                      className="w-full h-12 text-sm border-2"
                      data-testid="navigate-btn"
                    >
                      <Navigation className="w-5 h-5 mr-2" />
                      NAVIGATE TO ADDRESS
                    </Button>
                  )}
                </div>

                {/* Double Click Hint */}
                <p className="text-xs text-center text-gray-500 mt-2">
                  💡 Double-click card to update status
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}