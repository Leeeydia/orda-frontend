import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useLogin } from "../../features/auth/hooks/useAuth";
import { validate } from "../../utils/validate";
import type { LoginRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Header, { HEADER_HEIGHT } from "../../components/layout/Header";
import AuthField from "../../features/auth/components/AuthField";

const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

const INITIAL_FORM: LoginRequest = { email: "", password: "" };
const INITIAL_ERRORS = { email: "", password: "" };

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<LoginRequest>(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  useEffect(() => {
    const errorMessage = location.state?.errorMessage;
    if (errorMessage) {
      setToast({ message: errorMessage, type: "error" });
    }
  }, [location.state]);

  const { login, loading } = useLogin(
    () => navigate("/"),
    (msg: string) => showToast(msg, "error")
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const key = name as keyof typeof INITIAL_ERRORS;
    if (validate[key]) {
      setErrors((prev) => ({ ...prev, [key]: validate[key](value) }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: validate.email(form.email),
      password: validate.password(form.password)
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e !== "")) return;
    await login(form);
  };

  const handleKakaoLogin = () => {
    const state = crypto.randomUUID();
    sessionStorage.setItem("kakao_oauth_state", state);

    window.location.href =
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${KAKAO_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
      `&response_type=code` +
      `&state=${state}`;
  };

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-[390px]">
        <Header />

        <main className="px-4 pb-20" style={{ paddingTop: HEADER_HEIGHT + 12 }}>
          <form onSubmit={handleSubmit} noValidate className="mt-12 space-y-4">
            <AuthField
              label="이메일"
              name="email"
              type="email"
              placeholder="example@orda.com"
              value={form.email}
              error={errors.email}
              onChange={handleChange}
              required
            />
            <AuthField
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={form.password}
              error={errors.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" variant="primary" isLoading={loading}>
              로그인
            </Button>

            <div className="flex items-center gap-3">
              <div className="bg-border-default h-px flex-1" />
              <span className="text-text-muted text-xs">또는</span>
              <div className="bg-border-default h-px flex-1" />
            </div>

            <button
              type="button"
              onClick={handleKakaoLogin}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-6 py-4 text-sm font-semibold text-[#191919] transition-colors duration-150 hover:bg-[#F0D900] active:opacity-60">
              카카오로 시작하기
            </button>
          </form>

          <p className="text-muted mt-6 text-center text-sm leading-5">
            아직 계정이 없으신가요?{" "}
            <Link
              to="/signup"
              className="text-primary-dark font-semibold transition-colors duration-150 active:opacity-70">
              회원가입
            </Link>
          </p>
        </main>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default LoginPage;
