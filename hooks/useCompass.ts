
import { useState, useEffect, useCallback, useRef } from 'react';

interface CompassState {
  heading: number; // 0-360 degrees (True North)
  accuracy: number; // +/- degrees of uncertainty
  permissionGranted: boolean;
  needsCalibration: boolean;
  isReady: boolean;
}

export const useCompass = () => {
  const [state, setState] = useState<CompassState>({
    heading: 0,
    accuracy: 0,
    permissionGranted: false,
    needsCalibration: false,
    isReady: false,
  });

  // Rolling buffer for smoothing (removes jitter/irregularity)
  // Stores the last N readings to calculate an average vector
  const bufferSize = 10; 
  const historyRef = useRef<{sin: number, cos: number}[]>([]);
  const hasAbsoluteData = useRef(false);

  // Offset adjustment: User reported 180 degree inversion. 
  // We shift the raw sensor input by 180 degrees.
  const COMPASS_OFFSET = 180;

  const handleOrientation = useCallback((event: any) => {
    let rawHeading: number | null = null;
    let accuracy = 0;
    const isAbsolute = event.absolute || event.type === 'deviceorientationabsolute';

    // 1. iOS WebKit (Most accurate on iPhone)
    if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
      rawHeading = event.webkitCompassHeading;
      accuracy = event.webkitCompassAccuracy || 5;
    } 
    // 2. Android Absolute (Most accurate on Android)
    else if (isAbsolute && event.alpha !== null) {
      rawHeading = 360 - event.alpha;
      accuracy = 5; 
      hasAbsoluteData.current = true;
    }
    // 3. Fallback Relative (Only if we haven't seen absolute data yet)
    else if (event.alpha !== null && !hasAbsoluteData.current) {
       rawHeading = 360 - event.alpha;
       accuracy = 25; // Lower confidence
    }

    if (rawHeading !== null) {
       // Apply Offset (Fix 180 flip)
       rawHeading = (rawHeading + COMPASS_OFFSET) % 360;

       // Normalize 0-360
       if (rawHeading < 0) rawHeading += 360;
       if (rawHeading >= 360) rawHeading -= 360;

       // --- VECTOR SMOOTHING ALGORITHM ---
       // We cannot average degrees directly (average of 355° and 5° is 180°, which is wrong).
       // We must convert to vectors (sin/cos), average those, and convert back.
       
       const rad = (rawHeading * Math.PI) / 180;
       historyRef.current.push({ sin: Math.sin(rad), cos: Math.cos(rad) });

       // Keep buffer size constant
       if (historyRef.current.length > bufferSize) {
           historyRef.current.shift();
       }

       // Calculate Average Vector
       let sumSin = 0;
       let sumCos = 0;
       for (const v of historyRef.current) {
           sumSin += v.sin;
           sumCos += v.cos;
       }
       
       const avgSin = sumSin / historyRef.current.length;
       const avgCos = sumCos / historyRef.current.length;

       // Convert back to degrees (Atan2 handles the quadrants correctly)
       let smoothedHeading = (Math.atan2(avgSin, avgCos) * 180) / Math.PI;
       
       // Normalize again to 0-360
       if (smoothedHeading < 0) smoothedHeading += 360;

       // Determine calibration need based on browser reported accuracy
       // iOS reports -1 if uncalibrated, Android doesn't always report.
       const needsCal = accuracy < 0 || accuracy > 20;

       setState(prev => ({ 
           ...prev, 
           heading: smoothedHeading, 
           accuracy,
           needsCalibration: needsCal,
           isReady: true
       }));
    }
  }, []);

  const requestPermission = async () => {
    if (
      typeof (DeviceOrientationEvent as any) !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setState(prev => ({ ...prev, permissionGranted: true }));
        } else {
          alert('Toestemming geweigerd. Herlaad de app.');
        }
      } catch (error) {
        console.error("Compass permission error:", error);
      }
    } else {
      setState(prev => ({ ...prev, permissionGranted: true }));
    }
  };

  useEffect(() => {
    if (state.permissionGranted) {
        const handler = (e: any) => handleOrientation(e);

        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handler);
        }
        window.addEventListener('deviceorientation', handler);

        return () => {
            if ('ondeviceorientationabsolute' in window) {
                window.removeEventListener('deviceorientationabsolute', handler);
            }
            window.removeEventListener('deviceorientation', handler);
        };
    }
  }, [state.permissionGranted, handleOrientation]);

  return { 
      heading: state.heading, 
      accuracy: state.accuracy, 
      permissionGranted: state.permissionGranted, 
      needsCalibration: state.needsCalibration,
      isReady: state.isReady,
      requestPermission 
  };
};
