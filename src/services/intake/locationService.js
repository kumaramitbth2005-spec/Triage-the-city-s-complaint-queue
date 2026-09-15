/**
 * Location Service
 * Handles GPS-based location detection and mock reverse-geocoding.
 * Designed to be API-ready: swap reverseGeocode() with a real endpoint when available.
 */
import { matchLocality } from './gazetteerService';

/**
 * Request GPS coordinates from the browser with explicit user permission.
 * Never silently collects location.
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export function requestGPSLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GEOLOCATION_UNAVAILABLE'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        if (err.code === 1) reject(new Error('PERMISSION_DENIED'));
        else if (err.code === 2) reject(new Error('POSITION_UNAVAILABLE'));
        else reject(new Error('TIMEOUT'));
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  });
}

/**
 * Mock reverse geocoding.
 * In production, replace with a call to a mapping API (e.g., Google Maps, Nominatim).
 * Returns mock location data based on approximate latitude ranges.
 * @param {{ lat: number, lng: number }} coords
 * @returns {Promise<{ locality: string, ward: string, city: string, source: string, confidence: number }>}
 */
export async function reverseGeocode({ lat, lng }) {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 1200));

  // Mock: deterministic locality based on coordinate range (Bhopal area ~23.25°N, 77.40°E)
  // In production this would call a real geocoding API
  const mockLocalities = [
    { locality: 'Arera Colony', ward: '42', city: 'Bhopal' },
    { locality: 'MP Nagar', ward: '55', city: 'Bhopal' },
    { locality: 'Shahpura', ward: '13', city: 'Bhopal' },
    { locality: 'TT Nagar', ward: '19', city: 'Bhopal' },
  ];

  // Use lat/lng fractional part to pseudo-randomly but deterministically select a locality
  const idx = Math.floor(((lat % 1) + (lng % 1)) * 10) % mockLocalities.length;
  const result = mockLocalities[Math.abs(idx)];

  return {
    ...result,
    source: 'gps',
    confidence: 0.92,
    coordinates: { lat: Math.round(lat * 10000) / 10000, lng: Math.round(lng * 10000) / 10000 },
    note: '[Mock] GPS reverse-geocoding — replace with real API in production',
  };
}

/**
 * Extract location from complaint text using the gazetteer.
 * @param {string} complaintText
 * @returns {{ locality: string, ward: string, city: string, source: string, confidence: number } | null}
 */
export function extractLocationFromText(complaintText) {
  return matchLocality(complaintText);
}

/**
 * Full location detection pipeline:
 * 1. Try GPS (if user hasn't explicitly declined)
 * 2. Fall back to text extraction from complaint
 * @param {string} complaintText
 * @param {boolean} useGPS
 * @returns {Promise<object|null>}
 */
export async function detectLocation(complaintText, useGPS = false) {
  if (useGPS) {
    try {
      const coords = await requestGPSLocation();
      const geoResult = await reverseGeocode(coords);
      return geoResult;
    } catch {
      // fall through to text-based
    }
  }
  return extractLocationFromText(complaintText);
}
