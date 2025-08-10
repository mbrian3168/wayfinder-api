// src/__tests__/tripController.test.ts
import { Request, Response } from 'express';
import { startTrip, updateTrip, getNearbyPois } from '../controllers/tripController';
import prisma from '../config/prisma';
import { UnauthorizedError, ValidationError, NotFoundError } from '../utils/errors';

// Mock Prisma
jest.mock('../config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  trip: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  hostProfile: {
    findUnique: jest.fn(),
  },
  pOI: {
    findMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Trip Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { uid: 'test-firebase-uid', email: 'test@example.com' },
      id: 'req-123',
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    mockNext = jest.fn();
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('startTrip', () => {
    const validTripData = {
      origin: { latitude: 40.7128, longitude: -74.0060 },
      destination: { latitude: 40.7831, longitude: -73.9712 },
      host_id: 'test-host-id',
    };

    it('should create a new trip successfully', async () => {
      // Arrange
      mockReq.body = validTripData;
      
      const mockUser = { id: 'user-123', firebaseUid: 'test-firebase-uid' };
      const mockHost = { id: 'test-host-id', name: 'Test Host' };
      const mockTrip = {
        id: 'trip-123',
        userId: 'user-123',
        hostId: 'test-host-id',
        status: 'ACTIVE',
        ...validTripData,
      };

      mockPrisma.hostProfile.findUnique.mockResolvedValue(mockHost);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.trip.create.mockResolvedValue(mockTrip);

      // Act
      await startTrip(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.hostProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-host-id' }
      });
      expect(mockPrisma.trip.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          hostId: 'test-host-id',
          originLat: 40.7128,
          originLng: -74.0060,
          destinationLat: 40.7831,
          destinationLng: -73.9712,
          status: 'ACTIVE',
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockTrip);
    });

    it('should throw UnauthorizedError when no Firebase UID', async () => {
      // Arrange
      mockReq.user = undefined;
      mockReq.body = validTripData;

      // Act & Assert
      await expect(startTrip(mockReq as Request, mockRes as Response))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw ValidationError when host does not exist', async () => {
      // Arrange
      mockReq.body = validTripData;
      mockPrisma.hostProfile.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(startTrip(mockReq as Request, mockRes as Response))
        .rejects.toThrow(ValidationError);
      
      expect(mockPrisma.hostProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-host-id' }
      });
    });

    it('should create user if not exists', async () => {
      // Arrange
      mockReq.body = validTripData;
      
      const mockHost = { id: 'test-host-id', name: 'Test Host' };
      const mockNewUser = { id: 'new-user-123', firebaseUid: 'test-firebase-uid' };
      const mockTrip = { id: 'trip-123', userId: 'new-user-123' };

      mockPrisma.hostProfile.findUnique.mockResolvedValue(mockHost);
      mockPrisma.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrisma.user.create.mockResolvedValue(mockNewUser); // Create new user
      mockPrisma.trip.create.mockResolvedValue(mockTrip);

      // Act
      await startTrip(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: { firebaseUid: 'test-firebase-uid' }
      });
      expect(mockPrisma.trip.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'new-user-123'
          })
        })
      );
    });
  });

  describe('updateTrip', () => {
    const mockTrip = {
      id: 'trip-123',
      user: { firebaseUid: 'test-firebase-uid' },
      status: 'ACTIVE',
    };

    it('should update trip location successfully', async () => {
      // Arrange
      mockReq.params = { id: 'trip-123' };
      mockReq.body = {
        current_location: { latitude: 40.7500, longitude: -73.9900 },
        eta_seconds: 1200,
      };

      const updatedTrip = { ...mockTrip, originLat: 40.7500, originLng: -73.9900 };
      
      mockPrisma.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrisma.trip.update.mockResolvedValue(updatedTrip);

      // Act
      await updateTrip(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 'trip-123' },
        include: { user: true }
      });
      expect(mockPrisma.trip.update).toHaveBeenCalledWith({
        where: { id: 'trip-123' },
        data: {
          originLat: 40.7500,
          originLng: -73.9900,
        }
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(updatedTrip);
    });

    it('should throw NotFoundError when trip does not exist', async () => {
      // Arrange
      mockReq.params = { id: 'nonexistent-trip' };
      mockReq.body = { current_location: { latitude: 40.7500, longitude: -73.9900 } };
      
      mockPrisma.trip.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(updateTrip(mockReq as Request, mockRes as Response))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when trip belongs to different user', async () => {
      // Arrange
      mockReq.params = { id: 'trip-123' };
      mockReq.body = { current_location: { latitude: 40.7500, longitude: -73.9900 } };
      
      const otherUserTrip = {
        ...mockTrip,
        user: { firebaseUid: 'different-firebase-uid' }
      };
      
      mockPrisma.trip.findUnique.mockResolvedValue(otherUserTrip);

      // Act & Assert
      await expect(updateTrip(mockReq as Request, mockRes as Response))
        .rejects.toThrow('Access denied: Trip belongs to another user');
    });
  });

  describe('getNearbyPois', () => {
    const mockTrip = {
      id: 'trip-123',
      user: { firebaseUid: 'test-firebase-uid' },
    };

    it('should return nearby POIs successfully', async () => {
      // Arrange
      mockReq.params = { id: 'trip-123' };
      mockReq.query = {
        latitude: '40.7128',
        longitude: '-74.0060',
        radius_meters: '5000',
        category: 'landmark'
      };

      const mockPois = [
        { id: 'poi-1', name: 'Statue of Liberty', distance: 1500 },
        { id: 'poi-2', name: 'Central Park', distance: 3000 },
      ];

      mockPrisma.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrisma.$queryRaw.mockResolvedValue(mockPois);

      // Act
      await getNearbyPois(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.trip.findUnique).toHaveBeenCalledWith({
        where: { id: 'trip-123' },
        include: { user: true }
      });
      expect(mockRes.json).toHaveBeenCalledWith(mockPois);
    });

    it('should validate latitude and longitude parameters', async () => {
      // Arrange
      mockReq.params = { id: 'trip-123' };
      mockReq.query = {
        latitude: 'invalid',
        longitude: '-74.0060',
      };

      // Act & Assert
      await expect(getNearbyPois(mockReq as Request, mockRes as Response))
        .rejects.toThrow(ValidationError);
    });

    it('should fallback to Haversine when PostGIS fails', async () => {
      // Arrange
      mockReq.params = { id: 'trip-123' };
      mockReq.query = {
        latitude: '40.7128',
        longitude: '-74.0060',
        category: ['landmark', 'nature'] // Multiple categories trigger fallback
      };

      const mockPois = [
        { id: 'poi-1', latitude: 40.7128, longitude: -74.0060, category: 'LANDMARK' },
      ];

      mockPrisma.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrisma.pOI.findMany.mockResolvedValue(mockPois);

      // Act
      await getNearbyPois(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.pOI.findMany).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'poi-1',
            distance: expect.any(Number)
          })
        ])
      );
    });
  });
});
