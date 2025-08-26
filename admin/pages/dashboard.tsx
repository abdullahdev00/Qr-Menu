import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import KpiCards from '../components/dashboard/kpi-cards'
import RevenueChart from '../components/dashboard/revenue-chart'
import RecentActivity from '../components/dashboard/recent-activity'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Dashboard() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      if (userData.role === 'restaurant') {
        setLocation('/restaurant-dashboard') // Redirect restaurant users to their dashboard
      } else {
        setUser(userData)
      }
    } else {
      setLocation('/login')
    }
  }, [])

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
    enabled: !!user,
  })

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

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <KpiCards />
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <RevenueChart />
          </div>
          <div className="col-span-3">
            <RecentActivity />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid gap-4 grid-cols-1">
        <div className="col-span-1">
          <div className="bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 rounded-xl p-4 sm:p-6 shadow-lg border-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <button className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-center">Add Restaurant</span>
              </button>
              
              <button className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-center">Process Payment</span>
              </button>
              
              <button className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-center">User Management</span>
              </button>
              
              <button className="flex flex-col items-center p-3 sm:p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mb-2 sm:mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium text-center">View Reports</span>
              </button>
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                  Export Data
                </button>
                <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                  System Settings
                </button>
                <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                  Backup Data
                </button>
                <button className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center">
                  Send Notifications
                </button>
                <button 
                  onClick={() => window.open('/vendor/vendor.html', '_blank')}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-700 dark:to-blue-600 text-blue-700 dark:text-blue-200 rounded-lg hover:shadow-md transition-all duration-200 text-xs sm:text-sm font-medium text-center"
                  data-testid="vendor-dashboard-link"
                >
                  🍽️ Vendor Dashboard Demo
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
  )
}