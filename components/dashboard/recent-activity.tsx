import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store, CreditCard, Headphones, QrCode, UserPlus, TrendingUp, AlertCircle, CheckCircle2, Clock, MoreVertical } from "lucide-react";

const recentActivities = [
  {
    id: 1,
    type: "restaurant",
    title: "New Restaurant Registered",
    description: "Karachi Food Corner joined with Basic Plan",
    details: "Owner: Ahmad Khan • Phone: +92-300-1234567",
    time: "2 minutes ago",
    timestamp: "6:30 AM",
    icon: Store,
    iconColor: "bg-gradient-to-br from-blue-400 to-blue-600",
    textColor: "text-white",
    status: "new",
    priority: "high",
    amount: "PKR 1,500"
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Received",
    description: "Premium Plan subscription renewed",
    details: "Restaurant: Lahore BBQ House • Method: JazzCash",
    time: "1 hour ago",
    timestamp: "5:30 AM",
    icon: CreditCard,
    iconColor: "bg-gradient-to-br from-green-400 to-green-600",
    textColor: "text-white",
    status: "completed",
    priority: "medium",
    amount: "PKR 3,500"
  },
  {
    id: 3,
    type: "signup",
    title: "New User Signup",
    description: "Support agent joined the platform",
    details: "Role: Support Agent • Department: Customer Care",
    time: "2 hours ago",
    timestamp: "4:30 AM",
    icon: UserPlus,
    iconColor: "bg-gradient-to-br from-purple-400 to-purple-600",
    textColor: "text-white",
    status: "active",
    priority: "low"
  },
  {
    id: 4,
    type: "support",
    title: "Support Ticket Resolved",
    description: "QR Code generation issue fixed",
    details: "Ticket #QR-2024-001 • Time taken: 45 minutes",
    time: "3 hours ago",
    timestamp: "3:30 AM",
    icon: CheckCircle2,
    iconColor: "bg-gradient-to-br from-teal-400 to-teal-600",
    textColor: "text-white",
    status: "resolved",
    priority: "high"
  },
  {
    id: 5,
    type: "qr",
    title: "QR Code Generated",
    description: "Custom QR code created successfully",
    details: "Restaurant: Islamabad Food Street • Style: Modern",
    time: "4 hours ago",
    timestamp: "2:30 AM",
    icon: QrCode,
    iconColor: "bg-gradient-to-br from-orange-400 to-orange-600",
    textColor: "text-white",
    status: "completed",
    priority: "medium"
  },
  {
    id: 6,
    type: "alert",
    title: "System Alert",
    description: "High server load detected",
    details: "CPU: 85% • Memory: 78% • Response time: 450ms",
    time: "5 hours ago",
    timestamp: "1:30 AM",
    icon: AlertCircle,
    iconColor: "bg-gradient-to-br from-red-400 to-red-600",
    textColor: "text-white",
    status: "monitoring",
    priority: "critical"
  },
  {
    id: 7,
    type: "revenue",
    title: "Revenue Milestone",
    description: "Monthly target achieved early",
    details: "Target: PKR 500K • Achieved: PKR 525K • 105% completion",
    time: "6 hours ago",
    timestamp: "12:30 AM",
    icon: TrendingUp,
    iconColor: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    textColor: "text-white",
    status: "achieved",
    priority: "high",
    amount: "PKR 525,000"
  },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    new: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", text: "New" },
    completed: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", text: "Completed" },
    active: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", text: "Active" },
    resolved: { color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300", text: "Resolved" },
    monitoring: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", text: "Monitoring" },
    achieved: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", text: "Achieved" },
  };
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'critical': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
};

export default function RecentActivity() {
  const [showAll, setShowAll] = useState(false);
  const displayedActivities = showAll ? recentActivities : recentActivities.slice(0, 5);

  return (
    <Card data-testid="recent-activity" className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Recent Activity
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {recentActivities.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => (
              <div 
                key={activity.id} 
                className="group relative bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all duration-200 hover:border-primary/20 hover:bg-gradient-to-r hover:from-white hover:to-blue-50/30 dark:hover:to-blue-900/10"
                data-testid={`activity-item-${activity.id}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.iconColor} ${activity.textColor} shadow-lg`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {activity.title}
                        </h4>
                        <span className="text-xs opacity-60">
                          {getPriorityIcon(activity.priority)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.amount && (
                          <Badge variant="outline" className="text-xs font-mono bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700">
                            {activity.amount}
                          </Badge>
                        )}
                        <Badge className={`text-xs ${getStatusBadge(activity.status).color}`}>
                          {getStatusBadge(activity.status).text}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {activity.details}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                        <span className="mx-1">•</span>
                        <span>{activity.timestamp}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-activity-options-${activity.id}`}
                      >
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {index < displayedActivities.length - 1 && (
                  <div className="absolute left-6 bottom-0 w-px h-4 bg-gradient-to-b from-gray-200 to-transparent dark:from-gray-700"></div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        {recentActivities.length > 5 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
              data-testid="button-toggle-activities"
            >
              {showAll ? 'Show Less' : `Show All (${recentActivities.length - 5} more)`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
