export interface GeoPoint {
  lat: number;
  lng: number;
}

interface CityEntry {
  lat: number;
  lng: number;
  aliases: string[];
}

const MOROCCAN_CITIES: CityEntry[] = [
  { lat: 33.5731, lng: -7.5898, aliases: ['casablanca', 'casa', 'dar el beida'] },
  { lat: 34.0209, lng: -6.8416, aliases: ['rabat'] },
  { lat: 31.6295, lng: -7.9811, aliases: ['marrakech', 'marrakesh'] },
  { lat: 34.0181, lng: -5.0078, aliases: ['fes', 'fès', 'fez'] },
  { lat: 35.7595, lng: -5.834, aliases: ['tanger', 'tangier', 'tangiers'] },
  { lat: 30.4278, lng: -9.5981, aliases: ['agadir'] },
  { lat: 33.8935, lng: -5.5473, aliases: ['meknes', 'meknès', 'meknes'] },
  { lat: 34.6814, lng: -1.9086, aliases: ['oujda'] },
  { lat: 34.261, lng: -6.5802, aliases: ['kenitra', 'kénitra'] },
  { lat: 35.5889, lng: -5.3626, aliases: ['tetouan', 'tétouan'] },
  { lat: 33.0013, lng: -7.6166, aliases: ['settat'] },
  { lat: 33.2316, lng: -8.5007, aliases: ['el jadida', 'jadida'] },
  { lat: 33.6866, lng: -7.383, aliases: ['mohammedia'] },
  { lat: 35.1688, lng: -2.9286, aliases: ['nador'] },
  { lat: 32.3373, lng: -6.3498, aliases: ['beni mellal', 'beni-mellal'] },
  { lat: 33.8167, lng: -6.0667, aliases: ['khemisset', 'khémisset'] },
  { lat: 32.2994, lng: -9.2372, aliases: ['safi'] },
  { lat: 32.8828, lng: -6.9093, aliases: ['khouribga'] },
  { lat: 31.7917, lng: -7.0926, aliases: ['ben guerir', 'benguerir'] },
  { lat: 30.9335, lng: -6.937, aliases: ['ouarzazate'] },
  { lat: 34.0531, lng: -6.7985, aliases: ['sale', 'salé'] },
  { lat: 33.9716, lng: -6.8498, aliases: ['temara', 'témara'] },
  { lat: 33.2549, lng: -8.506, aliases: ['berrechid'] },
  { lat: 32.2969, lng: -9.2386, aliases: ['essaouira'] },
  { lat: 35.1676, lng: -2.927, aliases: ['al hoceima', 'al-hoceima'] },
  { lat: 34.2615, lng: -6.5882, aliases: ['skhirat'] },
  { lat: 33.5228, lng: -7.6483, aliases: ['bouskoura'] },
  { lat: 33.5333, lng: -7.5833, aliases: ['ain sebaa', 'ain-sebaa'] },
  { lat: 33.5951, lng: -7.6184, aliases: ['sidi bernoussi'] },
  { lat: 34.0372, lng: -6.8326, aliases: ['agdal'] },
];

function normalizeLocationToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCityLookup(): Map<string, GeoPoint> {
  const lookup = new Map<string, GeoPoint>();
  for (const city of MOROCCAN_CITIES) {
    for (const alias of city.aliases) {
      lookup.set(normalizeLocationToken(alias), { lat: city.lat, lng: city.lng });
    }
  }
  return lookup;
}

const CITY_LOOKUP = buildCityLookup();

export function resolveLocationCoordinates(location: string | null | undefined): GeoPoint | null {
  const normalized = normalizeLocationToken(location ?? '');
  if (!normalized) return null;

  const direct = CITY_LOOKUP.get(normalized);
  if (direct) return direct;

  for (const [alias, coords] of CITY_LOOKUP.entries()) {
    if (normalized.includes(alias) || alias.includes(normalized)) {
      return coords;
    }
  }

  const parts = normalized.split(/[,/|-]/).map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    const match = CITY_LOOKUP.get(part);
    if (match) return match;
    for (const [alias, coords] of CITY_LOOKUP.entries()) {
      if (part.includes(alias) || alias.includes(part)) {
        return coords;
      }
    }
  }

  return null;
}

export function haversineDistanceKm(from: GeoPoint, to: GeoPoint): number {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function computeOfferDistanceKm(
  userLocation: GeoPoint | null,
  offerLocation: string | null | undefined,
): number | null {
  if (!userLocation) return null;
  const offerCoords = resolveLocationCoordinates(offerLocation);
  if (!offerCoords) return null;
  return Math.round(haversineDistanceKm(userLocation, offerCoords));
}

export function formatDistanceKm(distanceKm: number | null | undefined): string | null {
  if (distanceKm == null) return null;
  if (distanceKm < 1) return '< 1 km';
  return `${distanceKm} km`;
}
