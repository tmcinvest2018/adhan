import { BehaviorSubject } from 'rxjs';
import { PrayerSettings } from '../../../types';

export class StateManagerService {
  private stateSubject = new BehaviorSubject<any>(this.loadInitialState());
  public state$ = this.stateSubject.asObservable();

  private loadInitialState(): any {
    // Load from localStorage or state.json
    const saved = localStorage.getItem('nur-settings');
    return saved ? JSON.parse(saved) : this.getDefaultState();
  }

  updateState(newState: Partial<any>): void {
    const currentState = this.stateSubject.value;
    const updatedState = { ...currentState, ...newState };
    this.stateSubject.next(updatedState);

    // Persist to localStorage
    localStorage.setItem('nur-settings', JSON.stringify(updatedState));
  }

  getState(): any {
    return this.stateSubject.value;
  }

  getDefaultState(): any {
    return {
      settings: {
        calculationMethod: 'MuslimWorldLeague',
        madhab: 'Shafi',
        language: 'en',
        useGPS: true,
        reciterId: 'ar.alafasy',
        notifications: {
          fajr: { enabled: true, soundEnabled: true, soundId: 'makkah' },
          sunrise: { enabled: true, soundEnabled: false, soundId: 'makkah' },
          dhuhr: { enabled: true, soundEnabled: true, soundId: 'makkah' },
          asr: { enabled: true, soundEnabled: true, soundId: 'makkah' },
          maghrib: { enabled: true, soundEnabled: true, soundId: 'makkah' },
          isha: { enabled: true, soundEnabled: true, soundId: 'makkah' },
        },
        quranVisuals: {
          fontStyle: 'uthmani',
          fontSize: 28,
          showTajweed: false
        }
      },
      onboarded: localStorage.getItem('nurprayer_onboarded') === 'true',
      lastRead: null,
      // ... other state properties
    };
  }
}