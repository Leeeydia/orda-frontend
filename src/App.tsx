import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HikingRecordPage from "./pages/hiking/HikingRecordPage";
import LoginPage from "./pages/auth/LoginPage";
import PageLoader from "./components/ui/PageLoader";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const HikingSessionDetailPage = lazy(
  () => import("./pages/hiking/HikingSessionDetailPage")
);
const HikingSessionReplayPage = lazy(
  () => import("./pages/hiking/HikingSessionReplayPage")
);
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const MyPage = lazy(() => import("./pages/mypage/MyPage"));
const EditProfilePage = lazy(() => import("./pages/mypage/EditProfilePage"));
const KakaoCallbackPage = lazy(
  () => import("./pages/auth/KakaoCallbackPage")
);
const GuidePage = lazy(() => import("./pages/guide/GuidePage"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HikingRecordPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route
            path="/hiking/sessions/:sessionId"
            element={
              <ProtectedRoute>
                <HikingSessionDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hiking/sessions/:sessionId/replay"
            element={
              <ProtectedRoute>
                <HikingSessionReplayPage />
              </ProtectedRoute>
            }
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
