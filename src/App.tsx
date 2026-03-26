import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapTestPage from "./pages/MapTestPage";
import HikingPage from "./pages/hiking/HikingPage";
import HikingSessionDetailPage from "./pages/hiking/HikingSessionDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapTestPage />} />
        <Route path="/hiking" element={<HikingPage />} />
        <Route path="/hiking/sessions/:sessionId" element={<HikingSessionDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
