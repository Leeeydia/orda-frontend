/**
 * 📄 src/features/hiking/components/summitMarker.ts
 *
 * 정상 마커 공통 유틸
 * - GpsTrackingMap: 등산 시작 시 주변 정상 표시 (해발 고도)
 * - HikingTrackSection: 세션 상세에서 인증된 정상 표시 (인증 시각)
 * - ReplayMapSection: 리플레이에서 인증된 정상 표시 (인증 시각)
 *
 * 마커 디자인과 팝업 스타일은 ORDA 디자인 시스템 기준으로 통일됨.
 */

import maplibregl from "maplibre-gl";

export interface SummitMarkerData {
  summitId: string;
  summitName: string;
  latitude: number;
  longitude: number;
  elevationM?: number | null; // 있으면 "해발 Nm" 표시
  verifiedAt?: string; // 있으면 "인증 시각 XXXX" 표시
}

// ORDA 카드 스타일 팝업 CSS (컴포넌트에서 <style> 태그에 주입)
export const SUMMIT_POPUP_STYLES = `
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

// 삼각형 산 모양 마커 엘리먼트
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

// 인증 시각 포맷 (2026-04-15T16:30:00 → 2026-04-15 16:30:00)
function formatVerifiedAt(verifiedAt?: string): string {
  if (!verifiedAt) return "";
  return verifiedAt.replace("T", " ");
}

// 팝업 본문 HTML 생성
function createSummitPopupHtml(summit: SummitMarkerData): string {
  let subText = "";
  if (summit.elevationM != null) {
    subText = `해발 ${summit.elevationM}m`;
  } else if (summit.verifiedAt) {
    subText = `인증 시각: ${formatVerifiedAt(summit.verifiedAt)}`;
  }

  return `
    <div style="padding:8px 24px 8px 12px;font-family:'Pretendard',-apple-system,sans-serif;white-space:nowrap;">
      <div style="font-size:13px;font-weight:600;color:#4A521E;line-height:18px;">${summit.summitName}</div>
      ${subText ? `<div style="margin-top:2px;font-size:11px;color:#7A8070;line-height:16px;">${subText}</div>` : ""}
    </div>`;
}

// 지도에 정상 마커들 렌더링 (기존 마커 자동 제거 후 새로 그림)
export function renderSummitMarkers(
  map: maplibregl.Map,
  summits: SummitMarkerData[],
  markerRefs: React.MutableRefObject<maplibregl.Marker[]>
): void {
  clearSummitMarkers(markerRefs);

  summits.forEach((summit) => {
    if (
      typeof summit.longitude !== "number" ||
      typeof summit.latitude !== "number"
    ) {
      return;
    }

    const el = createSummitMarkerElement();
    const popupHtml = createSummitPopupHtml(summit);

    const popup = new maplibregl.Popup({
      offset: 14,
      closeButton: true,
      anchor: "bottom",
      maxWidth: "none",
      className: "orda-summit-popup"
    }).setHTML(popupHtml);

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

// 지도에서 정상 마커 모두 제거
export function clearSummitMarkers(
  markerRefs: React.MutableRefObject<maplibregl.Marker[]>
): void {
  markerRefs.current.forEach((marker) => marker.remove());
  markerRefs.current = [];
}