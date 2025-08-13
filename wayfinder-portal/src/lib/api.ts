import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wayfinder-api.vercel.app';

export interface Trip {
  id: string;
  userId: string;
  hostId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELED';
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  routeGeometry?: any;
  startedAt: string;
  endedAt?: string;
}

export interface POI {
  id: string;
  partnerId?: string;
  name: string;
  description: string;
  category: 'LANDMARK' | 'NATURE' | 'PARTNER_LOCATION' | 'FUN_FACT' | 'TRAFFIC_ALERT';
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  messages: Message[];
}

export interface Message {
  id: string;
  poiId: string;
  hostId: string;
  textContent: string;
  pregeneratedAudioUrl?: string;
  triggers: Trigger[];
}

export interface Trigger {
  id: string;
  messageId: string;
  priority: number;
  conditions: any;
}

export interface Partner {
  id: string;
  name: string;
  contactEmail: string;
  createdAt: string;
  pois: POI[];
}

export interface RevenueEvent {
  partnerId: string;
  journeyId: string;
  poiId: string;
  eventType: 'upsell_shown' | 'upsell_clicked' | 'purchase_completed';
  revenue: number;
  timestamp: string;
  guestProfile: any;
}

class ApiClient {
  private async getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Trip Management
  async getActiveTrips(): Promise<Trip[]> {
    return this.request<Trip[]>('/v1/trips/active');
  }

  async getTripById(id: string): Promise<Trip> {
    return this.request<Trip>(`/v1/trip/${id}`);
  }

  async updateTripProgress(id: string, data: any): Promise<Trip> {
    return this.request<Trip>(`/v1/trip/${id}/update`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // POI Management
  async getPOIs(partnerId?: string): Promise<POI[]> {
    const params = partnerId ? `?partnerId=${partnerId}` : '';
    return this.request<POI[]>(`/v1/pois${params}`);
  }

  async createPOI(data: Omit<POI, 'id' | 'messages'>): Promise<POI> {
    return this.request<POI>('/v1/partner/poi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePOI(id: string, data: Partial<POI>): Promise<POI> {
    return this.request<POI>(`/v1/poi/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePOI(id: string): Promise<void> {
    return this.request<void>(`/v1/poi/${id}`, {
      method: 'DELETE',
    });
  }

  // Audio Management
  async generateAudio(text: string, voiceId: string): Promise<{ audioUrl: string }> {
    return this.request<{ audioUrl: string }>('/v1/audio/generate', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId }),
    });
  }

  // Analytics
  async getRevenueEvents(partnerId: string, startDate?: string, endDate?: string): Promise<RevenueEvent[]> {
    const params = new URLSearchParams({ partnerId });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request<RevenueEvent[]>(`/v1/analytics/revenue?${params}`);
  }

  async getTripAnalytics(partnerId: string): Promise<any> {
    return this.request<any>(`/v1/analytics/trips?partnerId=${partnerId}`);
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/v1/health');
  }
}

export const apiClient = new ApiClient();