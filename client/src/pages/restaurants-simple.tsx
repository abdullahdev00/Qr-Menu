import { useQuery } from "@tanstack/react-query";
import { type Restaurant } from "@shared/schema";

export default function RestaurantsSimple() {
  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  if (isLoading) {
    return <div className="p-8">Loading restaurants...</div>;
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6">Restaurants ({restaurants?.length || 0})</h1>
      
      {!restaurants || restaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No restaurants found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Owner: {restaurant.ownerName} | Email: {restaurant.ownerEmail}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    City: {restaurant.city || 'Not specified'} | Status: {restaurant.status}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    restaurant.status === 'active' ? 'bg-green-100 text-green-700' : 
                    restaurant.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {restaurant.status.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}