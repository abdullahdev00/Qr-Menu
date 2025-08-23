import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/layout/main-layout'
import QrGenerator from '../components/qr/qr-generator'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function QrCodes() {
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

  const { data: qrCodes, isLoading } = useQuery({
    queryKey: ['/api/qr-codes'],
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
          <h1 className="text-3xl font-bold" data-testid="text-qr-title">
            QR Code Generator
          </h1>
          <p className="text-muted-foreground">
            Generate and manage QR codes for restaurant menus
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <QrGenerator />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Generated QR Codes</h3>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(qrCodes) && qrCodes.map((qr: any) => (
                  <div key={qr.id} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{qr.restaurantName}</h4>
                    <p className="text-sm text-muted-foreground">{qr.url}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}