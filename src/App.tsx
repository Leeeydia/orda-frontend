import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapTestPage from "./pages/MapTestPage";
import HikingPage from "./pages/hiking/HikingPage"; // dev 기준 경로로 수정
import HikingSessionDetailPage from "./pages/hiking/HikingSessionDetailPage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import MyPage from "./pages/mypage/MyPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapTestPage />} />
        <Route path="/hiking" element={<HikingPage />} />
        <Route
          path="/hiking/sessions/:sessionId"
          element={<HikingSessionDetailPage />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} /> {/* 추가 */}
      </Routes>
    </BrowserRouter>
  );
}
