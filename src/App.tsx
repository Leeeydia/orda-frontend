/**
 * 📄 src/App.tsx
 *
 * 변경 사항:
 *  - /hiking → HikingRecordPage로 교체 (HikingPage 제거)
 *  - /hiking/record 라우터 제거 (중복)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapTestPage from "./pages/MapTestPage";
import HikingRecordPage from "./pages/hiking/HikingRecordPage";
import HikingSessionDetailPage from "./pages/hiking/HikingSessionDetailPage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapTestPage />} />
        <Route path="/hiking" element={<HikingRecordPage />} />
        <Route
          path="/hiking/sessions/:sessionId"
          element={<HikingSessionDetailPage />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
