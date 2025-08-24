import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/layout/main-layout'
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
      setUser(JSON.parse(storedUser))
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
    <MainLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user.name}! Here's what's happening with your restaurants.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <KpiCards metrics={metrics} />
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <RevenueChart />
          </div>
          <div className="col-span-3">
            <RecentActivity />
          </div>
        </div>
      </div>
    </MainLayout>
  )
}