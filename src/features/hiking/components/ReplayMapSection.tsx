import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, LineString, Point } from "geojson";
import CommonMap from "@/components/map/CommonMap";
import type { ReplaySessionModel } from "../types/hiking.types";

type ReplayCurrentPosition = {
  lat: number;
  lng: number;
};

type ReplayMapSectionProps = {
  replay: ReplaySessionModel | null;
  currentPosition?: ReplayCurrentPosition | null;
};

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: []
};

function getReplayDisplayGeoJson(
  replay: ReplaySessionModel | null
): FeatureCollection {
  if (!replay || replay.lineCoordinates.length === 0) {
    return EMPTY_FEATURE_COLLECTION;
  }

  const features: FeatureCollection["features"] = [];

  if (replay.lineCoordinates.length >= 2) {
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: replay.lineCoordinates
      } satisfies LineString,
      properties: {
        type: "track-line"
      }
    });
  }

  const startPoint = replay.lineCoordinates[0];
  const endPoint = replay.lineCoordinates[replay.lineCoordinates.length - 1];

  features.push({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: startPoint
    } satisfies Point,
    properties: {
      type: "start-point"
    }
  });

  if (replay.lineCoordinates.length > 1) {
    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: endPoint
      } satisfies Point,
      properties: {
        type: "end-point"
      }
    });
  }

  return {
    type: "FeatureCollection",
    features
  };
}

function createReplayMarkerElement() {
  const wrapper = document.createElement("div");
  wrapper.style.width = "24px";
  wrapper.style.height = "24px";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.pointerEvents = "none";

  const outerRing = document.createElement("div");
  outerRing.style.width = "24px";
  outerRing.style.height = "24px";
  outerRing.style.borderRadius = "9999px";
  outerRing.style.background = "rgba(163, 190, 76, 0.22)";
  outerRing.style.border = "2px solid rgba(163, 190, 76, 0.45)";
  outerRing.style.display = "flex";
  outerRing.style.alignItems = "center";
  outerRing.style.justifyContent = "center";
  outerRing.style.boxShadow = "0 4px 14px rgba(47, 52, 21, 0.28)";

  const innerDot = document.createElement("div");
  innerDot.style.width = "12px";
  innerDot.style.height = "12px";
  innerDot.style.borderRadius = "9999px";
  innerDot.style.background = "#2F3415";
  innerDot.style.border = "3px solid #ffffff";
  innerDot.style.boxSizing = "border-box";

  outerRing.appendChild(innerDot);
  wrapper.appendChild(outerRing);

  return wrapper;
}

export default function ReplayMapSection({
  replay,
  currentPosition
}: ReplayMapSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const displayGeoJson = useMemo(() => {
    return getReplayDisplayGeoJson(replay);
  }, [replay]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !replay) return;

    const coords = replay.lineCoordinates;
    if (coords.length === 0) return;

    if (coords.length === 1) {
      mapRef.current.easeTo({
        center: coords[0],
        zoom: 15,
        duration: 800
      });
      return;
    }

    const bounds = coords.reduce(
      (acc, coord) => acc.extend(coord),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );

    mapRef.current.fitBounds(bounds, {
      padding: {
        top: 110,
        right: 24,
        bottom: 170,
        left: 24
      },
      duration: 800
    });
  }, [isMapReady, replay]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    if (!currentPosition) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const lngLat: [number, number] = [currentPosition.lng, currentPosition.lat];

    if (!markerRef.current) {
      const el = createReplayMarkerElement();

      markerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "center"
      })
        .setLngLat(lngLat)
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat(lngLat);
    }
  }, [isMapReady, currentPosition]);

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  if (!replay || replay.lineCoordinates.length === 0) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center">
        <div className="rounded-3xl border border-white/40 bg-white/88 px-5 py-4 shadow-sm backdrop-blur">
          <p className="text-base font-semibold text-[#4a521e]">
            표시할 리플레이 경로가 없습니다
          </p>
          <p className="mt-2 text-sm text-slate-600">
            저장된 리플레이 포인트가 있으면 이 영역에 경로가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(137,148,61,0.14),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(255,255,255,0.12),_rgba(255,255,255,0)_28%,_rgba(0,0,0,0.08)_100%)]" />

      <CommonMap
        geoJsonData={displayGeoJson}
        className="h-full w-full"
        showNavigationControl={false}
        lineColor="#89943d"
        lineWidth={5}
        pointColor="#4a521e"
        pointStrokeColor="#ffffff"
        pointRadius={6}
        startPointColor="#A3BE4C"
        endPointColor="#2F3415"
        startPointRadius={8}
        endPointRadius={8}
        onMapReady={(map) => {
          mapRef.current = map;
          setIsMapReady(true);

          setTimeout(() => {
            map.resize();
          }, 0);
        }}
      />
    </div>
  );
}