import { BrowserRouter, Routes, Route } from "react-router-dom";
import MapTestPage from "./pages/MapTestPage";
import HikingPage from "./pages/HikingPage";
import SignupPage from "./pages/auth/SignupPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapTestPage />} />
        <Route path="/hiking" element={<HikingPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}
