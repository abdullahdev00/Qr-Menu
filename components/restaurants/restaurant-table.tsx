import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/lib/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Restaurant } from "@shared/schema";
import { 
  Store, Eye, Edit, Pause, Play, Trash2, MessageSquare, 
  RefreshCw, BarChart3, Phone, Mail, MapPin,
  MoreHorizontal, Clock
} from "lucide-react";

interface RestaurantTableProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  statusFilter: string;
  planFilter: string;
  selectedRestaurants: string[];
  onSelectRestaurant: (ids: string[]) => void;
  onSelectAll: () => void;
  onOpenDetail: (restaurant: Restaurant) => void;
}

export default function RestaurantTable({ 
  restaurants, 
  isLoading, 
  statusFilter, 
  planFilter,
  selectedRestaurants,
  onSelectRestaurant,
  onSelectAll,
  onOpenDetail
}: RestaurantTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const deleteRestaurantMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/restaurants/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Restaurant deleted",
        description: "Restaurant has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete restaurant.",
        variant: "destructive",
      });
    },
  });

  const updateRestaurantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Restaurant> }) =>
      apiRequest("PUT", `/api/restaurants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Restaurant updated",
        description: "Restaurant status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update restaurant.",
        variant: "destructive",
      });
    },
  });

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (statusFilter && restaurant.status !== statusFilter) return false;
    // Note: planFilter would need to be implemented with plan data
    return true;
  });

  // Paginate results
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRestaurants = filteredRestaurants.slice(startIndex, startIndex + itemsPerPage);

  const handleToggleStatus = (restaurant: Restaurant) => {
    const newStatus = restaurant.status === "active" ? "suspended" : "active";
    updateRestaurantMutation.mutate({
      id: restaurant.id,
      data: { status: newStatus },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this restaurant?")) {
      deleteRestaurantMutation.mutate(id);
    }
  };

  const handleSelectRestaurant = (restaurantId: string, checked: boolean) => {
    if (checked) {
      onSelectRestaurant([...selectedRestaurants, restaurantId]);
    } else {
      onSelectRestaurant(selectedRestaurants.filter(id => id !== restaurantId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg border-0 px-3 py-1 font-medium">Active</Badge>;
      case "suspended":
        return <Badge className="bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg border-0 px-3 py-1 font-medium">Suspended</Badge>;
      case "inactive":
        return <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg border-0 px-3 py-1 font-medium">Inactive</Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg border-0 px-3 py-1 font-medium">{status}</Badge>;
    }
  };

  const getPlanBadge = (planId: string | null) => {
    // This would be enhanced with actual plan data
    return <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg border-0 px-3 py-1 font-medium">Premium</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => {
            const colors = [
              'bg-gradient-to-r from-blue-200 to-purple-200',
              'bg-gradient-to-r from-green-200 to-teal-200',
              'bg-gradient-to-r from-orange-200 to-pink-200',
              'bg-gradient-to-r from-purple-200 to-indigo-200',
              'bg-gradient-to-r from-yellow-200 to-orange-200'
            ];
            return (
              <div key={i} className={`h-16 ${colors[i]} dark:from-gray-600 dark:to-gray-700 rounded-xl shadow-lg`}></div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-gradient-to-r from-blue-100 to-purple-100 dark:border-gray-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-100 via-purple-50 to-pink-100 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 border-b-2 border-blue-200">
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedRestaurants.length === restaurants.length && restaurants.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all restaurants"
                />
              </TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Restaurant Info</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Subscription</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Performance</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Location</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRestaurants.map((restaurant) => (
              <TableRow 
                key={restaurant.id} 
                className="hover:bg-gradient-to-r hover:from-blue-50/70 hover:via-purple-50/70 hover:to-pink-50/70 dark:hover:from-gray-800 dark:hover:to-gray-750 transition-all duration-300 border-b border-gray-100 dark:border-gray-700 hover:shadow-lg"
                data-testid={`restaurant-row-${restaurant.id}`}
              >
                <TableCell>
                  <Checkbox 
                    checked={selectedRestaurants.includes(restaurant.id)}
                    onCheckedChange={(checked) => handleSelectRestaurant(restaurant.id, checked as boolean)}
                    aria-label={`Select ${restaurant.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">{restaurant.name[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{restaurant.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{restaurant.ownerName}</div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {restaurant.ownerEmail}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getPlanBadge(restaurant.planId)}
                    {getStatusBadge(restaurant.status)}
                    <div className="text-xs text-gray-500">Next billing: 15 Jan</div>
                    <div className="text-xs font-medium text-green-600">₨15,000 revenue</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">45/100 menu items</div>
                    <div className="text-xs text-gray-500">1,234 monthly scans</div>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Active 2h ago
                    </div>
                    <div className="text-xs text-blue-600">Top: Biryani Special</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{restaurant.city || 'Karachi'}</div>
                    <div className="text-sm text-gray-500">DHA Phase 2</div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {restaurant.address || 'Address not provided'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenDetail(restaurant)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="View Details"
                      data-testid={`button-view-${restaurant.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Edit Restaurant"
                      data-testid={`button-edit-${restaurant.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(restaurant)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      title={restaurant.status === 'active' ? 'Suspend' : 'Activate'}
                      data-testid={`button-toggle-${restaurant.id}`}
                    >
                      {restaurant.status === "active" ? 
                        <Pause className="w-4 h-4" /> : 
                        <Play className="w-4 h-4" />
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      title="Send Message"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRestaurants.length)} of {filteredRestaurants.length} restaurants
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            data-testid="button-previous-page"
          >
            Previous
          </Button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                data-testid={`button-page-${page}`}
              >
                {page}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            data-testid="button-next-page"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
