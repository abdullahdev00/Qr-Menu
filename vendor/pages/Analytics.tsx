import { VendorLayout } from "../components/VendorLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Button } from "../../admin/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../admin/components/ui/select";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Clock,
  Star,
  Download,
  Eye,
  Calendar
} from "lucide-react";

const revenueData = [
  { name: 'Mon', revenue: 8500, orders: 45 },
  { name: 'Tue', revenue: 12300, orders: 62 },
  { name: 'Wed', revenue: 9800, orders: 38 },
  { name: 'Thu', revenue: 15200, orders: 78 },
  { name: 'Fri', revenue: 18500, orders: 92 },
  { name: 'Sat', revenue: 22100, orders: 115 },
  { name: 'Sun', revenue: 16800, orders: 85 },
];

const popularItems = [
  { name: 'Chicken Biryani', orders: 145, revenue: 65250 },
  { name: 'Karahi Chicken', orders: 98, revenue: 58800 },
  { name: 'Seekh Kebab', orders: 76, revenue: 26600 },
  { name: 'Dal Makhani', orders: 65, revenue: 18200 },
  { name: 'Gulab Jamun', orders: 58, revenue: 8700 },
];

const tablePerformance = [
  { table: 'Table 1', scans: 45, orders: 23, conversion: 51 },
  { table: 'Table 2', scans: 38, orders: 19, conversion: 50 },
  { table: 'VIP 1', scans: 15, orders: 12, conversion: 80 },
  { table: 'Table 3', scans: 32, orders: 14, conversion: 44 },
  { table: 'Table 4', scans: 28, orders: 11, conversion: 39 },
];

const peakHours = [
  { hour: '10 AM', orders: 5 },
  { hour: '11 AM', orders: 8 },
  { hour: '12 PM', orders: 15 },
  { hour: '1 PM', orders: 25 },
  { hour: '2 PM', orders: 22 },
  { hour: '3 PM', orders: 12 },
  { hour: '7 PM', orders: 18 },
  { hour: '8 PM', orders: 28 },
  { hour: '9 PM', orders: 32 },
  { hour: '10 PM', orders: 15 },
];

const categoryData = [
  { name: 'Pakistani Specialties', value: 45, color: '#3B82F6' },
  { name: 'Main Course', value: 30, color: '#10B981' },
  { name: 'Beverages', value: 15, color: '#F59E0B' },
  { name: 'Desserts', value: 10, color: '#EF4444' },
];

const stats = [
  {
    title: "Total Revenue",
    value: "PKR 102,800",
    change: "+15.2%",
    trend: "up",
    icon: DollarSign,
    period: "This Week"
  },
  {
    title: "Total Orders", 
    value: "515",
    change: "+12.8%",
    trend: "up",
    icon: ShoppingCart,
    period: "This Week"
  },
  {
    title: "Avg Order Value",
    value: "PKR 385",
    change: "+2.1%", 
    trend: "up",
    icon: TrendingUp,
    period: "This Week"
  },
  {
    title: "Customer Rating",
    value: "4.8",
    change: "+0.3",
    trend: "up", 
    icon: Star,
    period: "This Month"
  },
];

export function Analytics() {
  return (
    <VendorLayout restaurantName="Karachi Kitchen" ownerName="Ahmed Ali">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your restaurant's performance and insights
            </p>
          </div>
          <div className="flex space-x-2">
            <Select defaultValue="7days">
              <SelectTrigger className="w-40" data-testid="date-range-selector">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" data-testid="export-report">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-sm flex items-center ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.change} from {stat.period}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.trend === 'up' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
              <CardDescription>Daily revenue and order count for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? `PKR ${value}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#3B82F6" name="revenue" />
                  <Bar dataKey="orders" fill="#10B981" name="orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Popular Menu Items */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Menu Items</CardTitle>
              <CardDescription>Top selling items this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.orders} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      PKR {item.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Order by Category</CardTitle>
              <CardDescription>Distribution of orders by menu category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Order volume throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Table Performance</CardTitle>
              <CardDescription>QR scan to order conversion rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tablePerformance.map((table, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {table.table}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {table.conversion}% conversion
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {table.scans} scans
                    </span>
                    <span className="flex items-center">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {table.orders} orders
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${table.conversion}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Key findings from your restaurant data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Peak Day Performance
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Saturday generated 22% more revenue than average with 115 orders
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100">
                  Best Converting Table
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  VIP 1 has 80% QR to order conversion rate - highest performing table
                </p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <h4 className="font-medium text-orange-900 dark:text-orange-100">
                  Growth Opportunity
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  3-6 PM shows low activity - consider lunch specials or promotions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
}