import CommonMap from "../components/map/CommonMap";
import { sampleGeoJson } from "../mock/sampleGeoJson";

export default function MapTestPage() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <CommonMap
        center={[127.3845, 36.3504]}
        zoom={11}
        className="h-full w-full"
        geoJsonData={sampleGeoJson}
        onMapReady={(map) => {
          console.log("지도 준비 완료", map);
        }}
      />
    </div>
  );
}
