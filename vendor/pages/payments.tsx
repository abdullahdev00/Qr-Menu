import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "../../admin/lib/auth";
import { Button } from "../../admin/components/ui/button";
import { Input } from "../../admin/components/ui/input";
import { Label } from "../../admin/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Textarea } from "../../admin/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../admin/components/ui/select";
import { useToast } from "../../admin/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../admin/components/ui/dialog";
import { Progress } from "../../admin/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../admin/components/ui/tabs";
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
  Building,
  TrendingUp,
  History,
  FileImage,
  X,
  Plus,
  Crown,
  ArrowUpCircle,
  CalendarDays,
  Receipt
} from "lucide-react";

interface PaymentRequestFormData {
  amount: string;
  paymentMethod: string;
  description: string;
  transactionRef: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  receiptImage: File | null;
}

interface ImagePreviewState {
  preview: string | null;
  isDragOver: boolean;
  fileName?: string;
  fileSize?: number;
}

interface Restaurant {
  id: string;
  name: string;
  accountBalance: string;
  planExpiryDate: string;
  planId?: string;
  status: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  currency: string;
  features: string[];
  duration: number;
}

interface PaymentRequest {
  id: string;
  amount: string;
  paymentMethod: string;
  description: string;
  status: string;
  createdAt: string;
  receiptUrl?: string;
}

