'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiClient, RevenueEvent } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  DollarSign, 
  Clock,
  Download,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const revenue = await apiClient.getRevenueEvents('partner-1');
        setRevenueEvents(revenue);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  const totalRevenue = revenueEvents.reduce((sum, event) => sum + event.revenue, 0);
  const totalTrips = 156; // Mock data
  const totalPOIs = 24; // Mock data
  const avgSessionDuration = 18; // Mock data

  const revenueChange = 12.5; // Mock data
  const tripsChange = 8.2; // Mock data
  const engagementChange = -2.1; // Mock data

  const chartData = [
    { name: 'Mon', trips: 12, revenue: 240, engagement: 85 },
    { name: 'Tue', trips: 19, revenue: 380, engagement: 92 },
    { name: 'Wed', trips: 15, revenue: 300, engagement: 78 },
    { name: 'Thu', trips: 22, revenue: 440, engagement: 88 },
    { name: 'Fri', trips: 28, revenue: 560, engagement: 95 },
    { name: 'Sat', trips: 35, revenue: 700, engagement: 98 },
    { name: 'Sun', trips: 18, revenue: 360, engagement: 82 },
  ];

  const categoryData = [
    { name: 'Landmarks', value: 8, color: '#3b82f6' },
    { name: 'Partner Locations', value: 6, color: '#10b981' },
    { name: 'Nature', value: 4, color: '#f59e0b' },
    { name: 'Fun Facts', value: 3, color: '#8b5cf6' },
    { name: 'Traffic Alerts', value: 3, color: '#ef4444' },
  ];

  const topPOIs = [
    { name: 'Disney Castle', engagement: 95, revenue: 1200 },
    { name: 'Space Mountain', engagement: 88, revenue: 980 },
    { name: 'Pirates of Caribbean', engagement: 82, revenue: 850 },
    { name: 'Haunted Mansion', engagement: 78, revenue: 720 },
    { name: 'It\'s a Small World', engagement: 75, revenue: 680 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your location-based experiences</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueChange > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              {Math.abs(revenueChange)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrips}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {tripsChange > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              {Math.abs(tripsChange)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {engagementChange > 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
              )}
              {Math.abs(engagementChange)}% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionDuration}m</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +2m from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Trips Trend</CardTitle>
            <CardDescription>Daily performance over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `$${value}` : value, 
                  name === 'revenue' ? 'Revenue' : name === 'trips' ? 'Trips' : 'Engagement %'
                ]} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>POI Categories Distribution</CardTitle>
            <CardDescription>Breakdown of points of interest by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing POIs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing POIs</CardTitle>
          <CardDescription>Points of interest with highest engagement and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPOIs.map((poi, index) => (
              <div key={poi.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{poi.name}</p>
                    <p className="text-sm text-gray-500">
                      {poi.engagement}% engagement rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">
                    {formatCurrency(poi.revenue)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Revenue generated
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Activity</CardTitle>
            <CardDescription>Peak usage hours throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { hour: '6AM', trips: 5 },
                { hour: '9AM', trips: 15 },
                { hour: '12PM', trips: 25 },
                { hour: '3PM', trips: 30 },
                { hour: '6PM', trips: 20 },
                { hour: '9PM', trips: 10 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trips" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Segmentation</CardTitle>
            <CardDescription>Breakdown of user types and engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Power Users</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">45%</p>
                  <p className="text-xs text-gray-500">High engagement</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Regular Users</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">35%</p>
                  <p className="text-xs text-gray-500">Medium engagement</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">New Users</span>
                </div>
                <div className="text-right">
                  <p className="font-medium">20%</p>
                  <p className="text-xs text-gray-500">Low engagement</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}