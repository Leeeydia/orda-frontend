export interface TrailFeatureProperties {
  edgeId: number;
  difficulty: "easy" | "moderate" | "hard" | "very_hard" | "extreme";
  difficultyScore: number;
}

export interface TrailFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: TrailFeatureProperties;
}

export interface TrailGeoJson {
  type: "FeatureCollection";
  features: TrailFeature[];
}
