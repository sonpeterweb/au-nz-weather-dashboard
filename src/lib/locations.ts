export interface Location {
  label: string;
  lat: number;
  lon: number;
  country: 'NZ' | 'AU';
}

export const NZ_PRESETS: Record<string, Location> = {
  auckland: {
    label: 'Auckland, NZ',
    lat: -36.8509,
    lon: 174.7645,
    country: 'NZ',
  },
  wellington: {
    label: 'Wellington, NZ',
    lat: -41.2865,
    lon: 174.7762,
    country: 'NZ',
  },
  christchurch: {
    label: 'Christchurch, NZ',
    lat: -43.5321,
    lon: 172.6362,
    country: 'NZ',
  },
  hamilton: {
    label: 'Hamilton, NZ',
    lat: -37.787,
    lon: 175.2793,
    country: 'NZ',
  },
  tauranga: {
    label: 'Tauranga, NZ',
    lat: -37.6878,
    lon: 176.1651,
    country: 'NZ',
  },
};

export const AU_PRESETS: Record<string, Location> = {
  sydney: {
    label: 'Sydney, AU',
    lat: -33.8688,
    lon: 151.2093,
    country: 'AU',
  },
  melbourne: {
    label: 'Melbourne, AU',
    lat: -37.8136,
    lon: 144.9631,
    country: 'AU',
  },
  brisbane: {
    label: 'Brisbane, AU',
    lat: -27.4698,
    lon: 153.0251,
    country: 'AU',
  },
  perth: {
    label: 'Perth, AU',
    lat: -31.9505,
    lon: 115.8605,
    country: 'AU',
  },
  adelaide: {
    label: 'Adelaide, AU',
    lat: -34.9285,
    lon: 138.6007,
    country: 'AU',
  },
};

export const PRESETS: Record<string, Location> = {
  ...NZ_PRESETS,
  ...AU_PRESETS,
};

export const NZ_CITY_IDS = Object.keys(NZ_PRESETS);
export const AU_CITY_IDS = Object.keys(AU_PRESETS);

export function getLocationById(id: string): Location | undefined {
  return PRESETS[id];
}

export function getAllLocationIds(): string[] {
  return Object.keys(PRESETS);
}

export function isValidLocationId(id: string): boolean {
  return id in PRESETS;
}
