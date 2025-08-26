import { useState } from "react";
import { VendorLayout } from "../components/VendorLayout";
import { Button } from "../../admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Star,
  QrCode,
  Menu,
  Clock,
  DollarSign
} from "lucide-react";
import { Link } from "wouter";

const quickStats = [
  {
    title: "Today's Revenue",
    value: "PKR 12,500",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Orders Today",
    value: "24",
    change: "+12.5%",
    trend: "up", 
    icon: ShoppingCart,
  },
  {
    title: "Menu Items",
    value: "48",
    change: "2 new",
    trend: "neutral",
    icon: Menu,
  },
  {
    title: "Avg Rating",
    value: "4.8",
    change: "0.2 up",
    trend: "up",
    icon: Star,
  },
];

const recentOrders = [
  {
    id: "ORD-001",
    table: "Table 5",
    items: "Biryani, Lassi, Naan",
    amount: "PKR 850",
    status: "preparing",
    time: "2 min ago"
  },
  {
    id: "ORD-002", 
    table: "Table 12",
    items: "Karahi Chicken, Rice",
    amount: "PKR 1,200",
    status: "ready",
    time: "5 min ago"
  },
  {
    id: "ORD-003",
    table: "Table 3",
    items: "Seekh Kebab, Roti",
    amount: "PKR 600",
    status: "served",
    time: "8 min ago"
  },
];

const quickActions = [
  {
    title: "Add Menu Item",
    description: "Add new dishes to your menu",
    icon: Plus,
    href: "/vendor/menu/add",
    color: "bg-blue-500 hover:bg-blue-600"
  },
  {
    title: "Generate QR Code",
    description: "Create QR codes for tables",
    icon: QrCode,
    href: "/vendor/qr-codes/generate",
    color: "bg-green-500 hover:bg-green-600"
  },
  {
    title: "View Analytics",
    description: "Check performance metrics",
    icon: TrendingUp,
    href: "/vendor/analytics",
    color: "bg-purple-500 hover:bg-purple-600"
  },
  {
    title: "Customer Feedback",
    description: "Review customer comments",
    icon: Users,
    href: "/vendor/feedback",
    color: "bg-orange-500 hover:bg-orange-600"
  },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'preparing':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'ready':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'served':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
}

export function VendorDashboard() {
  return (
    <VendorLayout restaurantName="Karachi Kitchen" ownerName="Ahmed Ali">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, Ahmed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's what's happening with your restaurant today
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              Restaurant Open
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-sm ${
                      stat.trend === 'up' ? 'text-green-600' : 
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.trend === 'up' ? 'bg-green-100 dark:bg-green-900' :
                    stat.trend === 'down' ? 'bg-red-100 dark:bg-red-900' : 
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.trend === 'up' ? 'text-green-600' :
                      stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    data-testid={`action-${action.title.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className={`p-2 rounded-md ${action.color} mr-3`}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Latest orders from your restaurant
                  </CardDescription>
                </div>
                <Link href="/vendor/orders">
                  <Button variant="outline" size="sm" data-testid="view-all-orders">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.id}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.table}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {order.items}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {order.amount}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {order.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VendorLayout>
  );
}