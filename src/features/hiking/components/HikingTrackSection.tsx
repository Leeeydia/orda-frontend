import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import CommonMap from "@/components/map/CommonMap";
import {
  getTrackBounds,
  mapTrackFeaturesToDisplayGeoJson
} from "../mappers/hikingMappers";
import type {
  HikingTrackFeatureCollection,
  SummitMarkerItem
} from "../types/hiking.types";

type HikingTrackSectionProps = {
  tracks: HikingTrackFeatureCollection | null;
  verifiedSummits?: SummitMarkerItem[];
};

function createSummitMarkerElement() {
  const el = document.createElement("button");
  el.type = "button";
  el.style.width = "26px";
  el.style.height = "22px";
  el.style.padding = "0";
  el.style.border = "none";
  el.style.background = "transparent";
  el.style.cursor = "pointer";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.filter = "drop-shadow(0 2px 4px rgba(47, 52, 21, 0.28))";

  el.innerHTML = `
    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" aria-hidden="true">
      <path
        d="M13 2L24 20H2L13 2Z"
        fill="#BCB88A"
        stroke="#F7F7F6"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
      <path
        d="M9.2 14.6L10.8 12.3L12.1 13.9L14.1 11.1L16.8 14.6"
        stroke="#F7F7F6"
        stroke-width="1.35"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  return el;
}

function clearSummitMarkers(
  markerRefs: React.MutableRefObject<maplibregl.Marker[]>
) {
  markerRefs.current.forEach((marker) => marker.remove());
  markerRefs.current = [];
}

function formatVerifiedAt(verifiedAt?: string) {
  if (!verifiedAt) return "";
  return verifiedAt.replace("T", " ");
}

function renderSummitMarkers(
  map: maplibregl.Map,
  markers: SummitMarkerItem[],
  markerRefs: React.MutableRefObject<maplibregl.Marker[]>
) {
  clearSummitMarkers(markerRefs);

  markers.forEach((summit) => {
    if (
      typeof summit.longitude !== "number" ||
      typeof summit.latitude !== "number"
    ) {
      return;
    }

    const el = createSummitMarkerElement();

    const popupHtml = `
      <div style="font-size:12px; line-height:1.4;">
        <div style="font-weight:600; color:#4A521E;">${summit.summitName}</div>
        ${
          summit.verifiedAt
            ? `<div style="margin-top:4px; color:#7A8070;">인증 시각: ${formatVerifiedAt(summit.verifiedAt)}</div>`
            : ""
        }
      </div>
    `;

    const popup = new maplibregl.Popup({ offset: 14 }).setHTML(popupHtml);

    const marker = new maplibregl.Marker({
      element: el,
      anchor: "bottom",
      offset: [0, 2]
    })
      .setLngLat([summit.longitude, summit.latitude])
      .setPopup(popup)
      .addTo(map);

    markerRefs.current.push(marker);
  });
}

export default function HikingTrackSection({
  tracks,
  verifiedSummits = []
}: HikingTrackSectionProps) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const summitMarkerRefs = useRef<maplibregl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const displayGeoJson = useMemo(() => {
    return mapTrackFeaturesToDisplayGeoJson(tracks);
  }, [tracks]);

  const bounds = useMemo(() => {
    return getTrackBounds(tracks);
  }, [tracks]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !bounds) return;

    mapRef.current.resize();
    mapRef.current.fitBounds(bounds, {
      padding: {
        top: 96,
        right: 24,
        bottom: 260,
        left: 24
      },
      duration: 800
    });
  }, [isMapReady, bounds]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    renderSummitMarkers(mapRef.current, verifiedSummits, summitMarkerRefs);

    return () => {
      clearSummitMarkers(summitMarkerRefs);
    };
  }, [isMapReady, verifiedSummits]);

  if (!tracks || tracks.features.length === 0) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-heading text-base font-semibold">
            표시할 트랙이 없습니다
          </p>
          <p className="text-body/80 mt-2 text-sm">
            저장된 GPS 트랙이 있으면 이 영역에 경로가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0">
      <CommonMap
        geoJsonData={displayGeoJson}
        className="h-full w-full"
        showNavigationControl={false}
        lineColor="#89943D"
        lineWidth={5}
        pointColor="#4A521E"
        pointStrokeColor="#F7F7F6"
        pointRadius={6}
        startPointColor="#A3BE4C"
        endPointColor="#4A521E"
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