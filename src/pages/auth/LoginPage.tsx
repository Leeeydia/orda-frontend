import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin, validate } from "../../features/auth/hooks/useAuth";
import type { LoginRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";
import styles from "./LoginPage.module.css";

// ─── 초기값 & 타입 ────────────────────────────────────────────────────────────

const INITIAL_FORM: LoginRequest = {
  email: "",
  password: ""
};

const INITIAL_ERRORS = {
  email: "",
  password: ""
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

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
    () => {
      navigate("/");
    },
    (msg) => showToast(msg, "error")
  );

  // 필드 변경
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // 실시간 유효성 검증
    const key = name as keyof typeof INITIAL_ERRORS;
    if (validate[key]) {
      setErrors((prev) => ({ ...prev, [key]: validate[key](value) }));
    }
  }, []);

  // 제출
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
    <div className={styles.container}>
      {/* 배경 장식 */}
      <div className={styles.bgOrbs} aria-hidden="true">
        <span className={styles.orb1} />
        <span className={styles.orb2} />
        <span className={styles.orb3} />
      </div>

      <div className={styles.card}>
        {/* 헤더 */}
        <header className={styles.header}>
          <div className={styles.logo}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              aria-hidden="true">
              <path d="M18 3L33 30H3L18 3Z" fill="url(#logoGradLogin)" />
              <defs>
                <linearGradient
                  id="logoGradLogin"
                  x1="3"
                  y1="30"
                  x2="33"
                  y2="3"
                  gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4ADE80" />
                  <stop offset="1" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
            </svg>
            <span className={styles.logoText}>ORDA</span>
          </div>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>다시 산으로, 어서오세요</p>
        </header>

        {/* 폼 */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
            className={styles.submitBtn}
            disabled={loading}
            aria-busy={loading}>
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <p className={styles.signupLink}>
          아직 계정이 없으신가요?{" "}
          <Link to="/signup" className={styles.link}>
            회원가입
          </Link>
        </p>
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
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
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
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        required={required}
      />
      {error && (
        <p id={`${name}-error`} className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
