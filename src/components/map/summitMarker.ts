/**
 * 📄 src/components/map/summitMarker.ts
 *
 * 정상 마커 공통 유틸
 * - GpsTrackingMap: 등산 시작 시 주변 정상 표시 (해발 고도)
 * - HikingTrackSection: 세션 상세에서 인증된 정상 표시 (인증 시각)
 * - ReplayMapSection: 리플레이에서 인증된 정상 표시 (인증 시각)
 *
 * 마커 디자인과 팝업 스타일은 ORDA 디자인 시스템 기준으로 통일됨.
 * 팝업 스타일은 첫 렌더 시 document.head에 한 번만 주입되므로
 * 소비 컴포넌트에서 별도로 <style>을 추가할 필요가 없다.
 * 팝업 본문은 DOM node로 생성하여 summitName에 대한 XSS 위험을 방지한다.
 */

import type { MutableRefObject } from "react";
import maplibregl from "maplibre-gl";

export interface SummitMarkerData {
  summitId: string;
  summitName: string;
  latitude: number;
  longitude: number;
  elevationM?: number | null;
  verifiedAt?: string;
}

const POPUP_STYLE_ID = "orda-summit-popup-styles";

type SummitMarkerArrayRefs = MutableRefObject<maplibregl.Marker[]>;
type SummitMarkerMapRefs = MutableRefObject<Map<string, maplibregl.Marker>>;
type SummitMarkerRefs = SummitMarkerArrayRefs | SummitMarkerMapRefs;

const POPUP_STYLES = `
  .orda-summit-popup .maplibregl-popup-content {
    padding: 0;
    border-radius: 12px;
    border: 1px solid #D7DACB;
    background: #FFFFFF;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }
  .orda-summit-popup .maplibregl-popup-close-button {
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    font-size: 14px;
    line-height: 18px;
    color: #7A8070;
    border: none;
    background: none;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .orda-summit-popup .maplibregl-popup-close-button:hover {
    color: #4A521E;
    background: none;
  }
  .orda-summit-popup .maplibregl-popup-tip {
    border-top-color: #FFFFFF;
    margin-top: -1px;
  }
`;

function ensurePopupStylesInjected(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(POPUP_STYLE_ID)) return;

  const styleEl = document.createElement("style");
  styleEl.id = POPUP_STYLE_ID;
  styleEl.textContent = POPUP_STYLES;
  document.head.appendChild(styleEl);
}

function createSummitMarkerElement(): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.style.cssText =
    "width:26px;height:22px;padding:0;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(47,52,21,0.28))";
  el.innerHTML = `
    <svg width="26" height="22" viewBox="0 0 26 22" fill="none" aria-hidden="true">
      <path d="M13 2L24 20H2L13 2Z" fill="#BCB88A" stroke="#F7F7F6" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9.2 14.6L10.8 12.3L12.1 13.9L14.1 11.1L16.8 14.6" stroke="#F7F7F6" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  return el;
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatVerifiedAt(verifiedAt: string): string {
  const date = new Date(verifiedAt);
  if (Number.isNaN(date.getTime())) {
    return verifiedAt;
  }

  const y = date.getFullYear();
  const mo = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const h = pad2(date.getHours());
  const mi = pad2(date.getMinutes());

  return `${y}-${mo}-${d} ${h}:${mi}`;
}

function createSummitPopupNode(summit: SummitMarkerData): HTMLElement {
  const container = document.createElement("div");
  container.style.cssText =
    "padding:8px 24px 8px 12px;font-family:'Pretendard',-apple-system,sans-serif;white-space:nowrap;";

  const nameEl = document.createElement("div");
  nameEl.style.cssText =
    "font-size:13px;font-weight:600;color:#4A521E;line-height:18px;";
  nameEl.textContent = summit.summitName;
  container.appendChild(nameEl);

  let subText = "";
  if (summit.elevationM != null) {
    subText = `해발 ${summit.elevationM}m`;
  } else if (summit.verifiedAt) {
    subText = `인증 시각: ${formatVerifiedAt(summit.verifiedAt)}`;
  }

  if (subText) {
    const subEl = document.createElement("div");
    subEl.style.cssText =
      "margin-top:2px;font-size:11px;color:#7A8070;line-height:16px;";
    subEl.textContent = subText;
    container.appendChild(subEl);
  }

  return container;
}

function isMarkerMapRef(
  markerRefs: SummitMarkerRefs
): markerRefs is SummitMarkerMapRefs {
  return markerRefs.current instanceof Map;
}

function createSummitMarker(
  map: maplibregl.Map,
  summit: SummitMarkerData
): maplibregl.Marker {
  const markerEl = createSummitMarkerElement();
  const popupNode = createSummitPopupNode(summit);

  const popup = new maplibregl.Popup({
    offset: 14,
    closeButton: true,
    anchor: "bottom",
    maxWidth: "none",
    className: "orda-summit-popup"
  }).setDOMContent(popupNode);

  return new maplibregl.Marker({
    element: markerEl,
    anchor: "bottom",
    offset: [0, 2]
  })
    .setLngLat([summit.longitude, summit.latitude])
    .setPopup(popup)
    .addTo(map);
}

export function renderSummitMarkers(
  map: maplibregl.Map,
  summits: SummitMarkerData[],
  markerRefs: SummitMarkerRefs
): void {
  ensurePopupStylesInjected();

  if (!isMarkerMapRef(markerRefs)) {
    clearSummitMarkers(markerRefs);

    summits.forEach((summit) => {
      if (typeof summit.longitude !== "number") return;
      if (typeof summit.latitude !== "number") return;
      if (Number.isNaN(summit.longitude) || Number.isNaN(summit.latitude)) {
        return;
      }

      markerRefs.current.push(createSummitMarker(map, summit));
    });

    return;
  }

  const nextSummitsById = new Map<string, SummitMarkerData>();

  summits.forEach((summit) => {
    if (!summit.summitId) return;
    if (typeof summit.longitude !== "number") return;
    if (typeof summit.latitude !== "number") return;
    if (Number.isNaN(summit.longitude) || Number.isNaN(summit.latitude)) return;

    nextSummitsById.set(summit.summitId, summit);
  });

  markerRefs.current.forEach((marker, summitId) => {
    if (nextSummitsById.has(summitId)) return;

    marker.remove();
    markerRefs.current.delete(summitId);
  });

  nextSummitsById.forEach((summit, summitId) => {
    const lngLat: [number, number] = [summit.longitude, summit.latitude];
    const existingMarker = markerRefs.current.get(summitId);

    if (existingMarker) {
      existingMarker.setLngLat(lngLat);
      return;
    }

    markerRefs.current.set(summitId, createSummitMarker(map, summit));
  });
}

export function clearSummitMarkers(markerRefs: SummitMarkerRefs): void {
  if (isMarkerMapRef(markerRefs)) {
    markerRefs.current.forEach((marker) => marker.remove());
    markerRefs.current.clear();
    return;
  }

  markerRefs.current.forEach((marker) => marker.remove());
  markerRefs.current = [];
}