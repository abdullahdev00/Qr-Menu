import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, CreditCard, Headphones, QrCode } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "restaurant",
    title: "New restaurant registered",
    description: "Karachi Food Corner - Basic Plan",
    time: "2 minutes ago",
    icon: Store,
    iconColor: "bg-primary-100 dark:bg-primary-900/20 text-primary-600",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment received",
    description: "PKR 2,500 - Premium Plan",
    time: "1 hour ago",
    icon: CreditCard,
    iconColor: "bg-secondary-100 dark:bg-secondary-900/20 text-secondary-600",
  },
  {
    id: 3,
    type: "support",
    title: "Support ticket closed",
    description: "QR Code Generation Issue",
    time: "3 hours ago",
    icon: Headphones,
    iconColor: "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600",
  },
  {
    id: 4,
    type: "qr",
    title: "QR code generated",
    description: "Lahore Desi Restaurant",
    time: "5 hours ago",
    icon: QrCode,
    iconColor: "bg-green-100 dark:bg-green-900/20 text-green-600",
  },
];

export default function RecentActivity() {
  return (
    <Card data-testid="recent-activity">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.iconColor}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white font-medium">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
