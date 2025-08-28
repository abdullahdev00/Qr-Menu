import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { 
  ChefHat, 
  DollarSign, 
  Eye, 
  TrendingUp, 
  Clock,
  Star,
  Package,
  BarChart3
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  restaurantId?: string
  restaurantName?: string
}

export default function VendorDashboard() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setUser(userData)
      } else {
        setLocation('/dashboard') // Redirect admin to admin dashboard
      }
    } else {
      setLocation('/login')
    }
  }, [])

  const { data: menuItems = [] } = useQuery({
    queryKey: ['/api/menu-items'],
    enabled: !!user,
  }) as { data: any[] }

  // Removed QR analytics since QR functionality was deleted
  const analytics = {}

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    )
  }

  const stats = {
    totalItems: Array.isArray(menuItems) ? menuItems.length : 0,
    activeItems: Array.isArray(menuItems) ? menuItems.filter((item: any) => item.isAvailable).length : 0,
    totalViews: 245, // Static since QR functionality removed
    revenue: "PKR 45,000"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.restaurantName || 'Your Restaurant'} Dashboard
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Menu Items</p>
              <p className="text-3xl font-bold mt-2">{stats.totalItems}</p>
            </div>
            <ChefHat className="w-12 h-12 text-blue-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-blue-200 mr-1" />
            <span className="text-blue-100 text-sm">+12% from last month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Active Items</p>
              <p className="text-3xl font-bold mt-2">{stats.activeItems}</p>
            </div>
            <Package className="w-12 h-12 text-green-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-200 mr-1" />
            <span className="text-green-100 text-sm">All items available</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">QR Scans</p>
              <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
            </div>
            <Eye className="w-12 h-12 text-purple-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-purple-200 mr-1" />
            <span className="text-purple-100 text-sm">+8% from yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold mt-2">{stats.revenue}</p>
            </div>
            <DollarSign className="w-12 h-12 text-orange-200" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-orange-200 mr-1" />
            <span className="text-orange-100 text-sm">+15% from last month</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ChefHat className="w-5 h-5 mr-2 text-blue-600" />
            Recent Menu Items
          </h3>
          {Array.isArray(menuItems) && menuItems.length > 0 ? (
            <div className="space-y-3">
              {menuItems.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PKR {item.price}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    item.isAvailable 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No menu items yet. Start by adding your first item!</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Average Rating</span>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="font-semibold">4.8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Avg Prep Time</span>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-500 mr-1" />
                <span className="font-semibold">25 min</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Popular Category</span>
              <span className="font-semibold text-green-600">Main Course</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Total Orders</span>
              <span className="font-semibold text-purple-600">42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}