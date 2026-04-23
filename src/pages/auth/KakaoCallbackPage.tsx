import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useKakaoLogin } from "../../features/auth/hooks/useAuth";

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const called = useRef(false);

  const { kakaoLogin } = useKakaoLogin(
    () => navigate("/hiking"),
    (msg: string) => navigate("/login", { state: { errorMessage: msg } })
  );

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const savedState = sessionStorage.getItem("kakao_oauth_state");

    if (!code || !state || state !== savedState) {
      navigate("/login");
      return;
    }

    sessionStorage.removeItem("kakao_oauth_state");
    kakaoLogin(code);
    // 카카오 OAuth code는 1회성 토큰이라 재호출 시 서버가 실패 처리한다.
    // called ref 가드로 마운트당 1회만 실행되므로 deps는 의도적으로 비움.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-bg-page flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="border-primary/30 border-t-primary h-8 w-8 animate-spin rounded-full border-2" />
        <p className="text-text-muted text-sm">로그인 처리 중...</p>
      </div>
    </div>
  );
}
