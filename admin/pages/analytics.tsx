import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
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
  Home
} from "lucide-react"
import { Link } from 'wouter'

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
  { name: "Chicken Tikka", orders: 65, revenue: 16250, percentage: 11 },
  { name: "Vegetable Biryani", orders: 54, revenue: 13500, percentage: 9 },
  { name: "Dal Makhani", orders: 43, revenue: 10750, percentage: 7 },
  { name: "Naan Bread", orders: 32, revenue: 3200, percentage: 3 },
]

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899']

export default function Analytics() {
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
        // Admin users see admin analytics, redirect them
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
              <YAxis className="text-xs" />
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
                strokeWidth={2}
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
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
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
                formatter={(value: any, name: string) => {
                  if (name === 'revenue') return [`PKR ${value.toLocaleString()}`, 'Revenue']
                  if (name === 'avgRating') return [value, 'Avg Rating']
                  return [value, name]
                }}
              />
              <Bar yAxisId="left" dataKey="orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#F59E0B" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        )
      
      case 'menu':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topMenuItems.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {topMenuItems.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value: any) => [`${value}%`, 'Percentage']}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {topMenuItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-medium text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.orders} orders</p>
                      <p className="text-xs text-gray-500">PKR {item.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation Bar */}
      <div className="bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location === '/dashboard' 
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </Link>
          
          <Link href="/menu-management">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location === '/menu-management' 
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Menu Management</span>
            </button>
          </Link>
          
          <Link href="/orders">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location === '/orders' 
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </button>
          </Link>
          
          <Link href="/analytics">
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location === '/analytics' 
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Analytics Header */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Restaurant Analytics 📊
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.restaurantName} • Performance Insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">PKR 768,000</p>
            <p className="text-xs text-green-600">↗ 12.5% from last month</p>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3,124</p>
            <p className="text-xs text-blue-600">↗ 8.2% from last month</p>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">PKR 246</p>
            <p className="text-xs text-purple-600">↗ 4.1% from last month</p>
          </div>
          
          <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Rating</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">4.6</p>
            <p className="text-xs text-yellow-600">↗ 0.2 from last month</p>
          </div>
        </div>
      </div>
      
      {/* Interactive Charts */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap gap-2">
            {chartButtons.map((button) => {
              const Icon = button.icon
              return (
                <Button
                  key={button.id}
                  onClick={() => setActiveChart(button.id as any)}
                  variant={activeChart === button.id ? "default" : "outline"}
                  className={`transition-all duration-200 ${
                    activeChart === button.id 
                      ? `${button.color} text-white shadow-lg transform scale-105` 
                      : 'hover:scale-105'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {button.label}
                </Button>
              )
            })}
          </div>
        </CardHeader>
        
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>
    </div>
  )
}