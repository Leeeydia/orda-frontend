import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useKakaoLogin } from "../../features/auth/hooks/useAuth";

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { kakaoLogin } = useKakaoLogin(
    () => navigate("/"),
    () => navigate("/login")
  );

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      kakaoLogin(code);
    } else {
      navigate("/login");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page">
      <div className="flex flex-col items-center gap-4">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-sm text-text-muted">로그인 처리 중...</p>
      </div>
    </div>
  );
}