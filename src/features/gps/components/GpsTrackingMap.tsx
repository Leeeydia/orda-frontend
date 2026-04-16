/**
 * 📄 src/features/gps/components/GpsTrackingMap.tsx
 *
 * 변경 사항:
 *  - 사용하지 않는 props 제거 (isTracking, isLoading, error, savedPointCount, onStart, onStop)
 *  - 난이도 레이어 추가, onTrailLoaded prop 추가, 나침반 버튼 위치 조정
 *  - onMapReady prop 추가 (내 위치로 돌아오기 버튼용 map 인스턴스 전달)
 *  - 지도 이동/줌 시 bbox 기반 API 재호출로 변경
 *  - bbox 1.5배 여유분 적용
 *  - 줌 레벨 8 미만 시 등산로 레이어 숨김 + 안내 메시지 표시
 *  - currentPos 마커 추가
 *  - isTracking 시 배낭맨+마커 합성 엘리먼트로 교체
 *  - 줌 레벨 기반 배낭맨 크기 동적 조정
 *  - moveend 요청 경쟁 조건 방어 (AbortController)
 *  - 100대 명산 마커 표시 기능 추가 (mountains prop, onMountainClick prop)
 *  - 100대 명산 모드 시 bbox 등산로 대신 산 edgeIds 등산로 표시 (mountainTrailGeoJson prop)
 *  - 초기 줌 < 6일 때 마커 영구 미생성 버그 수정 (항상 생성 후 display로 제어)
 *  - mountainTrailGeoJson null 시 빈 FeatureCollection으로 소스 초기화
 *  - nearbySummits 정상 마커 표시 기능 추가
 *  - isMountainMode OFF 시 bbox 등산로 즉시 재조회
 */

