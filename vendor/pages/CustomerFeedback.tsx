import { useState } from "react";
import { VendorLayout } from "../components/VendorLayout";
import { Button } from "../../admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../admin/components/ui/card";
import { Badge } from "../../admin/components/ui/badge";
import { Input } from "../../admin/components/ui/input";
import { Textarea } from "../../admin/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../admin/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../admin/components/ui/select";
import { 
  Star,
  MessageSquare,
  Reply,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";

const mockFeedback = [
  {
    id: "1",
    customerName: "Sarah Ahmed",
    customerEmail: "sarah@email.com",
    rating: 5,
    category: "food",
    comment: "Amazing biryani! The flavors were authentic and the portion size was generous. Will definitely order again.",
    orderId: "ORD-001",
    status: "approved",
    isPublic: true,
    response: "Thank you so much for your kind words! We're delighted you enjoyed our biryani.",
    responseDate: "2024-01-15",
    createdAt: "2024-01-14",
  },
  {
    id: "2",
    customerName: "Ali Hassan",
    customerEmail: "ali@email.com", 
    rating: 4,
    category: "service",
    comment: "Good food but service was a bit slow. Had to wait 30 minutes for our order.",
    orderId: "ORD-002",
    status: "pending",
    isPublic: true,
    response: null,
    responseDate: null,
    createdAt: "2024-01-13",
  },
  {
    id: "3",
    customerName: "Fatima Khan",
    customerEmail: "fatima@email.com",
    rating: 2,
    category: "cleanliness",
    comment: "The table was not properly cleaned and the washroom needs attention.",
    orderId: "ORD-003",
    status: "pending",
    isPublic: false,
    response: null,
    responseDate: null,
    createdAt: "2024-01-12",
  },
  {
    id: "4",
    customerName: "Muhammad Omar",
    customerEmail: "omar@email.com",
    rating: 5,
    category: "ambiance",
    comment: "Beautiful restaurant with great atmosphere. Perfect for family dining.",
    orderId: "ORD-004",
    status: "approved",
    isPublic: true,
    response: "We're thrilled you enjoyed the ambiance! Thank you for choosing us for your family meal.",
    responseDate: "2024-01-11",
    createdAt: "2024-01-10",
  },
];

const feedbackStats = [
  {
    title: "Average Rating",
    value: "4.2",
    change: "+0.3",
    trend: "up",
    icon: Star,
  },
  {
    title: "Total Reviews",
    value: "127",
    change: "+12",
    trend: "up", 
    icon: MessageSquare,
  },
  {
    title: "Response Rate",
    value: "85%",
    change: "+5%",
    trend: "up",
    icon: Reply,
  },
  {
    title: "Pending Reviews",
    value: "8",
    change: "-2",
    trend: "down",
    icon: Clock,
  },
];

const categories = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "Food Quality" },
  { value: "service", label: "Service" },
  { value: "ambiance", label: "Ambiance" },
  { value: "cleanliness", label: "Cleanliness" },
  { value: "general", label: "General" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function ResponseDialog({ feedback, onClose }: { feedback: any; onClose: () => void }) {
  const [response, setResponse] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending response:", response);
    onClose();
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Respond to Customer Feedback</DialogTitle>
        <DialogDescription>
          Reply to {feedback.customerName}'s review
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4">
        {/* Original Review */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <StarRating rating={feedback.rating} />
              <Badge variant="outline">{feedback.category}</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              "{feedback.comment}"
            </p>
          </CardContent>
        </Card>

        {/* Response Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your Response</label>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Thank you for your feedback..."
              rows={4}
              required
              data-testid="response-textarea"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" data-testid="send-response">
              Send Response
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  );
}

export function CustomerFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [responseDialog, setResponseDialog] = useState<any>(null);

  const filteredFeedback = mockFeedback.filter(feedback => {
    const matchesSearch = feedback.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || feedback.category === selectedCategory;
    const matchesRating = selectedRating === "all" || feedback.rating.toString() === selectedRating;
    const matchesStatus = selectedStatus === "all" || feedback.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesRating && matchesStatus;
  });

  return (
    <VendorLayout restaurantName="Karachi Kitchen" ownerName="Ahmed Ali">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Customer Feedback
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage customer reviews and ratings
            </p>
          </div>
          <Button variant="outline" data-testid="export-feedback">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {feedbackStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className={`text-sm flex items-center ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.trend === 'up' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-feedback"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger data-testid="category-filter">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger data-testid="rating-filter">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => (
            <Card key={feedback.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {feedback.customerName}
                        </h3>
                        <StarRating rating={feedback.rating} />
                        <Badge variant="outline" className="capitalize">
                          {feedback.category}
                        </Badge>
                        <Badge className={
                          feedback.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          feedback.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }>
                          {feedback.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {feedback.createdAt}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        "{feedback.comment}"
                      </p>
                    </div>

                    {/* Response */}
                    {feedback.response ? (
                      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <Reply className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Your Response ({feedback.responseDate})
                          </span>
                        </div>
                        <p className="text-blue-800 dark:text-blue-200">
                          {feedback.response}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800 dark:text-yellow-200">
                            No response yet
                          </span>
                        </div>
                        <Dialog 
                          open={responseDialog?.id === feedback.id} 
                          onOpenChange={(open) => !open && setResponseDialog(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setResponseDialog(feedback)}
                              data-testid={`respond-${feedback.id}`}
                            >
                              <Reply className="w-3 h-3 mr-1" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          {responseDialog?.id === feedback.id && (
                            <ResponseDialog
                              feedback={feedback}
                              onClose={() => setResponseDialog(null)}
                            />
                          )}
                        </Dialog>
                      </div>
                    )}

                    {/* Order Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Order: {feedback.orderId}</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          {feedback.isPublic ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                              Public
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1 text-red-600" />
                              Private
                            </>
                          )}
                        </span>
                        <span>{feedback.customerEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFeedback.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No feedback found matching your criteria
            </p>
          </div>
        )}
      </div>
    </VendorLayout>
  );
}