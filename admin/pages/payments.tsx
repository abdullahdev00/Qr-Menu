import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../lib/use-toast';
import { 
  Search, Filter, Eye, Check, X, Shield, Download, 
  DollarSign, Clock, TrendingUp, Users, Calendar,
  Smartphone, Building, CreditCard, AlertCircle, MoreVertical
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PaymentRequest {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantEmail: string;
  amount: string;
  paymentMethod: 'jazzcash' | 'easypaisa' | 'bank_transfer';
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  transactionRef: string;
  receiptUrl?: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submittedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRequest | null>(null);
  const [processingPayment, setProcessingPayment] = useState<PaymentRequest | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  // Fetch payment requests from database
  const { data: payments = [], isLoading } = useQuery<PaymentRequest[]>({
    queryKey: ['/api/admin/payment-requests'],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Process payment request mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ paymentId, action, notes }: { paymentId: string; action: 'approve' | 'reject'; notes?: string }) => {
      const response = await fetch(`/api/payment-requests/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: notes,
          rejectionReason: action === 'reject' ? notes : undefined,
          processedBy: user?.id,
        }),
      });
      if (!response.ok) throw new Error('Failed to process payment');
      return response.json();
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'approve' ? "Payment Approved! ✅" : "Payment Rejected! ❌",
        description: `Payment request has been ${action}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-requests'] });
      setIsProcessDialogOpen(false);
      setProcessingPayment(null);
      setAdminNotes('');
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed ❌",
        description: error.message || "Failed to process payment request",
        variant: "destructive",
      });
    },
  });


  // Filter payments based on search and status
  const filteredPayments = payments.filter((payment: PaymentRequest) => {
    const matchesSearch = payment.restaurantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.restaurantEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    pending: payments.filter((p: PaymentRequest) => p.status === 'pending').length,
    approved: payments.filter((p: PaymentRequest) => p.status === 'approved').length,
    rejected: payments.filter((p: PaymentRequest) => p.status === 'rejected').length,
    underReview: payments.filter((p: PaymentRequest) => p.status === 'under_review').length,
  };

  const handleViewReceipt = (payment: PaymentRequest) => {
    setViewingReceipt(payment);
    setIsReceiptDialogOpen(true);
  };

  const handleProcessPayment = (payment: PaymentRequest, action: 'approve' | 'reject') => {
    setProcessingPayment(payment);
    setActionType(action);
    setAdminNotes('');
    setRejectionReason('');
    setIsProcessDialogOpen(true);
  };

  const confirmProcessPayment = () => {
    if (!processingPayment || !actionType) return;

    const notes = actionType === 'reject' ? rejectionReason : adminNotes;
    
    processPaymentMutation.mutate({
      paymentId: processingPayment.id,
      action: actionType,
      notes: notes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">🟡 Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">🟢 Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">🔴 Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">🔵 Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'jazzcash':
        return <Smartphone className="h-4 w-4 text-orange-600" />;
      case 'easypaisa':
        return <Smartphone className="h-4 w-4 text-green-600" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Requests Management</h1>
          <p className="text-gray-600">Verify and manage vendor payment submissions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            {stats.pending} Pending
          </Badge>
          <Button variant="outline" size="sm">
            Export Data
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.underReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by vendor, restaurant, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Restaurant Info</TableHead>
                    <TableHead>Payment Details</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <DollarSign className="h-12 w-12 mb-4 text-gray-300" />
                          <p className="text-lg font-medium text-gray-700">No payment requests found</p>
                          <p className="text-sm text-gray-500">Payment requests will appear here when vendors submit them</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment: PaymentRequest, index: number) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{payment.restaurantName}</div>
                              <div className="text-sm text-gray-500">{payment.restaurantEmail}</div>
                              <div className="text-xs text-gray-400">ID: {payment.restaurantId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-lg font-bold text-gray-900">₨{parseFloat(payment.amount).toLocaleString()}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className="ml-1 capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                            </div>
                            <div className="text-xs text-gray-400">Ref: {payment.transactionRef}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center space-y-2">
                            <div 
                              className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={() => handleViewReceipt(payment)}
                              title="Click to view receipt"
                            >
                              <span className="text-xs text-gray-500">Receipt</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(payment.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(payment.submittedAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewReceipt(payment)}
                              title="View Receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleProcessPayment(payment, 'approve')}
                                  className="text-green-600 hover:text-green-700"
                                  title="Approve Payment"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleProcessPayment(payment, 'reject')}
                                  className="text-red-600 hover:text-red-700"
                                  title="Reject Payment"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="sm" title="More Options">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt View Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Payment Receipt - {viewingReceipt?.restaurantName}</DialogTitle>
          </DialogHeader>
          {viewingReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Restaurant:</strong> {viewingReceipt.restaurantName}
                </div>
                <div>
                  <strong>Amount:</strong> ₨{parseFloat(viewingReceipt.amount).toLocaleString()}
                </div>
                <div>
                  <strong>Payment Method:</strong> {viewingReceipt.paymentMethod.replace('_', ' ')}
                </div>
                <div>
                  <strong>Reference:</strong> {viewingReceipt.transactionRef}
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center text-gray-600">
                  <p>Receipt Image Would Be Displayed Here</p>
                  <p className="text-sm">File: {viewingReceipt.receiptUrl}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Payment Dialog */}
      <AlertDialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' 
                ? `Are you sure you want to approve this payment of ₨${processingPayment ? parseFloat(processingPayment.amount).toLocaleString() : 0} to ${processingPayment?.restaurantName}?`
                : `Are you sure you want to reject this payment of ₨${processingPayment ? parseFloat(processingPayment.amount).toLocaleString() : 0} from ${processingPayment?.restaurantName}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === 'reject' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
                <Select value={rejectionReason} onValueChange={setRejectionReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invalid_receipt">Invalid Receipt</SelectItem>
                    <SelectItem value="insufficient_proof">Insufficient Proof</SelectItem>
                    <SelectItem value="wrong_amount">Wrong Amount</SelectItem>
                    <SelectItem value="duplicate_payment">Duplicate Payment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <Input
                  placeholder="Optional additional comments..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmProcessPayment}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={actionType === 'reject' && !rejectionReason}
            >
              {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}