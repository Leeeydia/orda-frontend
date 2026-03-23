import type { FeatureCollection } from "geojson";

// 계룡산 동학사 → 은선폭포 → 관음봉 코스 (실제 근사 좌표)
export const sampleGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "동학사 주차장 (출발)" },
      geometry: {
        type: "Point",
        coordinates: [127.2069, 36.3477]
      }
    },
    {
      type: "Feature",
      properties: { name: "관음봉 (도착)" },
      geometry: {
        type: "Point",
        coordinates: [127.1993, 36.3666]
      }
    },
    {
      type: "Feature",
      properties: { name: "동학사 → 관음봉 등산로" },
      geometry: {
        type: "LineString",
        coordinates: [
          [127.2069, 36.3477], // 동학사 주차장
          [127.2055, 36.351], // 동학사
          [127.2035, 36.3548], // 천정골 탐방센터
          [127.2018, 36.358], // 은선폭포
          [127.2005, 36.361], // 관음봉 고개
          [127.1993, 36.3666] // 관음봉
        ]
      }
    }
  ]
};
