import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  UserCog, 
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface Restaurant {
  id: string
  name: string
  ownerName: string
  status: 'active' | 'inactive' | 'suspended'
  planName?: string
}

interface AdminControlsProps {
  restaurant: Restaurant
  onEdit: () => void
  onDelete: () => void
  onStatusChange: (status: string) => void
}

export default function AdminControls({ 
  restaurant, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: AdminControlsProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusToggle = async () => {
    setIsUpdating(true)
    const newStatus = restaurant.status === 'active' ? 'suspended' : 'active'
    
    try {
      onStatusChange(newStatus)
      toast({
        title: "Status Updated",
        description: `Restaurant ${newStatus === 'active' ? 'activated' : 'suspended'} successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update restaurant status.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'suspended':
        return <AlertTriangle className="w-4 h-4" />
      case 'inactive':
        return <Lock className="w-4 h-4" />
      default:
        return <Settings className="w-4 h-4" />
    }
  }

  return (
    <Card className="border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/50 to-red-50/30 dark:from-orange-950/30 dark:to-red-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-2">
            <UserCog className="w-4 h-4 text-orange-600" />
            <span>Admin Controls</span>
          </span>
          <Badge className={getStatusColor(restaurant.status)}>
            <span className="flex items-center space-x-1">
              {getStatusIcon(restaurant.status)}
              <span className="capitalize">{restaurant.status}</span>
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="text-xs"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleStatusToggle}
            disabled={isUpdating}
            className={`text-xs ${
              restaurant.status === 'active' 
                ? 'text-red-600 hover:text-red-700' 
                : 'text-green-600 hover:text-green-700'
            }`}
          >
            {restaurant.status === 'active' ? (
              <>
                <Lock className="w-3 h-3 mr-1" />
                Suspend
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 mr-1" />
                Activate
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Analytics
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete Restaurant
          </Button>
        </div>
        
        <div className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t">
          <p>Owner: {restaurant.ownerName}</p>
          {restaurant.planName && (
            <p>Plan: {restaurant.planName}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}