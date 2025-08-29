import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { FormError } from '../ui/form-error'
import { useToast } from '../../lib/use-toast'
import { Phone, ArrowLeft } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'

interface LoginFormProps {
  onBack: () => void
  onSuccess: (user: any) => void
}

type Step = 'phone' | 'otp'

export function LoginForm({ onBack, onSuccess }: LoginFormProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const validatePhone = (phone: string) => {
    if (!phone) return 'Phone number is required'
    if (!/^(\+92|0)?3[0-9]{9}$/.test(phone.replace(/\s+/g, ''))) {
      return 'Please enter a valid Pakistani mobile number'
    }
    return null
  }

  const validateOtp = (otp: string) => {
    if (!otp) return 'OTP is required'
    if (otp.length !== 6) return 'OTP must be 6 digits'
    return null
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const phoneError = validatePhone(phoneNumber)
    if (phoneError) {
      setErrors({ phone: phoneError })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const formattedPhone = phoneNumber.startsWith('+92') 
        ? phoneNumber 
        : phoneNumber.startsWith('0') 
          ? '+92' + phoneNumber.slice(1)
          : '+92' + phoneNumber

      const response = await fetch('/api/customer-auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone,
          purpose: 'login' 
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStep('otp')
        toast({
          title: 'OTP Sent!',
          description: `Verification code sent to ${formattedPhone}`,
        })
      } else {
        setErrors({ phone: data.error || 'Failed to send OTP' })
      }
    } catch (error) {
      setErrors({ phone: 'Failed to send OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpError = validateOtp(otp)
    if (otpError) {
      setErrors({ otp: otpError })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const formattedPhone = phoneNumber.startsWith('+92') 
        ? phoneNumber 
        : phoneNumber.startsWith('0') 
          ? '+92' + phoneNumber.slice(1)
          : '+92' + phoneNumber

      const response = await fetch('/api/customer-auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone,
          otp,
          purpose: 'login'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Login Successful!',
          description: 'Welcome back!',
        })
        onSuccess(data.user)
      } else {
        setErrors({ otp: data.error || 'Invalid OTP' })
      }
    } catch (error) {
      setErrors({ otp: 'Failed to verify OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setIsLoading(true)
    try {
      const formattedPhone = phoneNumber.startsWith('+92') 
        ? phoneNumber 
        : phoneNumber.startsWith('0') 
          ? '+92' + phoneNumber.slice(1)
          : '+92' + phoneNumber

      const response = await fetch('/api/customer-auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone,
          purpose: 'login' 
        })
      })

      if (response.ok) {
        toast({
          title: 'OTP Resent!',
          description: 'New verification code sent to your phone',
        })
        setOtp('')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend OTP',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-1 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">
            {step === 'phone' && 'Welcome Back'}
            {step === 'otp' && 'Enter Verification Code'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-9"
                  data-testid="input-phone-login"
                />
              </div>
              {errors.phone && <FormError message={errors.phone} />}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-send-login-otp"
            >
              {isLoading ? 'Sending...' : 'Send Login Code'}
            </Button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code sent to<br/>
                <span className="font-medium">{phoneNumber}</span>
              </p>
              <div className="flex justify-center">
                <InputOTP 
                  value={otp} 
                  onChange={setOtp} 
                  maxLength={6}
                  data-testid="input-login-otp"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errors.otp && <FormError message={errors.otp} />}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-verify-login-otp"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleResendOtp}
              disabled={isLoading}
              data-testid="button-resend-login-otp"
            >
              Resend Code
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}