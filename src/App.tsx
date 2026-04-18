import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HikingRecordPage from "./pages/hiking/HikingRecordPage";
import LoginPage from "./pages/auth/LoginPage";
import PageLoader from "./components/ui/PageLoader";

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
            element={<HikingSessionDetailPage />}
          />
          <Route
            path="/hiking/sessions/:sessionId/replay"
            element={<HikingSessionReplayPage />}
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/mypage/edit-profile" element={<EditProfilePage />} />
          <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
