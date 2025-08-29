import React from 'react'
import { CustomerAuth } from '../src/components/customer-auth/customer-auth'

export default function CustomerAuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
            Customer Authentication System
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Complete phone-based authentication with OTP verification. Test the complete flow from registration to login and profile management.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <CustomerAuth />
        </div>
        
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">
              🧪 Testing Instructions
            </h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">📱 Phone Number Format:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">+923001234567</code> (International format)</li>
                  <li><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">03001234567</code> (Local format)</li>
                  <li><code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">0300 123 4567</code> (With spaces)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">🔢 OTP Testing:</h3>
                <p>In development mode, the OTP is displayed in the browser console. Check the Network tab or console logs for the verification code.</p>
              </div>
              
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">🔄 Test Flows:</h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>New Registration:</strong> Enter phone → Verify OTP → Complete profile</li>
                  <li><strong>Existing User Login:</strong> Enter registered phone → Verify OTP</li>
                  <li><strong>Profile Management:</strong> Edit name/email after authentication</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">🛠 Demo Data Available:</h3>
                <p>Pre-populated customers, restaurants, and menu items are available for testing the complete system.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}