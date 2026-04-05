// src/pages/auth/LoginPage.tsx

import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin, validate } from "../../features/auth/hooks/useAuth";
import type { LoginRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";
import Header from "../../components/layout/Header";

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
            <Field
              label="이메일"
              name="email"
              type="email"
              placeholder="example@orda.com"
              value={form.email}
              error={errors.email}
              onChange={handleChange}
              required
            />
            <Field
              label="비밀번호"
              name="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={form.password}
              error={errors.password}
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="bg-primary hover:bg-primary-hover disabled:text-muted mt-2 h-12 w-full rounded-md px-6 text-sm font-semibold text-white transition-colors duration-150 active:opacity-60 disabled:cursor-not-allowed disabled:bg-[#D7DACB]">
              {loading ? (
                <span className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "로그인"
              )}
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

// ─── Field 서브컴포넌트 ────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  error: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const Field = ({
  label,
  name,
  type,
  placeholder,
  value,
  error,
  onChange,
  required
}: FieldProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-heading text-sm font-semibold">
        {label}
        {required && (
          <span className="text-primary ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
        className={`bg-secondary text-body placeholder:text-muted h-12 w-full rounded-md border px-4 text-base transition-colors duration-150 outline-none ${
          error
            ? "border-error focus:border-error focus:ring-error bg-white focus:ring-1"
            : "border-border-default focus:border-primary focus:ring-primary focus:bg-white focus:ring-1"
        }`}
      />

      {error && (
        <p
          id={`${name}-error`}
          className="text-error pl-1 text-xs leading-4"
          role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
