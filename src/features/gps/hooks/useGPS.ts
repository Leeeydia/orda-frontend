/**
 * 📄 src/features/gps/hooks/useGPS.ts
 *
 * 변경 사항:
 *  - start(): 첫 GPS fix 확보 시 resolve, 권한 거부/타임아웃 시 reject하는 Promise 반환
 *  - unmount 시 clearWatch cleanup 보장 (useEffect return)
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { FeatureCollection } from "geojson";
import type { GpsPoint, GpsState } from "../types/gps.types";

const EMPTY_GEOJSON: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

const calcDistanceKm = (trail: GpsPoint[]): number => {
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
};

const calcElevGain = (trail: GpsPoint[]): number => {
  const elevations = trail
    .map((p) => p.altitude)
    .filter((a): a is number => a != null);
  if (elevations.length < 2) return 0;
  let gain = 0;
  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1];
    if (diff > 0) gain += diff;
  }
  return Math.round(gain);
};

export const useGPS = (): GpsState & {
  geoJson: FeatureCollection;
  distanceKm: number;
  elevGain: number;
  currentAltitude: number | null;
  start: (onPoint?: (point: GpsPoint) => void) => Promise<void>;
  stop: () => void;
} => {
  const [currentPos, setCurrentPos] = useState<GpsPoint | null>(null);
  const [trail, setTrail] = useState<GpsPoint[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection>(EMPTY_GEOJSON);
  const [distanceKm, setDistanceKm] = useState(0);
  const [elevGain, setElevGain] = useState(0);

  const trailRef = useRef<GpsPoint[]>([]);
  const watchIdRef = useRef<number | null>(null);

  // unmount 시 GPS watch cleanup 보장
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

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
                  coordinates: trail.map((p) => [p.lng, p.lat]),
                },
                properties: {},
              },
            ]
          : []),
        {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [current.lng, current.lat],
          },
          properties: {},
        },
      ],
    });
  }, []);

  // 첫 GPS fix 확보 시 resolve, 실패 시 reject
  const start = useCallback(
    (onPoint?: (point: GpsPoint) => void): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          const msg = "GPS를 지원하지 않는 브라우저입니다.";
          setError(msg);
          reject(new Error(msg));
          return;
        }

        trailRef.current = [];
        setTrail([]);
        setDistanceKm(0);
        setElevGain(0);

        let isFirstFix = true;

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const point: GpsPoint = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              altitude: pos.coords.altitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            };

            trailRef.current.push(point);
            const newTrail = [...trailRef.current];

            setTrail(newTrail);
            setCurrentPos(point);
            setDistanceKm(calcDistanceKm(newTrail));
            setElevGain(calcElevGain(newTrail));
            updateGeoJson(newTrail, point);
            onPoint?.(point);

            // 첫 번째 fix에서 resolve
            if (isFirstFix) {
              isFirstFix = false;
              setIsTracking(true);
              setError(null);
              resolve();
            }
          },
          (err) => {
            setError(err.message);
            // 첫 fix 전 에러면 reject
            if (isFirstFix) {
              isFirstFix = false;
              reject(new Error(err.message));
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      });
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
    stop,
  };
};