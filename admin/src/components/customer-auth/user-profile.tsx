import React, { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { FormError } from '../../../components/ui/form-error'
import { useToast } from '../../../lib/use-toast'
import { User, Phone, Mail, LogOut, Edit2, Check, X } from 'lucide-react'
import { Separator } from '../../../components/ui/separator'

interface CustomerUser {
  id: string
  phoneNumber: string
  name?: string
  email?: string
  isPhoneVerified: boolean
}

interface UserProfileProps {
  user: CustomerUser
  onLogout: () => void
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email || '')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validateProfile = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    return newErrors
  }

  const handleSave = async () => {
    const profileErrors = validateProfile()
    if (Object.keys(profileErrors).length > 0) {
      setErrors(profileErrors)
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await fetch('/api/customer-auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: user.phoneNumber,
          name: name.trim(),
          email: email.trim() || null
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Profile Updated!',
          description: 'Your information has been saved.',
        })
        setIsEditing(false)
        // In a real app, you'd update the user state here
      } else {
        setErrors({ general: data.error || 'Failed to update profile' })
      }
    } catch (error) {
      setErrors({ general: 'Failed to update profile. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(user.name || '')
    setEmail(user.email || '')
    setErrors({})
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.general && (
            <FormError message={errors.general} />
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-sm text-muted-foreground">{user.phoneNumber}</p>
                {user.isPhoneVerified && (
                  <p className="text-xs text-green-600 dark:text-green-400">✓ Verified</p>
                )}
              </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Personal Information</h3>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    data-testid="button-edit-profile"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      data-testid="input-edit-name"
                    />
                    {errors.name && <FormError message={errors.name} />}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email (Optional)</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-edit-email"
                    />
                    {errors.email && <FormError message={errors.email} />}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave}
                      disabled={isLoading}
                      data-testid="button-save-profile"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isLoading}
                      data-testid="button-cancel-edit"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Name</p>
                      <p className="text-sm text-muted-foreground">
                        {user.name || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={onLogout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}