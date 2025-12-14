import { KAABA_COORDINATES } from '../constants';
import { UserCoordinates } from '../types';

/**
 * Calculates the bearing (angle) between two coordinates using the Haversine formula related logic.
 * Returns degrees from True North (0-360).
 */
export const calculateQiblaDirection = (coords: UserCoordinates): number => {
  const userLatRad = (coords.latitude * Math.PI) / 180;
  const userLngRad = (coords.longitude * Math.PI) / 180;
  const kaabaLatRad = (KAABA_COORDINATES.latitude * Math.PI) / 180;
  const kaabaLngRad = (KAABA_COORDINATES.longitude * Math.PI) / 180;

  const y = Math.sin(kaabaLngRad - userLngRad) * Math.cos(kaabaLatRad);
  const x =
    Math.cos(userLatRad) * Math.sin(kaabaLatRad) -
    Math.sin(userLatRad) * Math.cos(kaabaLatRad) * Math.cos(kaabaLngRad - userLngRad);

  let bearingRad = Math.atan2(y, x);
  let bearingDeg = (bearingRad * 180) / Math.PI;

  return (bearingDeg + 360) % 360;
};

/**
 * Calculates the great-circle distance between two points in kilometers.
 */
export const calculateDistanceToKaaba = (coords: UserCoordinates): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((KAABA_COORDINATES.latitude - coords.latitude) * Math.PI) / 180;
  const dLon = ((KAABA_COORDINATES.longitude - coords.longitude) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coords.latitude * Math.PI) / 180) *
      Math.cos((KAABA_COORDINATES.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};