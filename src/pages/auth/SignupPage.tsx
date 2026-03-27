import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignup, validate } from "../../features/auth/hooks/useAuth";
import type { SignupRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";

// ─── 초기값 & 타입 ────────────────────────────────────────────────────────────

type FormFields = Omit<SignupRequest, "birthDate"> & { birthDate: string };

const INITIAL_FORM: FormFields = {
  email: "",
  password: "",
  nickname: "",
  name: "",
  phone: "",
  birthDate: ""
};

const INITIAL_ERRORS: Record<keyof FormFields, string> = {
  email: "",
  password: "",
  nickname: "",
  name: "",
  phone: "",
  birthDate: ""
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormFields>(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const { signup, loading } = useSignup(
    () => {
      showToast("회원가입이 완료되었습니다! 로그인 해주세요.", "success");
      setTimeout(() => navigate("/login"), 1500);
    },
    (msg) => showToast(msg, "error")
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const key = name as keyof FormFields;
    if (validate[key]) {
      setErrors((prev) => ({ ...prev, [key]: validate[key](value) }));
    }
  }, []);

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
      let formatted = raw;
      if (raw.length > 7)
        formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
      else if (raw.length > 3) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
      setForm((prev) => ({ ...prev, phone: formatted }));
      setErrors((prev) => ({ ...prev, phone: validate.phone(formatted) }));
    },
    []
  );

  const handleBirthDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
      let formatted = raw;
      if (raw.length > 6)
        formatted = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6)}`;
      else if (raw.length > 4) formatted = `${raw.slice(0, 4)}-${raw.slice(4)}`;
      setForm((prev) => ({ ...prev, birthDate: formatted }));
      setErrors((prev) => ({
        ...prev,
        birthDate: validate.birthDate(formatted)
      }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: validate.email(form.email),
      password: validate.password(form.password),
      nickname: validate.nickname(form.nickname),
      name: validate.name(form.name),
      phone: validate.phone(form.phone),
      birthDate: validate.birthDate(form.birthDate)
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e !== "")) return;
    const payload: SignupRequest = { ...form };
    if (!form.birthDate) delete payload.birthDate;
    await signup(payload);
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
                회원가입
              </h1>
            </div>
            <div className="h-10 w-10" />
          </div>
        </header>

        <main className="px-4 pt-6 pb-10">
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
              placeholder="8자 이상, 영문+숫자+특수문자"
              value={form.password}
              error={errors.password}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="닉네임"
                name="nickname"
                type="text"
                placeholder="2~10자"
                value={form.nickname}
                error={errors.nickname}
                onChange={handleChange}
                required
              />
              <Field
                label="이름"
                name="name"
                type="text"
                placeholder="홍길동"
                value={form.name}
                error={errors.name}
                onChange={handleChange}
                required
              />
            </div>
            <Field
              label="전화번호"
              name="phone"
              type="tel"
              placeholder="010-0000-0000"
              value={form.phone}
              error={errors.phone}
              onChange={handlePhoneChange}
              required
            />
            <Field
              label="생년월일"
              name="birthDate"
              type="text"
              placeholder="YYYY-MM-DD (선택)"
              value={form.birthDate}
              error={errors.birthDate}
              onChange={handleBirthDateChange}
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-2 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#4a521e] to-[#89943d] text-[17px] font-bold tracking-wide text-white shadow-md transition active:scale-[0.98] active:opacity-90 disabled:opacity-55">
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "가입하기"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="font-semibold text-[#4a521e] active:opacity-70">
              로그인
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
