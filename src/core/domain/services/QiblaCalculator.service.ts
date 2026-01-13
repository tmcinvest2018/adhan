import { UserLocation } from '../../../types';

export interface QiblaCalculatorService {
  calculateQiblaDirection(location: UserLocation): number;
  calculateDistanceToKaaba(location: UserLocation): number;
}