// src/pages/MapTestPage.tsx

import CommonMap from "../components/map/CommonMap";
import { sampleGeoJson } from "../mock/sampleGeoJson";
import Header from "@/components/layout/Header";

export default function MapTestPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-white">
      <Header />

      {/* 지도 영역 */}
      <div className="relative -mt-px flex-1">
        <CommonMap
          center={[127.3845, 36.3504]}
          zoom={11}
          className="absolute inset-0 h-full w-full"
          geoJsonData={sampleGeoJson}
          onMapReady={(map) => {
            console.log("지도 준비 완료", map);
          }}
        />
        {/* 경계선 페이드 오버레이 */}
        {/* <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-11 bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,0.95)_30%,rgba(255,255,255,0.70)_60%,rgba(255,255,255,0.22)_84%,rgba(255,255,255,0)_100%)]"
        /> */}
      </div>
    </div>
  );
}
