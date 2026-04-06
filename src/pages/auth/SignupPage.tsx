// src/pages/auth/SignupPage.tsx

import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignup } from "../../features/auth/hooks/useAuth";
import { validate } from "../../utils/validate";
import type { SignupRequest } from "../../features/auth/types/auth.types";
import Toast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Header from "../../components/layout/Header";
import BackButton from "../../components/layout/BackButton";
import AuthField from "../../features/auth/components/AuthField";

// ─── 타입 ─────────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

const SignupPage = () => {
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
    (msg: string) => showToast(msg, "error")
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
    <div className="bg-bg-page min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-[390px]">
        <Header title="회원가입" leftSlot={<BackButton />} />

        {/* Header fixed 높이 보정 */}
        <main className="px-4 pt-[76px] pb-20">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <AuthField
              label="이메일"
              name="email"
              type="email"
              placeholder=""
              value={form.email}
              error={errors.email}
              onChange={handleChange}
              required
            />
            <AuthField
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
              <AuthField
                label="닉네임"
                name="nickname"
                type="text"
                placeholder="2~10자"
                value={form.nickname}
                error={errors.nickname}
                onChange={handleChange}
                required
              />
              <AuthField
                label="이름"
                name="name"
                type="text"
                placeholder=""
                value={form.name}
                error={errors.name}
                onChange={handleChange}
                required
              />
            </div>
            <AuthField
              label="전화번호"
              name="phone"
              type="tel"
              placeholder=""
              value={form.phone}
              error={errors.phone}
              onChange={handlePhoneChange}
              required
            />
            <AuthField
              label="생년월일"
              name="birthDate"
              type="text"
              placeholder="YYYY-MM-DD (선택)"
              value={form.birthDate}
              error={errors.birthDate}
              onChange={handleBirthDateChange}
            />

            <Button type="submit" variant="primary" isLoading={loading}>
              가입하기
            </Button>
          </form>

          <p className="text-muted mt-6 text-center text-sm leading-5">
            이미 계정이 있으신가요?{" "}
            <Link
              to="/login"
              className="text-primary-dark font-semibold transition-colors duration-150 active:opacity-70">
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
};

export default SignupPage;
