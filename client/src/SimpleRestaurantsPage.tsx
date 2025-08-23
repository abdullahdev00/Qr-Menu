import React from 'react';

interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  city: string;
  status: string;
}

export default function SimpleRestaurantsPage() {
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log('🔄 Loading restaurants...');
    
    fetch('/api/restaurants')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Restaurant[]) => {
        console.log('✅ Restaurants loaded:', data.length);
        setRestaurants(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error loading restaurants:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        minHeight: '100vh',
        fontFamily: 'Arial'
      }}>
        <h1>🔄 Loading Restaurants...</h1>
        <div style={{ fontSize: '18px', marginTop: '20px' }}>
          Please wait while we fetch your restaurant data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px',
        background: '#fee2e2',
        color: '#dc2626',
        minHeight: '100vh',
        fontFamily: 'Arial'
      }}>
        <h1>❌ Error Loading Restaurants</h1>
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            padding: '10px 20px', 
            background: '#dc2626', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial'
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h1>🏪 Restaurants Management</h1>
        <p>Total restaurants: <strong>{restaurants.length}</strong></p>
      </div>

      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' 
      }}>
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>
              {restaurant.name}
            </h3>
            
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Owner:</strong> {restaurant.ownerName}</p>
              <p><strong>Email:</strong> {restaurant.ownerEmail}</p>
              <p><strong>City:</strong> {restaurant.city || 'Not specified'}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  background: restaurant.status === 'active' ? '#10b981' : '#ef4444',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {restaurant.status.toUpperCase()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '40px',
        padding: '20px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h3>✅ Working Perfectly!</h3>
        <p>Restaurant data is loading correctly from database</p>
        <p>API endpoints are working properly</p>
        <p>Ready to switch back to full admin panel</p>
      </div>
    </div>
  );
}