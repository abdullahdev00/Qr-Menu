import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PlanCard from "@/components/subscriptions/plan-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { type SubscriptionPlan, type Payment } from "@shared/schema";

export default function Subscriptions() {
  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  return (
    <div className="space-y-8">
      {/* Subscription Plans */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Subscription Plans
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage pricing plans for restaurant subscriptions
          </p>
        </div>

        {plansLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans?.map((plan: any, index: number) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                isPopular={index === 1} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm" data-testid="button-export-transactions">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paymentsLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.slice(0, 10).map((payment: any) => (
                    <TableRow key={payment.id} data-testid={`payment-row-${payment.id}`}>
                      <TableCell className="font-medium">
                        Restaurant {payment.restaurantId?.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Plan {payment.planId?.slice(-4)}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        PKR {parseFloat(payment.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.paymentMethod?.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            payment.status === "paid" 
                              ? "bg-success text-white" 
                              : payment.status === "pending"
                              ? "bg-warning text-white"
                              : "bg-error text-white"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
