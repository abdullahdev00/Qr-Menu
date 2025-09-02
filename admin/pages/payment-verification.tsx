import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Search,
  Filter,
  Receipt,
  DollarSign,
  AlertTriangle,
  CreditCard,
  Building,
  Smartphone
} from "lucide-react";
import { apiRequest } from "../lib/queryClient";

interface PaymentRequest {
  id: string;
  restaurantId: string;
  amount: string;
  paymentMethod: string;
  description: string;
  transactionRef: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  status: string;
  createdAt: string;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptFileSize?: number;
  adminNotes?: string;
  processedAt?: string;
}

interface Restaurant {
  id: string;
  name: string;
  email: string;
  accountBalance: string;
}

export default function PaymentVerification() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'approve' | 'reject'>('approve');

  // Fetch all payment requests
  const { data: paymentRequests, isLoading } = useQuery<PaymentRequest[]>({
    queryKey: ['/api/admin/payment-requests'],
    queryFn: async () => {
      const response = await fetch('/api/admin/payment-requests');
      if (!response.ok) throw new Error('Failed to fetch payment requests');
      return response.json();
    },
  });

  // Fetch restaurant data for context
  const { data: restaurants } = useQuery<Restaurant[]>({
    queryKey: ['/api/restaurants'],
    queryFn: async () => {
      const response = await fetch('/api/restaurants');
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      return response.json();
    },
  });

  // Verify payment mutation
  const verifyPaymentMutation = useMutation({
    mutationFn: async ({ paymentRequestId, action, adminNotes }: {
      paymentRequestId: string;
      action: 'approve' | 'reject';
      adminNotes?: string;
    }) => {
      return apiRequest("POST", "/api/admin/verify-payment", {
        paymentRequestId,
        action,
        adminNotes
      });
    },
    onSuccess: (data, variables) => {
      toast({
        title: `Payment ${variables.action}d! ✅`,
        description: `Payment request has been ${variables.action}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-requests'] });
      setShowVerificationDialog(false);
      setSelectedPayment(null);
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed ❌", 
        description: error.message || "Failed to verify payment",
        variant: "destructive",
      });
    },
  });

  const getRestaurantById = (restaurantId: string) => {
    return restaurants?.find(r => r.id === restaurantId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending", icon: Clock },
      approved: { color: "bg-green-100 text-green-800", text: "Approved", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected", icon: XCircle },
      under_review: { color: "bg-blue-100 text-blue-800", text: "Under Review", icon: Clock }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} border-0 flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'jazzcash':
      case 'easypaisa':
        return <Smartphone className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const filteredPaymentRequests = paymentRequests?.filter((request) => {
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    const restaurant = getRestaurantById(request.restaurantId);
    const matchesSearch = searchQuery === "" || 
      restaurant?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.amount.includes(searchQuery);
    
    return matchesStatus && matchesSearch;
  }) || [];

  const pendingCount = paymentRequests?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = paymentRequests?.filter(r => r.status === 'approved').length || 0;
  const rejectedCount = paymentRequests?.filter(r => r.status === 'rejected').length || 0;

  const handleVerifyPayment = (payment: PaymentRequest, action: 'approve' | 'reject') => {
    setSelectedPayment(payment);
    setVerificationAction(action);
    setAdminNotes("");
    setShowVerificationDialog(true);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
        <p className="text-gray-500 mt-1">Review and verify restaurant payment requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              PKR {filteredPaymentRequests.reduce((sum, req) => sum + parseFloat(req.amount), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by restaurant name, transaction ref, or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="search-payment-requests"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 bg-white text-sm"
            data-testid="filter-status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Payment Requests List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment Requests
          </CardTitle>
          <CardDescription>
            {filteredPaymentRequests.length} requests found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPaymentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No payment requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPaymentRequests.map((request) => {
                const restaurant = getRestaurantById(request.restaurantId);
                return (
                  <div 
                    key={request.id} 
                    className="border rounded-lg p-4"
                    data-testid={`payment-request-${request.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">
                            PKR {parseFloat(request.amount).toLocaleString()}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span className="font-medium">{restaurant?.name || 'Unknown Restaurant'}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.receiptUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(request.receiptUrl, '_blank')}
                            data-testid={`view-receipt-${request.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Receipt
                          </Button>
                        )}
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyPayment(request, 'reject')}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`reject-payment-${request.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleVerifyPayment(request, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`approve-payment-${request.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium flex items-center gap-1">
                          {getPaymentMethodIcon(request.paymentMethod)}
                          Payment Method
                        </p>
                        <p>{request.paymentMethod.charAt(0).toUpperCase() + request.paymentMethod.slice(1).replace('_', ' ')}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Transaction Ref</p>
                        <p className="font-mono">{request.transactionRef}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Submitted</p>
                        <p>{new Date(request.createdAt).toLocaleString()}</p>
                      </div>
                      
                      <div>
                        <p className="font-medium">Current Balance</p>
                        <p>PKR {parseFloat(restaurant?.accountBalance || '0').toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {request.description && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-medium text-sm text-gray-600">Description</p>
                        <p className="text-sm">{request.description}</p>
                      </div>
                    )}
                    
                    {request.adminNotes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-medium text-sm text-gray-600">Admin Notes</p>
                        <p className="text-sm">{request.adminNotes}</p>
                      </div>
                    )}
                    
                    {request.receiptFileName && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-medium text-sm text-gray-600">Receipt File</p>
                        <p className="text-sm">{request.receiptFileName} ({formatFileSize(request.receiptFileSize)})</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent data-testid="verification-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {verificationAction === 'approve' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {verificationAction === 'approve' ? 'Approve' : 'Reject'} Payment Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {verificationAction} this payment request?
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Payment Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">PKR {parseFloat(selectedPayment.amount).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Method:</span>
                    <span className="ml-2">{selectedPayment.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Restaurant:</span>
                    <span className="ml-2">{getRestaurantById(selectedPayment.restaurantId)?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Transaction:</span>
                    <span className="ml-2 font-mono">{selectedPayment.transactionRef}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  rows={3}
                  data-testid="admin-notes"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowVerificationDialog(false)}
                  data-testid="cancel-verification"
                >
                  Cancel
                </Button>
                <Button
                  className={`flex-1 ${verificationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  onClick={() => verifyPaymentMutation.mutate({
                    paymentRequestId: selectedPayment.id,
                    action: verificationAction,
                    adminNotes: adminNotes || undefined
                  })}
                  disabled={verifyPaymentMutation.isPending}
                  data-testid="confirm-verification"
                >
                  {verifyPaymentMutation.isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `${verificationAction === 'approve' ? 'Approve' : 'Reject'} Payment`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}