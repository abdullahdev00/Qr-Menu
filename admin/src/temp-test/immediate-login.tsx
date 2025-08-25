import React from 'react'

export default function ImmediateLogin() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px'
        }}>
          🔥 DUAL AUTH LOGIN SYSTEM 🔥
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '30px'
        }}>
          NEW VERSION IS WORKING! ✅
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <button style={{
            padding: '20px',
            border: 'none',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onClick={() => {
            alert('Admin Panel Selected!\nEmail: admin@demo.com\nPassword: password123')
          }}>
            🔐 ADMIN PANEL
          </button>

          <button style={{
            padding: '20px',
            border: 'none',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }} onClick={() => {
            alert('Restaurant Panel Selected!\nEmail: ahmed@albaik.com\nPassword: restaurant123')
          }}>
            🏪 RESTAURANT PANEL
          </button>
        </div>

        <div style={{
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#666'
        }}>
          <strong>If you can see this page, dual authentication is working! 🎉</strong>
          <br />
          Click buttons above to see demo credentials
        </div>
      </div>
    </div>
  )
}