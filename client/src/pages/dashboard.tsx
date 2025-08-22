import KpiCards from "@/components/dashboard/kpi-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, BarChart, Settings } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <KpiCards />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 border-dashed hover:border-primary"
              data-testid="button-add-restaurant"
            >
              <Plus className="w-6 h-6" />
              <span>Add Restaurant</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 border-dashed hover:border-secondary"
              data-testid="button-export-data"
            >
              <Download className="w-6 h-6" />
              <span>Export Data</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 border-dashed hover:border-warning"
              data-testid="button-view-reports"
            >
              <BarChart className="w-6 h-6" />
              <span>View Reports</span>
            </Button>

            <Button
              variant="outline"
              className="h-24 flex-col space-y-2 border-dashed hover:border-purple-500"
              data-testid="button-settings"
            >
              <Settings className="w-6 h-6" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
