// src/pages/MapTestPage.tsx

import CommonMap from "../components/map/CommonMap";
import { sampleGeoJson } from "../mock/sampleGeoJson";
import Header from "@/components/layout/Header";
import ElevationChart from "@/components/ui/ElevationChart";

const MOCK_SVG_PATH =
  "M 0 100 C 20 90, 40 60, 80 50 C 120 40, 140 55, 160 45 C 180 35, 200 20, 240 25 C 280 30, 300 40, 320 35";

const MapTestPage = () => {
  return (
    <div className="bg-bg-page min-h-dvh">
      <div className="mx-auto min-h-dvh w-full max-w-[390px] bg-white">
        <Header />

        {/* 지도 영역 */}
        <div className="relative h-dvh pt-14">
          <CommonMap
            center={[127.3845, 36.3504]}
            zoom={11}
            className="absolute inset-0 h-full w-full"
            geoJsonData={sampleGeoJson}
            onMapReady={(map) => {
              console.log("지도 준비 완료", map);
            }}
          />
        </div>

        {/* ElevationChart 테스트 */}
        <div className="space-y-4 px-4 py-6">
          <p className="text-text-muted text-xs font-semibold">
            ElevationChart 테스트
          </p>

          {/* 데이터 있는 경우 */}
          <ElevationChart
            svgPath={MOCK_SVG_PATH}
            xAxisLabels={["0km", "1.2km", "2.4km", "3.6km"]}
            maxElevationMeters={847}
          />

          {/* 데이터 없는 경우 */}
          <ElevationChart
            svgPath=""
            xAxisLabels={["0km", "", "", ""]}
            isEmpty
          />
        </div>
      </div>
    </div>
  );
};

export default MapTestPage;
