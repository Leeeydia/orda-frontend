import { useState, useRef, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import type { GpsPoint, GpsState } from "../types/gps.types";

const EMPTY_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

export function useGPS(): GpsState & {
  geoJson: FeatureCollection;
  start: (onPoint?: (point: GpsPoint) => void) => void;
  stop: () => void;
} {
  const [currentPos, setCurrentPos] = useState<GpsPoint | null>(null);
  const [trail, setTrail] = useState<GpsPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection>(EMPTY_GEOJSON);

  const trailRef = useRef<GpsPoint[]>([]);
  const watchIdRef = useRef<number | null>(null);

  const updateGeoJson = useCallback((trail: GpsPoint[], current: GpsPoint) => {
    setGeoJson({
      type: "FeatureCollection",
      features: [
        ...(trail.length >= 2
          ? [
              {
                type: "Feature" as const,
                geometry: {
                  type: "LineString" as const,
                  coordinates: trail.map((p) => [p.lng, p.lat])
                },
                properties: {}
              }
            ]
          : []),
        {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [current.lng, current.lat]
          },
          properties: {}
        }
      ]
    });
  }, []);

  const start = useCallback(
    (onPoint?: (point: GpsPoint) => void) => {
      if (!navigator.geolocation) {
        setError("GPS를 지원하지 않는 브라우저입니다.");
        return;
      }

      trailRef.current = [];
      setTrail([]);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const point: GpsPoint = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            altitude: pos.coords.altitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp
          };
          console.log("📍 GPS 수신:", point);
          trailRef.current.push(point);
          setTrail([...trailRef.current]);
          setCurrentPos(point);
          updateGeoJson(trailRef.current, point);
          onPoint?.(point);
        },
        (err) => setError(err.message),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000
        }
      );

      setIsTracking(true);
      setError(null);
    },
    [updateGeoJson]
  );

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  return {
    currentPos,
    trail,
    isTracking,
    error,
    geoJson,
    start,
    stop
  };
}
