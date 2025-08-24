import React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/layout/main-layout'
import TemplateCard from '../components/templates/template-card'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function MenuTemplates() {
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

  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/menu-templates'],
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-templates-title">
            Menu Templates
          </h1>
          <p className="text-muted-foreground">
            Pre-designed menu templates for restaurants
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(templates) && templates.map((template: any) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}