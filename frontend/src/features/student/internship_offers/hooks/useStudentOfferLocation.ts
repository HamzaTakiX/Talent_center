import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import {
  resolveLocationCoordinates,
  type GeoPoint,
} from '../helpers/internshipOfferDistance';

export type StudentLocationSource = 'gps' | 'profile' | 'none';

export interface StudentOfferLocation {
  point: GeoPoint | null;
  source: StudentLocationSource;
  label: string | null;
  loading: boolean;
  gpsDenied: boolean;
}

export function useStudentOfferLocation(): StudentOfferLocation {
  const { user } = useAuth();
  const profileCity = user?.student_profile?.city?.trim() ?? '';
  const [gpsPoint, setGpsPoint] = useState<GeoPoint | null>(null);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  const profilePoint = useMemo(
    () => (profileCity ? resolveLocationCoordinates(profileCity) : null),
    [profileCity],
  );

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setGpsPoint({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsDenied(false);
        setLoading(false);
      },
      () => {
        if (cancelled) return;
        setGpsDenied(true);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300_000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (gpsPoint) {
    return {
      point: gpsPoint,
      source: 'gps',
      label: profileCity || null,
      loading: false,
      gpsDenied,
    };
  }

  if (profilePoint) {
    return {
      point: profilePoint,
      source: 'profile',
      label: profileCity,
      loading,
      gpsDenied,
    };
  }

  return {
    point: null,
    source: 'none',
    label: profileCity || null,
    loading,
    gpsDenied,
  };
}
