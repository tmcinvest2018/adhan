
import { useState, useEffect, useCallback, useRef } from 'react';

interface CompassState {
  heading: number; 
  accuracy: number; 
  pitch: number; // Kanteling voor/achter
  roll: number;  // Kanteling links/rechts
  permissionGranted: boolean;
  needsCalibration: boolean;
  isReady: boolean;
}

export const useCompass = () => {
  const [state, setState] = useState<CompassState>({
    heading: 0,
    accuracy: 0,
    pitch: 0,
    roll: 0,
    permissionGranted: false,
    needsCalibration: false,
    isReady: false,
  });

  const bufferSize = 25; 
  const historyRef = useRef<{sin: number, cos: number}[]>([]);
  const hasAbsoluteData = useRef(false);

  const handleOrientation = useCallback((event: any) => {
    let rawHeading: number | null = null;
    let accuracy = event.webkitCompassAccuracy || 10;
    
    // Kanteling ophalen (voor de waterpas)
    const pitch = event.beta || 0; 
    const roll = event.gamma || 0;

    // 1. iOS Check
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      rawHeading = event.webkitCompassHeading;
    } 
    // 2. Android Absolute Check
    else if (event.absolute && event.alpha !== null) {
      rawHeading = 360 - event.alpha;
      hasAbsoluteData.current = true;
    }
    // 3. Fallback
    else if (event.alpha !== null && !hasAbsoluteData.current) {
       rawHeading = 360 - event.alpha;
    }

    if (rawHeading !== null) {
       // Vector Smoothing
       const rad = (rawHeading * Math.PI) / 180;
       historyRef.current.push({ sin: Math.sin(rad), cos: Math.cos(rad) });
       if (historyRef.current.length > bufferSize) historyRef.current.shift();

       let sumSin = 0; let sumCos = 0;
       for (const v of historyRef.current) { sumSin += v.sin; sumCos += v.cos; }
       
       const avgSin = sumSin / historyRef.current.length;
       const avgCos = sumCos / historyRef.current.length;
       let smoothedHeading = (Math.atan2(avgSin, avgCos) * 180) / Math.PI;
       if (smoothedHeading < 0) smoothedHeading += 360;

       setState(prevState => ({
           ...prevState,
           heading: smoothedHeading,
           accuracy,
           pitch,
           roll,
           needsCalibration: accuracy > 30 || accuracy === -1,
           isReady: true
       }));
    }
  }, []);

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const res = await (DeviceOrientationEvent as any).requestPermission();
      if (res === 'granted') setState(p => ({ ...p, permissionGranted: true }));
    } else {
      setState(p => ({ ...p, permissionGranted: true }));
    }
  };

  useEffect(() => {
    if (state.permissionGranted) {
        window.addEventListener('deviceorientation', handleOrientation, true);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [state.permissionGranted, handleOrientation]);

  return { ...state, requestPermission };
};
