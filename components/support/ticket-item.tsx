import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type SupportTicket } from "@shared/schema";
import { Store, Mail, Clock, User } from "lucide-react";

interface TicketItemProps {
  ticket: SupportTicket;
}

export default function TicketItem({ ticket }: TicketItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupportTicket> }) =>
      apiRequest("PUT", `/api/support-tickets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      toast({
        title: "Ticket updated",
        description: "Support ticket has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update support ticket.",
        variant: "destructive",
      });
    },
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "medium":
        return <Badge className="bg-blue-100 text-blue-800">Medium Priority</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-gray-100 text-gray-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAssign = () => {
    updateTicketMutation.mutate({
      id: ticket.id,
      data: { status: "in_progress" },
    });
  };

  const handleResolve = () => {
    updateTicketMutation.mutate({
      id: ticket.id,
      data: { status: "resolved" },
    });
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const ticketDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - ticketDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div 
      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      data-testid={`ticket-item-${ticket.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              #{ticket.id.slice(-6)}
            </span>
            {getPriorityBadge(ticket.priority)}
            {getStatusBadge(ticket.status)}
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {ticket.subject}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {ticket.description}
          </p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            {ticket.restaurantId && (
              <span className="flex items-center">
                <Store className="w-4 h-4 mr-1" />
                Restaurant {ticket.restaurantId.slice(-4)}
              </span>
            )}
            <span className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              support@example.com
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatTimeAgo(ticket.createdAt!)}
            </span>
            {ticket.assignedTo && (
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                Assigned
              </span>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            data-testid={`button-view-ticket-${ticket.id}`}
          >
            View
          </Button>
          
          {ticket.status === "open" && (
            <Button
              onClick={handleAssign}
              disabled={updateTicketMutation.isPending}
              size="sm"
              data-testid={`button-assign-ticket-${ticket.id}`}
            >
              Assign
            </Button>
          )}
          
          {ticket.status === "in_progress" && (
            <Button
              onClick={handleResolve}
              disabled={updateTicketMutation.isPending}
              variant="secondary"
              size="sm"
              data-testid={`button-resolve-ticket-${ticket.id}`}
            >
              Resolve
            </Button>
          )}
          
          {ticket.status === "resolved" && (
            <Button
              variant="ghost"
              size="sm"
              disabled
              data-testid={`button-resolved-ticket-${ticket.id}`}
            >
              Resolved
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
