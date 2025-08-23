import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import MainLayout from '../components/layout/main-layout'
import RestaurantTable from '../components/restaurants/restaurant-table'
import RestaurantForm from '../components/restaurants/restaurant-form'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function Restaurants() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      router.push('/login')
    }
  }, [router])

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['/api/restaurants'],
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-restaurants-title">
              Restaurants
            </h1>
            <p className="text-muted-foreground">
              Manage restaurant partners and their information
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-restaurant">
                <Plus className="mr-2 h-4 w-4" />
                Add Restaurant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Restaurant</DialogTitle>
              </DialogHeader>
              <RestaurantForm onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        ) : (
          <RestaurantTable restaurants={Array.isArray(restaurants) ? restaurants : []} />
        )}
      </div>
    </MainLayout>
  )
}