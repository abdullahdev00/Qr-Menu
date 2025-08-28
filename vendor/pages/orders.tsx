import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../admin/components/ui/button'
import { Input } from '../../admin/components/ui/input'
import { Badge } from '../../admin/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../admin/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../admin/components/ui/select'
import { useToast } from '../../admin/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  User,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  ChefHat,
  Eye,
  Edit,
  MoreHorizontal,
  Utensils,
  TrendingUp,
  AlertCircle,
  Timer
} from 'lucide-react'
import { Order, OrderItem } from '@shared/schema'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../admin/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../admin/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  role: string
  restaurantName?: string
}

interface OrderWithItems extends Order {
  items: (OrderItem & { menuItem: { name: string; price: string } })[]
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Timer,
    gradient: 'from-yellow-500 to-orange-500'
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: CheckCircle,
    gradient: 'from-blue-500 to-indigo-500'
  },
  preparing: { 
    label: 'Preparing', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: ChefHat,
    gradient: 'from-purple-500 to-pink-500'
  },
  ready: { 
    label: 'Ready', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: Package,
    gradient: 'from-green-500 to-emerald-500'
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    icon: Truck,
    gradient: 'from-teal-500 to-cyan-500'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
    gradient: 'from-green-500 to-emerald-500'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
    gradient: 'from-red-500 to-pink-500'
  }
}

export default function OrdersPage() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role !== 'restaurant') {
        setLocation('/dashboard')
      } else {
        setUser(userData)
      }
    } else {
      setLocation('/login')
    }
  }, [])

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/vendor/orders', user?.id],
    queryFn: async (): Promise<OrderWithItems[]> => {
      const response = await fetch(`/api/vendor/orders?restaurantId=${user?.id}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      return response.json()
    },
    enabled: !!user,
  })

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedAt: new Date() })
      })
      if (!response.ok) throw new Error('Failed to update order')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vendor/orders'] })
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully.",
      })
    }
  })

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    )
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toString().includes(searchTerm) ||
      (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerPhone || '').includes(searchTerm)
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  const OrderCard = ({ order }: { order: OrderWithItems }) => {
    const statusInfo = statusConfig[order.status as keyof typeof statusConfig]
    const StatusIcon = statusInfo.icon

    return (
      <Card className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${statusInfo.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <StatusIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  Order #{order.orderNumber}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${statusInfo.color} border-0 shadow-sm`}>
                {statusInfo.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <DropdownMenuItem onClick={() => {
                      let nextStatus = 'confirmed'
                      if (order.status === 'confirmed') nextStatus = 'preparing'
                      else if (order.status === 'preparing') nextStatus = 'ready'
                      else if (order.status === 'ready') nextStatus = 'completed'
                      
                      updateOrderMutation.mutate({ orderId: order.id, status: nextStatus })
                    }}>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Status
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {order.customerName && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <User className="w-4 h-4 mr-2" />
                  {order.customerName}
                </div>
              )}
              {order.customerPhone && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 mr-2" />
                  {order.customerPhone}
                </div>
              )}
              {order.deliveryType !== 'dine_in' && order.deliveryAddress && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4 mr-2" />
                  {order.deliveryAddress}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                <DollarSign className="w-4 h-4 mr-2" />
                PKR {order.totalAmount}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Package className="w-4 h-4 mr-2" />
                {order.deliveryType.replace('_', ' ').toUpperCase()}
              </div>
              {order.estimatedTime && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-4 h-4 mr-2" />
                  {order.estimatedTime} min
                </div>
              )}
            </div>
          </div>
          {order.items && order.items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Order Items:</p>
              <div className="flex flex-wrap gap-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item.quantity}x {item.menuItem.name}
                  </Badge>
                ))}
                {order.items.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{order.items.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Orders Management 📦
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.restaurantName} • Track and manage your orders
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Utensils className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total Orders</p>
        </div>

        <div className="bg-gradient-to-br from-white to-yellow-50/50 dark:from-gray-900 dark:to-yellow-950/30 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Pending</p>
        </div>

        <div className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.preparing}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Preparing</p>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 rounded-xl p-6 border border-green-200/50 dark:border-green-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Completed</p>
        </div>

        <div className="bg-gradient-to-br from-white to-red-50/50 dark:from-gray-900 dark:to-red-950/30 rounded-xl p-6 border border-red-200/50 dark:border-red-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelled}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Cancelled</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search orders by number, customer name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center p-12">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'You haven\'t received any orders yet.'}
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${statusConfig[selectedOrder.status as keyof typeof statusConfig].gradient} rounded-lg flex items-center justify-center`}>
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg">Order #{selectedOrder.orderNumber}</div>
                  <div className="text-sm font-normal text-gray-600 dark:text-gray-300">
                    {selectedOrder.createdAt ? format(new Date(selectedOrder.createdAt), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge className={statusConfig[selectedOrder.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig].label}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  PKR {selectedOrder.totalAmount}
                </div>
              </div>

              {/* Customer Info */}
              {(selectedOrder.customerName || selectedOrder.customerPhone) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.customerName && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedOrder.customerName}</span>
                      </div>
                    )}
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white">Order Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.deliveryType.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>{selectedOrder.paymentMethod.toUpperCase()}</span>
                  </div>
                  {selectedOrder.estimatedTime && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{selectedOrder.estimatedTime} minutes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.menuItem.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Qty: {item.quantity} × PKR {item.unitPrice}
                          </div>
                        </div>
                        <div className="font-bold">PKR {item.totalPrice}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              {selectedOrder.specialInstructions && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Special Instructions</h4>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 rounded-r-lg">
                    <p className="text-sm">{selectedOrder.specialInstructions}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}