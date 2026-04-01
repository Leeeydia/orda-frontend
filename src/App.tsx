import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapTestPage from "./pages/MapTestPage";
import HikingRecordPage from "./pages/hiking/HikingRecordPage";
import HikingSessionDetailPage from "./pages/hiking/HikingSessionDetailPage";
import HikingSessionReplayPage from "./pages/hiking/HikingSessionReplayPage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";
import MyPage from "./pages/mypage/MyPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapTestPage />} />
        <Route path="/hiking" element={<HikingRecordPage />} />
        <Route path="/hiking/sessions/:sessionId" element={<HikingSessionDetailPage />} />
        <Route path="/hiking/sessions/:sessionId/replay" element={<HikingSessionReplayPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </BrowserRouter>
  );
}