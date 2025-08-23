import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/layout/main-layout'
import TicketItem from '../components/support/ticket-item'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Support() {
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

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['/api/support-tickets'],
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
          <h1 className="text-3xl font-bold" data-testid="text-support-title">
            Support Tickets
          </h1>
          <p className="text-muted-foreground">
            Manage customer support requests and tickets
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(tickets) && tickets.map((ticket: any) => (
              <TicketItem key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}