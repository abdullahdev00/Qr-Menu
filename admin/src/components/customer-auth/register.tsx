import React, { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { FormError } from '../../../components/ui/form-error'
import { useToast } from '../../../lib/use-toast'
import { Phone, User, Mail, ArrowLeft } from 'lucide-react'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp'

interface RegisterFormProps {
  onBack: () => void
  onSuccess: (user: any) => void
}

type Step = 'phone' | 'otp' | 'profile'

export function RegisterForm({ onBack, onSuccess }: RegisterFormProps) {
  const [step, setStep] = useState<Step>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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

  const validateProfile = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Name is required'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    return newErrors
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
          purpose: 'registration' 
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
          purpose: 'registration'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStep('profile')
        toast({
          title: 'Phone Verified!',
          description: 'Please complete your profile',
        })
      } else {
        setErrors({ otp: data.error || 'Invalid OTP' })
      }
    } catch (error) {
      setErrors({ otp: 'Failed to verify OTP. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const profileErrors = validateProfile()
    if (Object.keys(profileErrors).length > 0) {
      setErrors(profileErrors)
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

      const response = await fetch('/api/customer-auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: formattedPhone,
          name: name.trim(),
          email: email.trim() || null
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: 'Registration Complete!',
          description: 'Welcome! Your account has been created.',
        })
        onSuccess(data.user)
      } else {
        setErrors({ general: data.error || 'Failed to complete registration' })
      }
    } catch (error) {
      setErrors({ general: 'Failed to complete registration. Please try again.' })
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
          purpose: 'registration' 
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
            {step === 'phone' && 'Create Account'}
            {step === 'otp' && 'Verify Phone'}
            {step === 'profile' && 'Complete Profile'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.general && (
          <FormError message={errors.general} />
        )}

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
                  data-testid="input-phone"
                />
              </div>
              {errors.phone && <FormError message={errors.phone} />}
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-send-otp"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
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
                  data-testid="input-otp"
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
              data-testid="button-verify-otp"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleResendOtp}
              disabled={isLoading}
              data-testid="button-resend-otp"
            >
              Resend Code
            </Button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  data-testid="input-name"
                />
              </div>
              {errors.name && <FormError message={errors.name} />}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  data-testid="input-email"
                />
              </div>
              {errors.email && <FormError message={errors.email} />}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
              data-testid="button-complete-profile"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}