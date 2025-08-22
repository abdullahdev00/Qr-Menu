import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Restaurant } from "@shared/schema";
import { Store, Eye, Edit, Pause, Play, Trash2 } from "lucide-react";

interface RestaurantTableProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  statusFilter: string;
  planFilter: string;
}

export default function RestaurantTable({ 
  restaurants, 
  isLoading, 
  statusFilter, 
  planFilter 
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
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Restaurant</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Owner</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Plan</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Status</TableHead>
              <TableHead className="font-bold text-gray-700 dark:text-gray-200 py-4">Created</TableHead>
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
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {restaurant.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {restaurant.slug}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {restaurant.ownerName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {restaurant.ownerEmail}
                  </div>
                </TableCell>
                <TableCell>
                  {getPlanBadge(restaurant.planId)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(restaurant.status)}
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                  {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-600 hover:from-blue-200 hover:to-blue-300 hover:text-blue-700 rounded-xl p-2 transition-all duration-200 hover:scale-110 shadow-md"
                      data-testid={`button-view-${restaurant.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-gradient-to-r from-green-100 to-emerald-200 text-green-600 hover:from-green-200 hover:to-emerald-300 hover:text-green-700 rounded-xl p-2 transition-all duration-200 hover:scale-110 shadow-md"
                      data-testid={`button-edit-${restaurant.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(restaurant)}
                      className="bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-600 hover:from-yellow-200 hover:to-orange-300 hover:text-orange-700 rounded-xl p-2 transition-all duration-200 hover:scale-110 shadow-md"
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
                      onClick={() => handleDelete(restaurant.id)}
                      className="bg-gradient-to-r from-red-100 to-pink-200 text-red-600 hover:from-red-200 hover:to-pink-300 hover:text-red-700 rounded-xl p-2 transition-all duration-200 hover:scale-110 shadow-md"
                      data-testid={`button-delete-${restaurant.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
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
