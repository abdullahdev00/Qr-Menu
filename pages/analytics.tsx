import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import Charts from '../components/analytics/charts'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Analytics() {
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

        <Charts />
      </div>
  )
}