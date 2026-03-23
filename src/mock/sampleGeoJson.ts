import type { FeatureCollection } from "geojson";

export const sampleGeoJson: FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "출발 지점"
      },
      geometry: {
        type: "Point",
        coordinates: [127.3845, 36.3504]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "중간 지점"
      },
      geometry: {
        type: "Point",
        coordinates: [127.39, 36.355]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "테스트 등산로"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [127.3845, 36.3504],
          [127.387, 36.352],
          [127.39, 36.355],
          [127.393, 36.358]
        ]
      }
    }
  ]
};
