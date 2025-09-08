import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProtectedRoute } from '../components/auth/protected-route'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  Package, 
  Timer,
  Utensils,
  User,
  MapPin
} from 'lucide-react'
import { Order, OrderItem } from '@shared/schema'
import { format } from 'date-fns'

interface OrderWithItems extends Order {
  items: (OrderItem & { menuItem: { name: string; price: string } })[]
  restaurant?: { name: string }
}

function KitchenDashboardComponent() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  // Get restaurant ID from current user (will be set after auth implementation)
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const restaurantId = currentUser.restaurantId

  // Fetch confirmed orders only for kitchen
  const { data: orders = [], isLoading, refetch } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/kitchen/orders', restaurantId],
    queryFn: async () => {
      const response = await fetch(`/api/kitchen/orders?restaurantId=${restaurantId}&status=confirmed`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json();
    },
    enabled: !!restaurantId,
    refetchInterval: 3000 // Auto-refresh every 3 seconds
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
      queryClient.invalidateQueries({ queryKey: ['/api/kitchen/orders'] });
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

  // Handle double click and single button click
  const handleStatusUpdate = (orderId: string, currentStatus: string) => {
    let newStatus = '';
    switch (currentStatus) {
      case 'confirmed':
        newStatus = 'preparing';
        break;
      case 'preparing':
        newStatus = 'ready';
        break;
      default:
        return;
    }
    updateOrderStatus.mutate({ orderId, newStatus });
  };

  // Real-time WebSocket connection for kitchen updates
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
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-orange-500 animate-spin" />
          <h2 className="text-2xl font-bold">Loading Kitchen Orders...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg">
          <ChefHat className="w-10 h-10 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Kitchen Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Confirmed Orders ({orders.length})</p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Utensils className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No Confirmed Orders</h3>
          <p className="text-gray-500">New orders will appear here when confirmed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card 
              key={order.id}
              className={`shadow-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                order.status === 'confirmed' 
                  ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-purple-200 bg-purple-50 dark:bg-purple-900/20'
              }`}
              onDoubleClick={() => handleStatusUpdate(order.id, order.status)}
              data-testid={`kitchen-order-${order.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl font-bold">
                    Order #{order.orderNumber}
                  </CardTitle>
                  <Badge 
                    className={`text-lg px-3 py-1 ${
                      order.status === 'confirmed' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Order Details */}
                <div className="space-y-2">
                  {order.tableNumber && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Table {order.tableNumber}</span>
                    </div>
                  )}
                  
                  {order.customerName && (
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-500" />
                      <span>{order.customerName}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>{order.createdAt ? format(new Date(order.createdAt), 'HH:mm') : 'N/A'}</span>
                    {order.estimatedTime && (
                      <Badge variant="outline" className="ml-2">
                        <Timer className="w-4 h-4 mr-1" />
                        {order.estimatedTime}min
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Menu Items */}
                <div className="space-y-3 mb-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div>
                        <span className="font-semibold text-lg">{item.quantity}x {item.menuItem?.name}</span>
                        {item.specialRequests && (
                          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                            Note: {item.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Special Instructions: {order.specialInstructions}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {order.status === 'confirmed' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      disabled={updateOrderStatus.isPending}
                      className="w-full h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white"
                      data-testid="start-preparing-btn"
                    >
                      <ChefHat className="w-6 h-6 mr-2" />
                      START PREPARING
                    </Button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <Button 
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                      disabled={updateOrderStatus.isPending}
                      className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 text-white"
                      data-testid="mark-ready-btn"
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      MARK READY
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

export default function KitchenDashboard() {
  return (
    <ProtectedRoute allowedRoles={['chef', 'super_admin', 'admin']} requireRestaurant={true}>
      <KitchenDashboardComponent />
    </ProtectedRoute>
  );
}