import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignup, validate } from "../../features/auth/hooks/useAuth";
import type { SignupRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";
import styles from "./SignupPage.module.css";

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

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

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

  // 필드 변경
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // 실시간 유효성 검증
    const key = name as keyof FormFields;
    if (validate[key]) {
      setErrors((prev) => ({ ...prev, [key]: validate[key](value) }));
    }
  }, []);

  // 전화번호 자동 하이픈
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

  // 생년월일 자동 하이픈
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

  // 제출
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
    <div className={styles.container}>
      <div className={styles.bgOrbs} aria-hidden="true">
        <span className={styles.orb1} />
        <span className={styles.orb2} />
        <span className={styles.orb3} />
      </div>

      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              aria-hidden="true">
              <path d="M18 3L33 30H3L18 3Z" fill="url(#logoGrad)" />
              <defs>
                <linearGradient
                  id="logoGrad"
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
          <h1 className={styles.title}>회원가입</h1>
          <p className={styles.subtitle}>산을 오르듯, 한 걸음씩 시작해요</p>
        </header>

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
            placeholder="8자 이상, 영문+숫자+특수문자"
            value={form.password}
            error={errors.password}
            onChange={handleChange}
            required
          />
          <div className={styles.row}>
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
            label="생년월일 (선택)"
            name="birthDate"
            type="text"
            placeholder="YYYY-MM-DD"
            value={form.birthDate}
            error={errors.birthDate}
            onChange={handleBirthDateChange}
          />

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            aria-busy={loading}>
            {loading ? (
              <span className={styles.spinner} aria-hidden="true" />
            ) : (
              "가입하기"
            )}
          </button>
        </form>

        <p className={styles.loginLink}>
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className={styles.link}>
            로그인
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
