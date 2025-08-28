import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '../../admin/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../admin/components/ui/select'
import { Button } from '../../admin/components/ui/button'
import { Badge } from '../../admin/components/ui/badge'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart
} from "recharts"
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  ChefHat,
  Clock,
  Star,
  Home,
  Store,
  Users,
  Eye,
  Building
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  restaurantName?: string
}

// Sample restaurant analytics data
const restaurantAnalyticsData = [
  { month: "Jan", revenue: 45000, orders: 185, avgOrder: 243, satisfaction: 4.2 },
  { month: "Feb", revenue: 52000, orders: 208, avgOrder: 250, satisfaction: 4.3 },
  { month: "Mar", revenue: 48000, orders: 192, avgOrder: 250, satisfaction: 4.1 },
  { month: "Apr", revenue: 58000, orders: 232, avgOrder: 250, satisfaction: 4.4 },
  { month: "May", revenue: 65000, orders: 260, avgOrder: 250, satisfaction: 4.5 },
  { month: "Jun", revenue: 72000, orders: 288, avgOrder: 250, satisfaction: 4.6 },
  { month: "Jul", revenue: 68000, orders: 272, avgOrder: 250, satisfaction: 4.4 },
  { month: "Aug", revenue: 75000, orders: 300, avgOrder: 250, satisfaction: 4.7 },
  { month: "Sep", revenue: 82000, orders: 328, avgOrder: 250, satisfaction: 4.8 },
  { month: "Oct", revenue: 78000, orders: 312, avgOrder: 250, satisfaction: 4.6 },
  { month: "Nov", revenue: 85000, orders: 340, avgOrder: 250, satisfaction: 4.9 },
  { month: "Dec", revenue: 92000, orders: 368, avgOrder: 250, satisfaction: 4.8 },
]

const weeklyPerformance = [
  { day: "Mon", orders: 42, revenue: 10500, avgRating: 4.5 },
  { day: "Tue", orders: 38, revenue: 9500, avgRating: 4.3 },
  { day: "Wed", orders: 51, revenue: 12750, avgRating: 4.6 },
  { day: "Thu", orders: 47, revenue: 11750, avgRating: 4.4 },
  { day: "Fri", orders: 65, revenue: 16250, avgRating: 4.7 },
  { day: "Sat", orders: 72, revenue: 18000, avgRating: 4.8 },
  { day: "Sun", orders: 59, revenue: 14750, avgRating: 4.6 },
]

const topMenuItems = [
  { name: "Chicken Biryani", orders: 145, revenue: 36250, percentage: 25 },
  { name: "Beef Karahi", orders: 98, revenue: 24500, percentage: 17 },
  { name: "Mutton Pulao", orders: 87, revenue: 21750, percentage: 15 },
  { name: "Fish Curry", orders: 76, revenue: 19000, percentage: 13 },
  { name: "Vegetable Korma", orders: 65, revenue: 16250, percentage: 11 },
  { name: "Others", orders: 109, revenue: 27250, percentage: 19 },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

export default function VendorAnalytics() {
  const [location, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders' | 'performance' | 'menu'>('revenue')
  const [timeRange, setTimeRange] = useState('12months')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setUser(userData)
      } else {
        setLocation('/dashboard')
      }
    } else {
      setLocation('/login')
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    )
  }

  const chartButtons = [
    { id: 'revenue', label: 'Revenue Analysis', icon: DollarSign, color: 'bg-blue-500' },
    { id: 'orders', label: 'Order Trends', icon: ShoppingBag, color: 'bg-emerald-500' },
    { id: 'performance', label: 'Weekly Performance', icon: Activity, color: 'bg-purple-500' },
    { id: 'menu', label: 'Top Menu Items', icon: ChefHat, color: 'bg-orange-500' },
  ]

  const renderChart = () => {
    switch (activeChart) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={restaurantAnalyticsData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" tickFormatter={(value) => `PKR ${(value / 1000)}K`} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelFormatter={(label) => `Month: ${label}`}
                formatter={(value: any) => [`PKR ${value.toLocaleString()}`, 'Revenue']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case 'orders':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={restaurantAnalyticsData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                labelFormatter={(label) => `Month: ${label}`}
                formatter={(value: any) => [value, 'Orders']}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={weeklyPerformance}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" className="text-xs" />
              <YAxis yAxisId="left" className="text-xs" />
              <YAxis yAxisId="right" orientation="right" className="text-xs" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `PKR ${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Bar yAxisId="left" dataKey="orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} dot={{ fill: "#F59E0B", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )
      
      case 'menu':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topMenuItems}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="orders"
                >
                  {topMenuItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Top Menu Items</h3>
              {topMenuItems.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">PKR {item.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{item.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-gradient-to-br from-white via-purple-50/40 to-blue-50/40 dark:from-gray-900 dark:via-purple-950/30 dark:to-blue-950/30 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Restaurant Analytics 📊
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.restaurantName} • Performance Dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Analytics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track your business metrics with interactive charts</p>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {chartButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Button
                key={button.id}
                variant={activeChart === button.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveChart(button.id as any)}
                className={`flex items-center space-x-2 h-9 ${
                  activeChart === button.id 
                    ? `${button.color} hover:${button.color} text-white` 
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{button.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Main Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {chartButtons.find(b => b.id === activeChart)?.label}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Interactive data visualization
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Live Data
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                {renderChart()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Stats */}
        <div className="space-y-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">This Month</p>
                  <h3 className="text-2xl font-bold">PKR 92K</h3>
                  <p className="text-blue-100 text-xs mt-1">Revenue Generated</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-400">
                <div className="flex items-center text-blue-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+8% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Orders</p>
                  <h3 className="text-2xl font-bold">368</h3>
                  <p className="text-emerald-100 text-xs mt-1">Orders This Month</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-400">
                <div className="flex items-center text-emerald-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+12% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Menu Views</p>
                  <h3 className="text-2xl font-bold">7.5K</h3>
                  <p className="text-purple-100 text-xs mt-1">QR Code Scans</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-400">
                <div className="flex items-center text-purple-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">Peak: Friday evenings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Rating</p>
                  <h3 className="text-2xl font-bold">4.8 ⭐</h3>
                  <p className="text-orange-100 text-xs mt-1">Customer Satisfaction</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-400">
                <div className="flex items-center text-orange-100">
                  <Star className="w-4 h-4 mr-2" />
                  <span className="text-sm">Based on 340 reviews</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}