export default function PaymentManagement() {
  const user = getCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<PaymentRequestFormData>({
    amount: "",
    paymentMethod: "",
    description: "",
    transactionRef: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    receiptImage: null
  });

  const [imagePreview, setImagePreview] = useState<ImagePreviewState>({
    preview: null,
    isDragOver: false,
    fileName: undefined,
    fileSize: undefined
  });

  const [selectedPlanUpgrade, setSelectedPlanUpgrade] = useState<string>("");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Fetch restaurant data including plan and balance info
  const { data: restaurantData, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ['/api/restaurants', user?.restaurantId],
    enabled: !!user?.restaurantId,
    queryFn: async () => {
      const response = await fetch(`/api/restaurants/${user?.restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch restaurant data');
      return response.json();
    },
  });

  // Fetch subscription plans for upgrade options
  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['/api/subscription-plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-plans');
      if (!response.ok) throw new Error('Failed to fetch plans');
      return response.json();
    },
  });

  // Fetch payment requests history
  const { data: paymentRequests, isLoading: requestsLoading } = useQuery<PaymentRequest[]>({
    queryKey: ['/api/payment-requests', user?.restaurantId],
    enabled: !!user?.restaurantId,
    queryFn: async () => {
      const response = await fetch(`/api/payment-requests?restaurantId=${user?.restaurantId}`);
      if (!response.ok) throw new Error('Failed to fetch payment requests');
      return response.json();
    },
  });

  // Calculate days until plan expiry
  const daysUntilExpiry = restaurantData?.planExpiryDate 
    ? Math.ceil((new Date(restaurantData.planExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

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
        transactionRef: "",
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        receiptImage: null
      });
      setImagePreview({ preview: null, isDragOver: false, fileName: undefined, fileSize: undefined });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed ❌", 
        description: error.message || "Failed to submit payment request",
        variant: "destructive",
      });
    },
  });

  // Plan upgrade mutation
  const planUpgradeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch('/api/plan-upgrades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: user?.restaurantId,
          newPlanId: planId,
        }),
      });
      if (!response.ok) throw new Error('Failed to upgrade plan');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Plan Upgrade Request Submitted! 🚀",
        description: "Your plan upgrade has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/restaurants'] });
      setShowUpgradeDialog(false);
      setSelectedPlanUpgrade("");
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade Failed ❌", 
        description: error.message || "Failed to upgrade plan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.paymentMethod || !formData.transactionRef || !formData.receiptImage) {
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
    submitData.append('transactionRef', formData.transactionRef);
    submitData.append('bankName', formData.bankName);
    submitData.append('accountNumber', formData.accountNumber);
    submitData.append('accountHolder', formData.accountHolder);
    submitData.append('restaurantId', user?.restaurantId || '');
    
    if (formData.receiptImage) {
      submitData.append('receiptImage', formData.receiptImage);
    }

    createRequestMutation.mutate(submitData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large ❌",
        description: "Please select a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type ❌",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    setFormData({ ...formData, receiptImage: file });
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview({
        preview: e.target?.result as string,
        isDragOver: false,
        fileName: file.name,
        fileSize: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setImagePreview(prev => ({ ...prev, isDragOver: false }));
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setImagePreview(prev => ({ ...prev, isDragOver: true }));
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setImagePreview(prev => ({ ...prev, isDragOver: false }));
  };

  const removeImage = () => {
    setFormData({ ...formData, receiptImage: null });
    setImagePreview({ preview: null, isDragOver: false, fileName: undefined, fileSize: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      approved: { color: "bg-green-100 text-green-800", text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      under_review: { color: "bg-blue-100 text-blue-800", text: "Under Review" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.color} border-0`}>{config.text}</Badge>;
  };

  const getCurrentPlan = () => {
    return subscriptionPlans?.find(plan => plan.id === restaurantData?.planId);
  };

  const getUpgradeablePlans = () => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan || !subscriptionPlans) return [];
    
    return subscriptionPlans.filter(plan => 
      parseFloat(plan.price) > parseFloat(currentPlan.price)
    );
  };

  if (restaurantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-500 mt-1">Manage your account balance, payments, and plan upgrades</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Account Balance</div>
          <div className="text-2xl font-bold text-green-600">
            PKR {parseFloat(restaurantData?.accountBalance || '0').toLocaleString()}
          </div>
        </div>
      </div>

      {/* Balance and Plan Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Current Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              PKR {parseFloat(restaurantData?.accountBalance || '0').toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available for plan payments</p>
          </CardContent>
        </Card>

        {/* Current Plan */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrentPlan()?.name || 'No Plan'}
            </div>
            <p className="text-xs text-muted-foreground">
              PKR {getCurrentPlan()?.price || '0'}/month
            </p>
          </CardContent>
        </Card>

        {/* Plan Expiry */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan Expires In</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${daysUntilExpiry <= 7 ? 'text-red-600' : daysUntilExpiry <= 15 ? 'text-yellow-600' : 'text-green-600'}`}>
              {daysUntilExpiry} days
            </div>
            <p className="text-xs text-muted-foreground">
              {restaurantData?.planExpiryDate ? new Date(restaurantData.planExpiryDate).toLocaleDateString() : 'No expiry date'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="add-balance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-balance">Add Balance</TabsTrigger>
          <TabsTrigger value="upgrade-plan">Upgrade Plan</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        {/* Add Balance Tab */}
        <TabsContent value="add-balance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Balance to Account
              </CardTitle>
              <CardDescription>
                Upload your payment receipt to add balance to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (PKR) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="5000"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                      data-testid="input-amount"
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method *</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jazzcash">JazzCash</SelectItem>
                        <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transaction Reference */}
                  <div className="space-y-2">
                    <Label htmlFor="transaction-ref">Transaction Reference *</Label>
                    <Input
                      id="transaction-ref"
                      placeholder="TXN123456789"
                      value={formData.transactionRef}
                      onChange={(e) => setFormData({...formData, transactionRef: e.target.value})}
                      required
                      data-testid="input-transaction-ref"
                    />
                  </div>

                  {/* Bank Details (if bank transfer) */}
                  {formData.paymentMethod === 'bank_transfer' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input
                          id="bank-name"
                          placeholder="Habib Bank Limited"
                          value={formData.bankName}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                          data-testid="input-bank-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input
                          id="account-number"
                          placeholder="1234567890"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          data-testid="input-account-number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-holder">Account Holder</Label>
                        <Input
                          id="account-holder"
                          placeholder="Restaurant Owner Name"
                          value={formData.accountHolder}
                          onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                          data-testid="input-account-holder"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional notes about this payment..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    data-testid="textarea-description"
                  />
                </div>

                {/* Receipt Upload */}
                <div className="space-y-2">
                  <Label>Payment Receipt * (Max 5MB)</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      imagePreview.isDragOver 
                        ? 'border-blue-400 bg-blue-50' 
                        : imagePreview.preview 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    data-testid="receipt-upload-area"
                  >
                    {imagePreview.preview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview.preview}
                          alt="Receipt preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{imagePreview.fileName}</p>
                          <p>{imagePreview.fileSize ? formatFileSize(imagePreview.fileSize) : ''}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeImage}
                          className="flex items-center gap-2"
                          data-testid="button-remove-image"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <FileImage className="h-12 w-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-lg font-medium">Drop your receipt here</p>
                          <p className="text-sm text-gray-500">or click to browse</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          data-testid="button-browse-files"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Browse Files
                        </Button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="file-input"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={createRequestMutation.isPending}
                  data-testid="button-submit-payment"
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Submit Payment Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upgrade Plan Tab */}
        <TabsContent value="upgrade-plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                Upgrade Your Plan
              </CardTitle>
              <CardDescription>
                Choose a higher plan to unlock more features and increase your limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getUpgradeablePlans().map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPlanUpgrade === plan.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPlanUpgrade(plan.id)}
                    data-testid={`plan-card-${plan.id}`}
                  >
                    <div className="text-center space-y-3">
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <div className="text-2xl font-bold text-green-600">
                        PKR {parseFloat(plan.price).toLocaleString()}<span className="text-sm text-gray-500">/month</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {selectedPlanUpgrade === plan.id && (
                        <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedPlanUpgrade && (
                <div className="mt-6 pt-6 border-t">
                  <Button 
                    onClick={() => setShowUpgradeDialog(true)} 
                    className="w-full"
                    data-testid="button-upgrade-plan"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade to {subscriptionPlans?.find(p => p.id === selectedPlanUpgrade)?.name}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>
                View all your payment requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : paymentRequests && paymentRequests.length > 0 ? (
                <div className="space-y-4">
                  {paymentRequests.map((request) => (
                    <div 
                      key={request.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`payment-request-${request.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">PKR {parseFloat(request.amount).toLocaleString()}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>Payment Method: {request.paymentMethod.charAt(0).toUpperCase() + request.paymentMethod.slice(1).replace('_', ' ')}</p>
                          {request.description && <p>Description: {request.description}</p>}
                          <p>Submitted: {new Date(request.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <DollarSign className="h-5 w-5 text-green-500 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payment requests found</p>
                  <p className="text-sm">Submit your first payment request to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Plan Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent data-testid="upgrade-dialog">
          <DialogHeader>
            <DialogTitle>Confirm Plan Upgrade</DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade to {subscriptionPlans?.find(p => p.id === selectedPlanUpgrade)?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Upgrade Details:</p>
              <ul className="text-sm space-y-1">
                <li>• New Plan: {subscriptionPlans?.find(p => p.id === selectedPlanUpgrade)?.name}</li>
                <li>• Monthly Cost: PKR {subscriptionPlans?.find(p => p.id === selectedPlanUpgrade)?.price}</li>
                <li>• Current Balance: PKR {parseFloat(restaurantData?.accountBalance || '0').toLocaleString()}</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowUpgradeDialog(false)}
                data-testid="button-cancel-upgrade"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => planUpgradeMutation.mutate(selectedPlanUpgrade)}
                disabled={planUpgradeMutation.isPending}
                data-testid="button-confirm-upgrade"
              >
                {planUpgradeMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Upgrading...
                  </>
                ) : (
                  'Confirm Upgrade'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}