import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Edit } from "lucide-react";
import { type SubscriptionPlan } from "@shared/schema";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
}

export default function PlanCard({ plan, isPopular }: PlanCardProps) {
  const features = Array.isArray(plan.features) ? plan.features : [];
  
  return (
    <Card 
      className={`relative ${isPopular ? "border-2 border-primary" : ""}`}
      data-testid={`plan-card-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-white">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {plan.name}
          </h3>
          <Button variant="ghost" size="sm" data-testid={`button-edit-plan-${plan.id}`}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
        <div className="mb-4">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {plan.currency} {parseFloat(plan.price).toLocaleString()}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/month</span>
        </div>
      </CardHeader>
      
      <CardContent>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          {features.map((feature: string, index: number) => (
            <li key={index} className="flex items-center">
              <Check className="w-4 h-4 text-success mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
          {plan.maxMenuItems && (
            <li className="flex items-center">
              <Check className="w-4 h-4 text-success mr-2 flex-shrink-0" />
              Up to {plan.maxMenuItems} menu items
            </li>
          )}
          {!plan.maxMenuItems && (
            <li className="flex items-center">
              <Check className="w-4 h-4 text-success mr-2 flex-shrink-0" />
              Unlimited menu items
            </li>
          )}
        </ul>
        
        <div className="flex justify-between text-sm mb-4">
          <span className="text-gray-500 dark:text-gray-400">Active subscribers:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.floor(Math.random() * 100) + 10}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Duration:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {plan.duration} days
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
