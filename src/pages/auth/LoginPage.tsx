import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin, validate } from "../../features/auth/hooks/useAuth";
import type { LoginRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";

const INITIAL_FORM: LoginRequest = { email: "", password: "" };
const INITIAL_ERRORS = { email: "", password: "" };

export default function LoginPage() {
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
    (msg) => showToast(msg, "error")
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
    <div className="min-h-screen bg-[#f7f7f6] text-slate-900">
      <div className="mx-auto min-h-screen w-full max-w-md bg-[#f7f7f6]">
        <header className="sticky top-0 z-30 border-b border-[#89943d]/10 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="h-10 w-10" />
            <div className="flex flex-1 flex-col items-center px-2">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#89943d] uppercase">
                ORDA
              </p>
              <h1 className="text-base font-bold tracking-tight text-[#2f3415]">
                로그인
              </h1>
            </div>
            <div className="h-10 w-10" />
          </div>
        </header>

        <main className="px-4 pt-10 pb-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[#2f3415]">
              다시 산으로,
            </h2>
            <p className="mt-1 text-sm text-[#2f3415]">어서오세요</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
              className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#4a521e] to-[#89943d] text-[17px] font-bold tracking-wide text-white shadow-md transition active:scale-[0.98] active:opacity-90 disabled:opacity-55">
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "로그인"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            아직 계정이 없으신가요?{" "}
            <Link
              to="/signup"
              className="font-semibold text-[#4a521e] active:opacity-70">
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
}

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

function Field({
  label,
  name,
  type,
  placeholder,
  value,
  error,
  onChange,
  required
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-[11px] font-semibold tracking-[0.08em] text-[#89943d] uppercase">
        {label}
        {required && (
          <span className="ml-0.5 text-[#4a521e]" aria-hidden="true">
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
        className={`h-[52px] w-full rounded-2xl border bg-white px-4 text-[16px] text-slate-800 transition outline-none placeholder:text-slate-300 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
            : "border-[#89943d]/20 focus:border-[#89943d]/60 focus:ring-2 focus:ring-[#89943d]/10"
        }`}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="pl-1 text-[12px] text-red-500"
          role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
