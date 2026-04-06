// src/pages/auth/LoginPage.tsx

import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "../../features/auth/hooks/useAuth";
import { validate } from "../../utils/validate";
import type { LoginRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Header from "../../components/layout/Header";
import AuthField from "../../features/auth/components/AuthField";

const INITIAL_FORM: LoginRequest = { email: "", password: "" };
const INITIAL_ERRORS = { email: "", password: "" };

// ─── Page ─────────────────────────────────────────────────────────────────────

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginRequest>(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

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

  return (
    <div className="bg-bg-page min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-[390px]">
        <Header />

        {/* Header fixed 높이 보정 */}
        <main className="px-4 pt-[76px] pb-20">
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
