'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { apiClient, Trip } from '@/lib/api';
import { formatDateTime, getStatusColor, calculateProgress } from '@/lib/utils';
import { 
  Users, 
  MapPin, 
  Clock, 
  Navigation,
  Car,
  Walking,
  Bike,
  Bus,
  Eye,
  RefreshCw
} from 'lucide-react';

export default function TripsPage() {
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrips();
    const interval = setInterval(fetchTrips, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTrips = async () => {
    try {
      setRefreshing(true);
      const trips = await apiClient.getActiveTrips();
      setActiveTrips(trips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType.toLowerCase()) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'walking': return <Walking className="h-4 w-4" />;
      case 'bicycle': return <Bike className="h-4 w-4" />;
      case 'bus': return <Bus className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const calculateETA = (startTime: string, progress: number) => {
    const start = new Date(startTime);
    const now = new Date();
    const elapsed = now.getTime() - start.getTime();
    const totalTime = elapsed / (progress / 100);
    const remaining = totalTime - elapsed;
    return Math.round(remaining / (1000 * 60)); // Return minutes
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Live Trip Monitoring</h1>
          <p className="text-gray-600">Real-time tracking of active journeys and user experiences</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchTrips}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeTrips.length}</div>
              <div className="text-sm text-gray-600">Active Trips</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeTrips.filter(trip => trip.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {activeTrips.filter(trip => trip.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Completed Today</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">18m</div>
              <div className="text-sm text-gray-600">Avg Duration</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Trips Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Active Journeys
          </CardTitle>
          <CardDescription>
            Real-time updates every 30 seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTrips.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active trips</h3>
              <p className="text-gray-500">
                When users start journeys, they will appear here for real-time monitoring.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Trip ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Vehicle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Started</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">ETA</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTrips.map((trip) => {
                    const progress = Math.random() * 100; // Mock progress - replace with real data
                    const eta = calculateETA(trip.startedAt, progress);
                    
                    return (
                      <tr key={trip.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm">#{trip.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">User #{trip.userId.slice(0, 6)}</div>
                              <div className="text-sm text-gray-500">Group of 2</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-32">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{Math.round(progress)}%</span>
                              <span className="text-gray-500">{Math.round(progress * 0.18)}m</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getVehicleIcon('car')}
                            <span className="text-sm">Car</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {formatDateTime(trip.startedAt)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{eta}m</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(trip.status)}>
                            {trip.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trip Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Trip Activity</CardTitle>
            <CardDescription>Latest trip events and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeTrips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Trip #{trip.id.slice(0, 8)} reached POI
                    </p>
                    <p className="text-xs text-gray-500">
                      Disney Castle • 2 minutes ago
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +$12.50
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Current trip performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Progress</span>
                <span className="font-medium">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">POI Engagement</span>
                <span className="font-medium">89%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Audio Completion</span>
                <span className="font-medium">76%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Upsell Conversion</span>
                <span className="font-medium">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}