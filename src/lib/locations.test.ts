import {
  AU_CITY_IDS,
  getAllLocationIds,
  getLocationById,
  isValidLocationId,
  NZ_CITY_IDS,
  PRESETS,
} from './locations';

describe('locations', () => {
  const expectedNzCities = [
    'auckland',
    'wellington',
    'christchurch',
    'hamilton',
    'tauranga',
  ];

  const expectedAuCities = [
    'sydney',
    'melbourne',
    'brisbane',
    'perth',
    'adelaide',
  ];

  describe('PRESETS', () => {
    it('should contain top 5 NZ and top 5 AU cities', () => {
      expect(NZ_CITY_IDS).toEqual(expectedNzCities);
      expect(AU_CITY_IDS).toEqual(expectedAuCities);
      expect(Object.keys(PRESETS)).toHaveLength(10);
    });

    it('should have correct structure for each location', () => {
      Object.values(PRESETS).forEach((location) => {
        expect(location).toHaveProperty('label');
        expect(location).toHaveProperty('lat');
        expect(location).toHaveProperty('lon');
        expect(location).toHaveProperty('country');
        expect(typeof location.label).toBe('string');
        expect(typeof location.lat).toBe('number');
        expect(typeof location.lon).toBe('number');
        expect(['NZ', 'AU']).toContain(location.country);
      });
    });

    it('should have valid coordinates for Auckland', () => {
      const auckland = PRESETS.auckland;
      expect(auckland.label).toBe('Auckland, NZ');
      expect(auckland.country).toBe('NZ');
      expect(auckland.lat).toBe(-36.8509);
      expect(auckland.lon).toBe(174.7645);
    });

    it('should have valid coordinates for Sydney', () => {
      const sydney = PRESETS.sydney;
      expect(sydney.label).toBe('Sydney, AU');
      expect(sydney.country).toBe('AU');
      expect(sydney.lat).toBe(-33.8688);
      expect(sydney.lon).toBe(151.2093);
    });

    it('should only contain AU/NZ cities', () => {
      const allIds = Object.keys(PRESETS);
      expect(allIds.length).toBe(10);
      expect(allIds).not.toContain('seoul');
      expect(allIds).not.toContain('tokyo');
    });
  });

  describe('getLocationById', () => {
    it('should return location for valid ID', () => {
      const location = getLocationById('auckland');
      expect(location).toBeDefined();
      expect(location?.label).toBe('Auckland, NZ');
    });

    it('should return undefined for invalid ID', () => {
      const location = getLocationById('invalid-city');
      expect(location).toBeUndefined();
    });

    it('should return correct location for all preset cities', () => {
      [...expectedNzCities, ...expectedAuCities].forEach((id) => {
        const location = getLocationById(id);
        expect(location).toBeDefined();
        expect(location).toEqual(PRESETS[id]);
      });
    });

    it('should handle empty string', () => {
      const location = getLocationById('');
      expect(location).toBeUndefined();
    });

    it('should handle case-sensitive IDs', () => {
      const location = getLocationById('Auckland');
      expect(location).toBeUndefined();
    });
  });

  describe('getAllLocationIds', () => {
    it('should return all location IDs', () => {
      const ids = getAllLocationIds();
      expect(ids).toHaveLength(10);
      expect(ids).toContain('auckland');
      expect(ids).toContain('adelaide');
      expect(ids).toContain('tauranga');
    });

    it('should return an array', () => {
      const ids = getAllLocationIds();
      expect(Array.isArray(ids)).toBe(true);
    });

    it('should return all keys from PRESETS', () => {
      const ids = getAllLocationIds();
      const presetKeys = Object.keys(PRESETS);
      expect(ids.sort()).toEqual(presetKeys.sort());
    });
  });

  describe('isValidLocationId', () => {
    it('should return true for valid location IDs', () => {
      [...expectedNzCities, ...expectedAuCities].forEach((cityId) => {
        expect(isValidLocationId(cityId)).toBe(true);
      });
    });

    it('should return false for invalid location IDs', () => {
      expect(isValidLocationId('invalid-city')).toBe(false);
      expect(isValidLocationId('darwin')).toBe(false);
      expect(isValidLocationId('tokyo')).toBe(false);
      expect(isValidLocationId('seoul')).toBe(false);
      expect(isValidLocationId('london')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidLocationId('')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isValidLocationId('Auckland')).toBe(false);
      expect(isValidLocationId('SYDNEY')).toBe(false);
    });

    it('should return false for non-string values', () => {
      expect(isValidLocationId('')).toBe(false);
    });
  });
});
