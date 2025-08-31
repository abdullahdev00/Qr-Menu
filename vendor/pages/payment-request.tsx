import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Upload, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Smartphone,
  Building
} from "lucide-react";

interface PaymentRequestFormData {
  amount: string;
  paymentMethod: string;
  description: string;
  receiptImage: File | null;
}

export default function PaymentRequestPage() {
  const user = getCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<PaymentRequestFormData>({
    amount: "",
    paymentMethod: "",
    description: "",
    receiptImage: null
  });

  // Fetch restaurant data including plan and balance info
  const { data: restaurantData, isLoading: restaurantLoading } = useQuery({
    queryKey: ['/api/restaurants', user?.restaurantId],
    enabled: !!user?.restaurantId,
  });

  // Fetch subscription plans for upgrade options
  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['/api/subscription-plans'],
  });

  // Fetch payment requests history
  const { data: paymentRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/payment-requests', user?.restaurantId],
    enabled: !!user?.restaurantId,
  });

  // Create payment request mutation
  const createRequestMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/payment-requests', {
        method: 'POST',
        body: data,
      });
      if (!response.ok) throw new Error('Failed to create payment request');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Request Submitted! ✅",
        description: "Your payment request has been submitted successfully. We'll review it soon.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment-requests'] });
      setFormData({
        amount: "",
        paymentMethod: "",
        description: "",
        receiptImage: null
      });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed ❌", 
        description: error.message || "Failed to submit payment request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.paymentMethod || !formData.receiptImage) {
      toast({
        title: "Missing Information ⚠️",
        description: "Please fill all required fields and upload receipt",
        variant: "destructive",
      });
      return;
    }

    const submitData = new FormData();
    submitData.append('amount', formData.amount);
    submitData.append('paymentMethod', formData.paymentMethod);
    submitData.append('description', formData.description);
    submitData.append('restaurantId', user?.restaurantId || '');
    if (formData.receiptImage) {
      submitData.append('receiptImage', formData.receiptImage);
    }

    createRequestMutation.mutate(submitData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, receiptImage: e.target.files[0] });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please login to access payment requests</p>
        </div>
      </div>
    );
  }

  const currentPlan = subscriptionPlans?.find(plan => plan.id === restaurantData?.planId);
  const accountBalance = parseFloat(restaurantData?.accountBalance || "0");
  const planExpiryDate = restaurantData?.planExpiryDate ? new Date(restaurantData.planExpiryDate) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            💰 Payment Request Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Submit payment requests and manage your account balance
          </p>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Plan */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CreditCard className="w-8 h-8" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  ACTIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-bold">{currentPlan?.name || 'Basic Plan'}</h3>
              <p className="text-blue-100">Current Subscription</p>
              <div className="mt-2">
                <span className="text-sm text-blue-100">
                  PKR {currentPlan?.price || '0'}/month
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Account Balance */}
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Wallet className="w-8 h-8" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  BALANCE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-bold">PKR {accountBalance.toFixed(2)}</h3>
              <p className="text-green-100">Available Balance</p>
              <div className="mt-2">
                <span className="text-sm text-green-100">
                  {accountBalance > 0 ? '✅ Positive Balance' : '⚠️ Low Balance'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Plan Expiry */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Calendar className="w-8 h-8" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  EXPIRY
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold">
                {planExpiryDate ? planExpiryDate.toLocaleDateString() : 'No Expiry Set'}
              </h3>
              <p className="text-orange-100">Plan Expires</p>
              <div className="mt-2">
                <span className="text-sm text-orange-100">
                  {planExpiryDate && planExpiryDate > new Date() ? 
                    `${Math.ceil((planExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left` :
                    'Plan Expired'
                  }
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Available */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <DollarSign className="w-8 h-8" />
                <Badge variant="secondary" className="bg-white/20 text-white">
                  UPGRADE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-bold">Pro Plans Available</h3>
              <p className="text-purple-100">Enhanced Features</p>
              <div className="mt-2">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Request Form */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Submit Payment Request
              </CardTitle>
              <CardDescription>
                Upload your payment receipt and submit request for account credit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (PKR) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      data-testid="input-amount"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jazzcash">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            JazzCash
                          </div>
                        </SelectItem>
                        <SelectItem value="easypaisa">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            EasyPaisa
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Purpose of payment (e.g., Plan upgrade, Additional credit)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="textarea-description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Receipt *</Label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <Label htmlFor="receipt" className="cursor-pointer">
                        <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                          Click to upload receipt image
                        </span>
                        <Input
                          id="receipt"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          data-testid="input-receipt"
                        />
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG up to 10MB
                      </p>
                      {formData.receiptImage && (
                        <p className="text-sm text-green-600 mt-2">
                          ✅ {formData.receiptImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createRequestMutation.isPending}
                  data-testid="button-submit-request"
                >
                  {createRequestMutation.isPending ? "Submitting..." : "Submit Payment Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Payment Request History
              </CardTitle>
              <CardDescription>
                Track your submitted payment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {requestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading requests...</p>
                  </div>
                ) : paymentRequests && paymentRequests.length > 0 ? (
                  paymentRequests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">PKR {parseFloat(request.amount).toFixed(2)}</span>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {request.status === 'rejected' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Method: {request.paymentMethod}</p>
                        <p>Date: {new Date(request.createdAt).toLocaleDateString()}</p>
                        {request.description && <p>Note: {request.description}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No payment requests yet</p>
                    <p className="text-sm text-gray-400">Submit your first payment request above</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans for Upgrade */}
        {subscriptionPlans && subscriptionPlans.length > 0 && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>Available Subscription Plans</CardTitle>
              <CardDescription>
                Upgrade your plan for enhanced features and higher limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan: any) => (
                  <div 
                    key={plan.id} 
                    className={`border rounded-lg p-6 ${
                      plan.id === restaurantData?.planId 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        PKR {parseFloat(plan.price).toFixed(0)}
                      </div>
                      <p className="text-sm text-gray-500 mb-4">per month</p>
                      
                      {plan.id === restaurantData?.planId ? (
                        <Badge variant="default" className="mb-4">Current Plan</Badge>
                      ) : (
                        <Button variant="outline" className="w-full mb-4">
                          Select Plan
                        </Button>
                      )}
                      
                      <div className="text-left text-sm space-y-1">
                        {typeof plan.features === 'object' && Object.entries(plan.features).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{key}: {value?.toString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}