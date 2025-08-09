import { haversineDistance, isValidCoordinate, formatCoordinates } from '../utils/geoUtils';

describe('geoUtils', () => {
  describe('haversineDistance', () => {
    it('should calculate distance between two coordinates correctly', () => {
      // Distance between New York and Los Angeles (approx 3944 km)
      const lat1 = 40.7128; // New York
      const lon1 = -74.0060;
      const lat2 = 34.0522; // Los Angeles  
      const lon2 = -118.2437;
      
      const distance = haversineDistance(lat1, lon1, lat2, lon2);
      
      // Should be approximately 3944 km (3,944,000 meters)
      expect(distance).toBeGreaterThan(3900000);
      expect(distance).toBeLessThan(4000000);
    });

    it('should return 0 for identical coordinates', () => {
      const distance = haversineDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });
  });

  describe('isValidCoordinate', () => {
    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate(40.7128, -74.0060)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(90, 180)).toBe(true);
      expect(isValidCoordinate(-90, -180)).toBe(true);
    });

    it('should return false for invalid coordinates', () => {
      expect(isValidCoordinate(91, 0)).toBe(false); // lat > 90
      expect(isValidCoordinate(-91, 0)).toBe(false); // lat < -90
      expect(isValidCoordinate(0, 181)).toBe(false); // lng > 180
      expect(isValidCoordinate(0, -181)).toBe(false); // lng < -180
      expect(isValidCoordinate(NaN, 0)).toBe(false); // NaN lat
      expect(isValidCoordinate(0, Infinity)).toBe(false); // Infinity lng
    });
  });

  describe('formatCoordinates', () => {
    it('should format coordinates to 6 decimal places', () => {
      expect(formatCoordinates(40.712800, -74.006000)).toBe('40.712800,-74.006000');
      expect(formatCoordinates(0, 0)).toBe('0.000000,0.000000');
    });
  });
});
