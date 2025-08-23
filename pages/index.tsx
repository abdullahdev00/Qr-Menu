import React from 'react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard on load (similar to original routing)
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">QR Menu Generator Admin Panel</h1>
        <p className="mt-2 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}