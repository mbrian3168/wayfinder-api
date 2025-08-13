'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiClient, Trip, RevenueEvent } from '@/lib/api';
import { formatCurrency, formatDateTime, getStatusColor } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  DollarSign, 
  Clock,
  Eye,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DashboardPage() {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [trips, revenue] = await Promise.all([
          apiClient.getActiveTrips(),
          apiClient.getRevenueEvents('partner-1') // Replace with actual partner ID
        ]);
        setActiveTrips(trips);
        setRevenueEvents(revenue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const totalRevenue = revenueEvents.reduce((sum, event) => sum + event.revenue, 0);
  const todayRevenue = revenueEvents
    .filter(event => new Date(event.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, event) => sum + event.revenue, 0);

  const revenueChange = ((todayRevenue - (totalRevenue / 7)) / (totalRevenue / 7)) * 100;

  const chartData = [
    { name: 'Mon', trips: 12, revenue: 240 },
    { name: 'Tue', trips: 19, revenue: 380 },
    { name: 'Wed', trips: 15, revenue: 300 },
    { name: 'Thu', trips: 22, revenue: 440 },
    { name: 'Fri', trips: 28, revenue: 560 },
    { name: 'Sat', trips: 35, revenue: 700 },
    { name: 'Sun', trips: 18, revenue: 360 },
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Monitor your location-based audio experiences and revenue</p>
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
            <p className="text-xs text-muted-foreground">
              +{revenueChange.toFixed(1)}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrips.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeTrips.filter(trip => trip.status === 'ACTIVE').length} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POIs</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18m</div>
            <p className="text-xs text-muted-foreground">
              +2m from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Activity</CardTitle>
            <CardDescription>Daily active trips</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trips" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Trips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Trip Monitoring
          </CardTitle>
          <CardDescription>
            Real-time tracking of active journeys
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active trips at the moment
            </div>
          ) : (
            <div className="space-y-4">
              {activeTrips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Trip #{trip.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        Started {formatDateTime(trip.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Revenue Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Revenue Events</CardTitle>
          <CardDescription>Latest upsell and purchase activities</CardDescription>
        </CardHeader>
        <CardContent>
          {revenueEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No revenue events yet
            </div>
          ) : (
            <div className="space-y-4">
              {revenueEvents.slice(0, 5).map((event) => (
                <div key={event.timestamp} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{event.eventType.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      +{formatCurrency(event.revenue)}
                    </p>
                    <p className="text-sm text-gray-500">
                      POI #{event.poiId.slice(0, 8)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}