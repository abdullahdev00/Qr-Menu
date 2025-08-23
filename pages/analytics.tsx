import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import MainLayout from '../components/layout/main-layout'
import Charts from '../components/analytics/charts'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Analytics() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/login')
    }
  }, [router])

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
          <h1 className="text-3xl font-bold" data-testid="text-analytics-title">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights for your restaurant network
          </p>
        </div>

        <Charts />
      </div>
    </MainLayout>
  )
}