import { useState, useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
import { getTrailDifficultyMapByBbox } from "@/features/trail/api/trailApi";
import type { TrailGeoJson } from "@/features/trail/types/trail.types";

import CommonMap from "@/components/map/CommonMap";
import type { FeatureCollection } from "geojson";
import type { GpsPoint } from "../types/gps.types";
import type { Top100Mountain } from "@/features/mountain/types/mountainTypes";
import type { NearbySummitItem } from "@/features/hiking/types/hiking.types";

const DIFFICULTY_COLOR_MAP: Record<string, string> = {
  easy: "#22c55e",
  moderate: "#84cc16",
  hard: "#eab308",
  very_hard: "#f97316",
  extreme: "#ef4444"
};
const TRAIL_SOURCE_ID = "trail-difficulty-source";
const TRAIL_LAYER_ID = "trail-difficulty-layer";
const MIN_ZOOM_FOR_TRAIL = 8;
const MIN_ZOOM_FOR_MOUNTAINS = 6;

const EMPTY_FEATURE_COLLECTION: TrailGeoJson = {
  type: "FeatureCollection",
  features: []
};

function createCurrentPosMarkerElement() {
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
  outerRing.style.background = "rgba(59, 130, 246, 0.22)";
  outerRing.style.border = "2px solid rgba(59, 130, 246, 0.45)";
  outerRing.style.display = "flex";
  outerRing.style.alignItems = "center";
  outerRing.style.justifyContent = "center";
  outerRing.style.boxShadow = "0 4px 14px rgba(47, 52, 21, 0.28)";

  const innerDot = document.createElement("div");
  innerDot.style.width = "12px";
  innerDot.style.height = "12px";
  innerDot.style.borderRadius = "9999px";
  innerDot.style.background = "#1d4ed8";
  innerDot.style.border = "3px solid #FFFFFF";
  innerDot.style.boxSizing = "border-box";

  outerRing.appendChild(innerDot);
  wrapper.appendChild(outerRing);
  return wrapper;
}

function getHikerSize(zoom: number): number {
  if (zoom < 10) return 24;
  if (zoom < 12) return 32;
  if (zoom < 14) return 40;
  return 48;
}

function createHikingMarkerElement(hikerIconUrl: string, size: number = 48) {
  const wrapper = document.createElement("div");
  wrapper.style.width = `${size}px`;
  wrapper.style.height = `${size}px`;
  wrapper.style.position = "relative";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.pointerEvents = "none";

  const img = document.createElement("img");
  img.src = hikerIconUrl;
  img.style.width = `${size}px`;
  img.style.height = `${size}px`;
  img.style.position = "absolute";

  const dotSize = Math.max(12, Math.round(size * 0.43));
  const innerSize = Math.max(6, Math.round(dotSize * 0.5));

  const outerRing = document.createElement("div");
  outerRing.style.width = `${dotSize}px`;
  outerRing.style.height = `${dotSize}px`;
  outerRing.style.borderRadius = "9999px";
  outerRing.style.background = "rgba(59, 130, 246, 0.22)";
  outerRing.style.border = "2px solid rgba(59, 130, 246, 0.45)";
  outerRing.style.display = "flex";
  outerRing.style.alignItems = "center";
  outerRing.style.justifyContent = "center";
  outerRing.style.boxShadow = "0 4px 14px rgba(47, 52, 21, 0.28)";
  outerRing.style.position = "absolute";
  outerRing.style.zIndex = "1";

  const innerDot = document.createElement("div");
  innerDot.style.width = `${innerSize}px`;
  innerDot.style.height = `${innerSize}px`;
  innerDot.style.borderRadius = "9999px";
  innerDot.style.background = "#1d4ed8";
  innerDot.style.border = "3px solid #FFFFFF";
  innerDot.style.boxSizing = "border-box";

  outerRing.appendChild(innerDot);
  wrapper.appendChild(outerRing);
  wrapper.appendChild(img);
  return wrapper;
}

function createMountainMarkerElement(name: string) {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.cursor = "pointer";
  wrapper.style.pointerEvents = "auto";

  const dot = document.createElement("div");
  dot.style.width = "10px";
  dot.style.height = "10px";
  dot.style.borderRadius = "9999px";
  dot.style.background = "#89943d";
  dot.style.border = "2px solid white";
  dot.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";

  const label = document.createElement("div");
  label.innerText = name;
  label.style.marginTop = "3px";
  label.style.fontSize = "11px";
  label.style.fontWeight = "700";
  label.style.color = "#4A521E";
  label.style.background = "white";
  label.style.borderRadius = "6px";
  label.style.padding = "2px 6px";
  label.style.boxShadow = "0 1px 4px rgba(0,0,0,0.15)";
  label.style.whiteSpace = "nowrap";

  wrapper.appendChild(dot);
  wrapper.appendChild(label);
  return wrapper;
}

interface Props {
  geoJson: FeatureCollection;
  currentPos: GpsPoint | null;
  isTracking?: boolean;
  hikerIconUrl?: string;
  nearbySummits?: NearbySummitItem[];
  onTrailLoaded?: () => void;
  onMapReady?: (map: maplibregl.Map) => void;
  mountains?: Top100Mountain[];
  onMountainClick?: (mountain: Top100Mountain) => void;
  mountainTrailGeoJson?: TrailGeoJson | null;
  isMountainMode?: boolean;
}

const GpsTrackingMap = ({
  geoJson,
  currentPos,
  isTracking = false,
  hikerIconUrl,
  nearbySummits = [],
  onTrailLoaded,
  onMapReady,
  mountains,
  onMountainClick,
  mountainTrailGeoJson,
  isMountainMode
}: Props) => {
  const [isTooFar, setIsTooFar] = useState(false);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const summitMarkerRefs = useRef<maplibregl.Marker[]>([]);
  const isTrackingRef = useRef(isTracking);
  const hikerIconUrlRef = useRef(hikerIconUrl);
  const mountainMarkersRef = useRef<maplibregl.Marker[]>([]);
  const isMountainModeRef = useRef(false);

  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  useEffect(() => {
    hikerIconUrlRef.current = hikerIconUrl;
  }, [hikerIconUrl]);

  // currentPos 변경 시 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !currentPos) return;

    const zoom = mapInstanceRef.current.getZoom();
    const size = getHikerSize(zoom);
    const el =
      isTracking && hikerIconUrl
        ? createHikingMarkerElement(hikerIconUrl, size)
        : createCurrentPosMarkerElement();

    if (markerRef.current) {
      markerRef.current.remove();
    }
    markerRef.current = new maplibregl.Marker({
      element: el,
      anchor: "center"
    })
      .setLngLat([currentPos.lng, currentPos.lat])
      .addTo(mapInstanceRef.current);
  }, [currentPos, isTracking, hikerIconUrl]);

  // mountains prop 변경 시 마커 갱신
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    mountainMarkersRef.current.forEach((m) => m.remove());
    mountainMarkersRef.current = [];

    isMountainModeRef.current = !!(mountains && mountains.length > 0);

    if (!mountains || mountains.length === 0) return;

    const zoom = map.getZoom();

    mountains.forEach((mountain) => {
      const el = createMountainMarkerElement(mountain.name);
      el.style.display = zoom >= MIN_ZOOM_FOR_MOUNTAINS ? "flex" : "none";
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([mountain.longitude, mountain.latitude])
        .addTo(map);
      el.addEventListener("click", () => onMountainClick?.(mountain));
      mountainMarkersRef.current.push(marker);
    });
  }, [mountains, onMountainClick]);

  // mountainTrailGeoJson 변경 시 소스 데이터 교체
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const source = map.getSource(TRAIL_SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (!source) return;

    if (mountainTrailGeoJson) {
      source.setData(mountainTrailGeoJson);
      if (map.getLayer(TRAIL_LAYER_ID)) {
        map.setLayoutProperty(TRAIL_LAYER_ID, "visibility", "visible");
      }
    } else {
      source.setData(EMPTY_FEATURE_COLLECTION);
    }
  }, [mountainTrailGeoJson]);

  // isMountainMode OFF 시 bbox 등산로 즉시 재조회
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    isMountainModeRef.current = !!isMountainMode;

    if (!isMountainMode) {
      const bounds = map.getBounds();
      const lngPad = (bounds.getEast() - bounds.getWest()) * 0.25;
      const latPad = (bounds.getNorth() - bounds.getSouth()) * 0.25;
      getTrailDifficultyMapByBbox(
        bounds.getWest() - lngPad,
        bounds.getSouth() - latPad,
        bounds.getEast() + lngPad,
        bounds.getNorth() + latPad
      )
        .then((data) => {
          const source = map.getSource(TRAIL_SOURCE_ID) as
            | maplibregl.GeoJSONSource
            | undefined;
          if (source) source.setData(data);
        })
        .catch(() => {});
    }
  }, [isMountainMode]);

  // nearbySummits 변경 시 정상 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    summitMarkerRefs.current.forEach((m) => m.remove());
    summitMarkerRefs.current = [];

    nearbySummits.forEach((summit) => {
      if (
        typeof summit.longitude !== "number" ||
        typeof summit.latitude !== "number"
      )
        return;

      const el = document.createElement("button");
      el.type = "button";
      el.style.cssText =
        "width:26px;height:22px;padding:0;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(47,52,21,0.28))";
      el.innerHTML = `
        <svg width="26" height="22" viewBox="0 0 26 22" fill="none" aria-hidden="true">
          <path d="M13 2L24 20H2L13 2Z" fill="#BCB88A" stroke="#F7F7F6" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M9.2 14.6L10.8 12.3L12.1 13.9L14.1 11.1L16.8 14.6" stroke="#F7F7F6" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

      const popupHtml = `
        <div style="font-size:12px;line-height:1.4;">
          <div style="font-weight:600;color:#2f3415;">${summit.summitName}</div>
          ${summit.elevationM != null ? `<div style="margin-top:4px;color:#64748b;">고도 ${summit.elevationM}m</div>` : ""}
        </div>`;

      const popup = new maplibregl.Popup({ offset: 14 }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
        offset: [0, 2]
      })
        .setLngLat([summit.longitude, summit.latitude])
        .setPopup(popup)
        .addTo(map);

      summitMarkerRefs.current.push(marker);
    });

    return () => {
      summitMarkerRefs.current.forEach((m) => m.remove());
      summitMarkerRefs.current = [];
    };
  }, [nearbySummits]);

  const handleMapReady = (map: maplibregl.Map) => {
    mapInstanceRef.current = map;

    let abortController: AbortController | null = null;

    const loadTrailByBbox = async () => {
      if (isMountainModeRef.current) return;

      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();
      const signal = abortController.signal;

      if (map.getZoom() < MIN_ZOOM_FOR_TRAIL) {
        if (map.getLayer(TRAIL_LAYER_ID)) {
          map.setLayoutProperty(TRAIL_LAYER_ID, "visibility", "none");
        }
        setIsTooFar(true);
        return;
      }

      setIsTooFar(false);
      if (map.getLayer(TRAIL_LAYER_ID)) {
        map.setLayoutProperty(TRAIL_LAYER_ID, "visibility", "visible");
      }

      const bounds = map.getBounds();
      const lngPad = (bounds.getEast() - bounds.getWest()) * 0.25;
      const latPad = (bounds.getNorth() - bounds.getSouth()) * 0.25;
      const minLng = bounds.getWest() - lngPad;
      const minLat = bounds.getSouth() - latPad;
      const maxLng = bounds.getEast() + lngPad;
      const maxLat = bounds.getNorth() + latPad;

      try {
        const data: TrailGeoJson = await getTrailDifficultyMapByBbox(
          minLng,
          minLat,
          maxLng,
          maxLat,
          signal
        );

        if (signal.aborted) return;

        const source = map.getSource(TRAIL_SOURCE_ID) as
          | maplibregl.GeoJSONSource
          | undefined;
        if (source) {
          source.setData(data);
        } else {
          map.addSource(TRAIL_SOURCE_ID, { type: "geojson", data });
          map.addLayer({
            id: TRAIL_LAYER_ID,
            type: "line",
            source: TRAIL_SOURCE_ID,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": [
                "match",
                ["get", "difficulty"],
                "easy",
                DIFFICULTY_COLOR_MAP.easy,
                "moderate",
                DIFFICULTY_COLOR_MAP.moderate,
                "hard",
                DIFFICULTY_COLOR_MAP.hard,
                "very_hard",
                DIFFICULTY_COLOR_MAP.very_hard,
                "extreme",
                DIFFICULTY_COLOR_MAP.extreme,
                "#cccccc"
              ],
              "line-width": 3,
              "line-opacity": 0.85
            }
          });
          onTrailLoaded?.();
        }
      } catch (e) {
        if (signal.aborted) return;
        console.error("trail bbox load error", e);
      }
    };

    const handleZoomForMountains = () => {
      const zoom = map.getZoom();
      mountainMarkersRef.current.forEach((m) => {
        const el = m.getElement();
        el.style.display = zoom >= MIN_ZOOM_FOR_MOUNTAINS ? "flex" : "none";
      });
    };

    loadTrailByBbox();
    map.on("moveend", loadTrailByBbox);
    map.on("zoom", handleZoomForMountains);

    // 줌 시 배낭맨 크기 동적 조정
    map.on("zoom", () => {
      if (
        !isTrackingRef.current ||
        !hikerIconUrlRef.current ||
        !markerRef.current
      )
        return;
      const zoom = map.getZoom();
      const size = getHikerSize(zoom);
      const el = createHikingMarkerElement(hikerIconUrlRef.current, size);
      const lngLat = markerRef.current.getLngLat();
      markerRef.current.remove();
      markerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "center"
      })
        .setLngLat(lngLat)
        .addTo(map);
    });

    onMapReady?.(map);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <style>{`.maplibregl-ctrl-top-right { top: 60px !important; }`}</style>
      <CommonMap
        geoJsonData={geoJson}
        center={currentPos ? [currentPos.lng, currentPos.lat] : undefined}
        className="h-full w-full"
        onMapReady={handleMapReady}
      />
      {isTooFar && !(mountains && mountains.length > 0) && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.6)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "13px",
            whiteSpace: "nowrap",
            pointerEvents: "none"
          }}>
          등산로를 보려면 지도를 확대하세요
        </div>
      )}
    </div>
  );
};

export default GpsTrackingMap;
