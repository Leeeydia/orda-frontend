import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type CommonMapProps = {
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
  className?: string;
  onMapReady?: (map: maplibregl.Map) => void;
};

export default function CommonMap({
  center = [127.3845, 36.3504],
  zoom = 12,
  styleUrl = "https://demotiles.maplibre.org/style.json"
}: CommonMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center,
      zoom
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, styleUrl]);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
  );
}
