import React from 'react'
import { Button } from '../ui/button'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../ui/card'
import { UserPlus, LogIn, Phone, Shield, Clock } from 'lucide-react'

interface AuthSelectorProps {
  onLogin: () => void
  onRegister: () => void
}

export function AuthSelector({ onLogin, onRegister }: AuthSelectorProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription className="text-base">
            Sign in or create an account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={onLogin} 
            className="w-full h-12 text-base"
            data-testid="button-choose-login"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign In
          </Button>
          <Button 
            onClick={onRegister} 
            variant="outline" 
            className="w-full h-12 text-base"
            data-testid="button-choose-register"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Create New Account
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-center text-muted-foreground">
          Why create an account?
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-muted-foreground">Secure phone-based authentication</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-muted-foreground">Save your preferences and order history</span>
          </div>
        </div>
      </div>
    </div>
  )
}