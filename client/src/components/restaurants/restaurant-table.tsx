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
        return <Badge className="bg-success text-white">Active</Badge>;
      case "suspended":
        return <Badge className="bg-warning text-white">Suspended</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (planId: string | null) => {
    // This would be enhanced with actual plan data
    return <Badge variant="outline">Premium</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead>Restaurant</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedRestaurants.map((restaurant) => (
              <TableRow 
                key={restaurant.id} 
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                data-testid={`restaurant-row-${restaurant.id}`}
              >
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mr-3">
                      <Store className="w-5 h-5 text-primary-600" />
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
                      className="text-primary-600 hover:text-primary-700"
                      data-testid={`button-view-${restaurant.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-secondary-600 hover:text-secondary-700"
                      data-testid={`button-edit-${restaurant.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(restaurant)}
                      className="text-warning hover:text-yellow-700"
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
                      className="text-error hover:text-red-700"
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
