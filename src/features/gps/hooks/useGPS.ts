/**
 * 📄 src/features/gps/hooks/useGPS.ts
 *
 * 변경 사항:
 *  - distanceKm, elevGain, currentAltitude 계산 및 반환 추가
 */

import { useState, useRef, useCallback } from "react";
import type { FeatureCollection } from "geojson";
import type { GpsPoint, GpsState } from "../types/gps.types";

const EMPTY_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

function calcDistanceKm(trail: GpsPoint[]): number {
  if (trail.length < 2) return 0;
  const total = trail.reduce((acc, p, i) => {
    if (i === 0) return 0;
    const prev = trail[i - 1];
    const R = 6371;
    const dLat = ((p.lat - prev.lat) * Math.PI) / 180;
    const dLng = ((p.lng - prev.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((prev.lat * Math.PI) / 180) *
        Math.cos((p.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return acc + R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, 0);
  return +total.toFixed(2);
}

function calcElevGain(trail: GpsPoint[]): number {
  const elevations = trail
    .map((p) => p.altitude)
    .filter((a): a is number => a != null);
  if (elevations.length < 2) return 0;
  return Math.round(Math.max(...elevations) - Math.min(...elevations));
}

export function useGPS(): GpsState & {
  geoJson: FeatureCollection;
  distanceKm: number;
  elevGain: number;
  currentAltitude: number | null;
  start: (onPoint?: (point: GpsPoint) => void) => void;
  stop: () => void;
} {
  const [currentPos, setCurrentPos] = useState<GpsPoint | null>(null);
  const [trail, setTrail] = useState<GpsPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection>(EMPTY_GEOJSON);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elevGain, setElevGain] = useState(0);

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
      setDistanceKm(0);
      setElevGain(0);

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
          const newTrail = [...trailRef.current];

          setTrail(newTrail);
          setCurrentPos(point);
          setDistanceKm(calcDistanceKm(newTrail));
          setElevGain(calcElevGain(newTrail));
          updateGeoJson(newTrail, point);
          onPoint?.(point);
        },
        (err) => setError(err.message),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
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

  const currentAltitude =
    currentPos?.altitude != null ? Math.round(currentPos.altitude) : null;

  return {
    currentPos,
    trail,
    isTracking,
    error,
    geoJson,
    distanceKm,
    elevGain,
    currentAltitude,
    start,
    stop
  };
}
