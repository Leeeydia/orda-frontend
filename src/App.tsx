import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapTestPage from "./pages/MapTestPage";
import HikingPage from "./pages/hiking/HikingPage";
import HikingSessionDetailPage from "./pages/hiking/HikingSessionDetailPage";
import SignupPage from "./pages/auth/SignupPage";
import LoginPage from "./pages/auth/LoginPage";

function HikingReplayPlaceholderPage() {
  return <div>3D 리플레이 페이지 준비 중</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapTestPage />} />
        <Route path="/hiking" element={<HikingPage />} />
        <Route path="/hiking/sessions/:sessionId" element={<HikingSessionDetailPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/hiking/sessions/:sessionId/replay" element={<HikingReplayPlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
