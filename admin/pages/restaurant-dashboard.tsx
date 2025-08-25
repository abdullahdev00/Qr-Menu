import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { 
  Store, 
  QrCode, 
  TrendingUp, 
  Users, 
  Eye,
  Plus,
  BarChart3,
  Settings,
  CreditCard,
  Phone,
  Star,
  Clock,
  ChefHat
} from 'lucide-react'

interface RestaurantUser {
  id: string
  name: string
  email: string
  role: string
  restaurantId: string
  restaurantName: string
}

export default function RestaurantDashboard() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<RestaurantUser | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setUser(userData)
      } else {
        setLocation('/dashboard') // Redirect admin users to admin dashboard
      }
    } else {
      setLocation('/login')
    }
  }, [])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {user.restaurantName} • Restaurant Dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Menu Items */}
        <div className="bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
              45/100
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">45</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Menu Items</p>
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
            +3 added this week
          </div>
        </div>

        {/* QR Scans */}
        <div className="bg-gradient-to-br from-white to-green-50/50 dark:from-gray-900 dark:to-green-950/30 rounded-xl p-6 border border-green-200/50 dark:border-green-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-full">
              +18%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">1,234</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">QR Code Scans</p>
          <div className="mt-2 text-xs text-green-600 dark:text-green-400">
            This month
          </div>
        </div>

        {/* Popular Item */}
        <div className="bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full">
              HOT
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Chicken Biryani</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Most Popular</p>
          <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
            234 views today
          </div>
        </div>

        {/* Plan Status */}
        <div className="bg-gradient-to-br from-white to-orange-50/50 dark:from-gray-900 dark:to-orange-950/30 rounded-xl p-6 border border-orange-200/50 dark:border-orange-800/30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-full">
              ACTIVE
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pro Plan</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Subscription</p>
          <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
            Renews: March 15
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Add Menu Item</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <QrCode className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Generate QR</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">View Analytics</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Settings</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Customer Feedback</span>
              </button>
              
              <button className="flex flex-col items-center p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center">Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">New menu item added</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">QR code downloaded</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">Customer feedback received</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">Menu viewed 45 times</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart Section */}
      <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Menu Performance</h3>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
        </div>
        
        {/* Placeholder for chart - you can add recharts here later */}
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg flex items-center justify-center border border-blue-200/50 dark:border-blue-800/30">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Analytics chart will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  )
}