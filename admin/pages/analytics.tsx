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

// Sample admin analytics data - aggregated from all restaurants
const adminAnalyticsData = [
  { month: "Jan", revenue: 320000, orders: 1450, restaurants: 22, customers: 8500 },
  { month: "Feb", revenue: 380000, orders: 1680, restaurants: 24, customers: 9200 },
  { month: "Mar", revenue: 350000, orders: 1520, restaurants: 23, customers: 8900 },
  { month: "Apr", revenue: 420000, orders: 1850, restaurants: 26, customers: 10500 },
  { month: "May", revenue: 480000, orders: 2100, restaurants: 28, customers: 12000 },
  { month: "Jun", revenue: 520000, orders: 2300, restaurants: 30, customers: 13200 },
  { month: "Jul", revenue: 495000, orders: 2180, restaurants: 29, customers: 12800 },
  { month: "Aug", revenue: 580000, orders: 2550, restaurants: 32, customers: 14500 },
  { month: "Sep", revenue: 625000, orders: 2750, restaurants: 34, customers: 15800 },
  { month: "Oct", revenue: 590000, orders: 2600, restaurants: 33, customers: 15200 },
  { month: "Nov", revenue: 680000, orders: 3000, restaurants: 36, customers: 17500 },
  { month: "Dec", revenue: 750000, orders: 3300, restaurants: 38, customers: 19200 },
]

const weeklyPerformance = [
  { day: "Mon", orders: 320, revenue: 85000, restaurants: 28, conversion: 12.5 },
  { day: "Tue", orders: 290, revenue: 78000, restaurants: 26, conversion: 11.8 },
  { day: "Wed", orders: 380, revenue: 95000, restaurants: 31, conversion: 13.2 },
  { day: "Thu", orders: 350, revenue: 88000, restaurants: 29, conversion: 12.8 },
  { day: "Fri", orders: 450, revenue: 120000, restaurants: 35, conversion: 15.2 },
  { day: "Sat", orders: 520, revenue: 140000, restaurants: 38, conversion: 16.8 },
  { day: "Sun", rules: 420, revenue: 110000, restaurants: 33, conversion: 14.5 },
]

const topPerformingRestaurants = [
  { name: "Karachi Food Corner", orders: 845, revenue: 285000, rating: 4.8, growth: 18 },
  { name: "Lahore BBQ House", orders: 720, revenue: 245000, rating: 4.7, growth: 15 },
  { name: "Islamabad Biryani", orders: 650, revenue: 220000, rating: 4.6, growth: 12 },
  { name: "Peshawar Charsi", orders: 580, revenue: 195000, rating: 4.5, growth: 10 },
  { name: "Multan Taste", orders: 520, revenue: 175000, rating: 4.4, growth: 8 },
  { name: "Faisalabad Desi", orders: 480, revenue: 165000, rating: 4.3, growth: 6 },
]

const platformStats = [
  { category: "Active Restaurants", value: 38, change: "+12%", color: "text-blue-600" },
  { category: "Total Revenue", value: "PKR 6.2M", change: "+24%", color: "text-green-600" },
  { category: "Monthly Orders", value: "3,300", change: "+18%", color: "text-purple-600" },
  { category: "New Customers", value: "2,400", change: "+32%", color: "text-orange-600" },
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280']

export default function Analytics() {
  const [location, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [activeChart, setActiveChart] = useState<'revenue' | 'orders' | 'performance' | 'restaurants'>('revenue')
  const [timeRange, setTimeRange] = useState('12months')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        const slug = userData.restaurantSlug || 'vendor';
        setLocation(`/${slug}/dashboard`)
      } else {
        setUser(userData)
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
    { id: 'performance', label: 'Platform Performance', icon: Activity, color: 'bg-purple-500' },
    { id: 'restaurants', label: 'Top Restaurants', icon: Store, color: 'bg-orange-500' },
  ]

  const renderChart = () => {
    switch (activeChart) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={adminAnalyticsData}>
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
                formatter={(value: any) => [`PKR ${value.toLocaleString()}`, 'Platform Revenue']}
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
            <LineChart data={adminAnalyticsData}>
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
                formatter={(value: any) => [value, 'Total Orders']}
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
                  name === 'revenue' ? 'Daily Revenue' : 'Daily Orders'
                ]}
              />
              <Bar yAxisId="left" dataKey="orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} dot={{ fill: "#F59E0B", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )
      
      case 'restaurants':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topPerformingRestaurants}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, orders }) => `${name} (${orders})`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="orders"
                >
                  {topPerformingRestaurants.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Top Performing Restaurants</h3>
              {topPerformingRestaurants.map((restaurant, index) => (
                <div key={restaurant.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <span className="font-medium text-sm">{restaurant.name}</span>
                      <div className="text-xs text-gray-500">⭐ {restaurant.rating}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">PKR {restaurant.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">{restaurant.orders} orders</div>
                    <div className="text-xs text-green-600">↗ {restaurant.growth}%</div>
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
              Platform Analytics 📊
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Admin Dashboard • Multi-Restaurant Performance
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Platform Performance</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive analytics across all restaurants</p>
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
                    Multi-restaurant data visualization
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
                  <h3 className="text-2xl font-bold">PKR 750K</h3>
                  <p className="text-blue-100 text-xs mt-1">Platform Revenue</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-400">
                <div className="flex items-center text-blue-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+24% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Total Orders</p>
                  <h3 className="text-2xl font-bold">3,300</h3>
                  <p className="text-emerald-100 text-xs mt-1">This Month</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-emerald-400">
                <div className="flex items-center text-emerald-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+18% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Active Restaurants</p>
                  <h3 className="text-2xl font-bold">38</h3>
                  <p className="text-purple-100 text-xs mt-1">Restaurants On Platform</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-400">
                <div className="flex items-center text-purple-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+12% growth rate</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">New Customers</p>
                  <h3 className="text-2xl font-bold">2,400</h3>
                  <p className="text-orange-100 text-xs mt-1">This Month</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-400">
                <div className="flex items-center text-orange-100">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="text-sm">+32% new signups</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}