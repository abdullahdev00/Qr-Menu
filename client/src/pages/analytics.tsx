import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts, LocationChart } from "@/components/analytics/charts";
import { TrendingUp, Users, Eye, Smartphone } from "lucide-react";

const analyticsData = {
  totalScans: 45267,
  avgSession: 3.2,
  repeatVisits: 68,
  mobileScans: 92,
};

const cityData = [
  { name: "Karachi", restaurants: 89, percentage: 36 },
  { name: "Lahore", restaurants: 76, percentage: 31 },
  { name: "Islamabad", restaurants: 45, percentage: 18 },
  { name: "Others", restaurants: 37, percentage: 15 },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      {/* Analytics Charts */}
      <AnalyticsCharts />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="analytics-total-scans">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">
              {analyticsData.totalScans.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total QR Scans</div>
            <div className="text-xs text-success mt-1 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12% this month
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-avg-session">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-secondary mb-2">
              {analyticsData.avgSession}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Session (min)</div>
            <div className="text-xs text-success mt-1 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +5% this month
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-repeat-visits">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning mb-2">
              {analyticsData.repeatVisits}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Repeat Visits</div>
            <div className="text-xs text-success mt-1 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +8% this month
            </div>
          </CardContent>
        </Card>

        <Card data-testid="analytics-mobile-scans">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analyticsData.mobileScans}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Mobile Scans</div>
            <div className="text-xs text-success mt-1 flex items-center justify-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              +3% this month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {cityData.map((city, index) => {
                const colors = [
                  "bg-primary-100 dark:bg-primary-900/20 text-primary-600",
                  "bg-secondary-100 dark:bg-secondary-900/20 text-secondary-600",
                  "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600",
                  "bg-purple-100 dark:bg-purple-900/20 text-purple-600",
                ];
                
                return (
                  <div 
                    key={city.name} 
                    className="flex items-center justify-between"
                    data-testid={`city-stats-${city.name.toLowerCase()}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[index]}`}>
                        <div className="w-3 h-3 rounded-full bg-current"></div>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {city.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {city.restaurants} restaurants
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {city.percentage}% of total
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center">
              <LocationChart data={cityData} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
