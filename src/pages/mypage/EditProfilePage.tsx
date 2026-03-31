// src/pages/mypage/EditProfilePage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEditProfile from "../../features/mypage/hooks/useEditProfile";
// [수정] validate 재사용 - 닉네임/전화번호/비밀번호 검증 공용 함수 import
import { validate } from "../../features/auth/hooks/useAuth";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const {
    profile,
    loading,
    error,
    initialNickname,
    initialPhone,
    handleUpdateProfile,
    handleChangePassword
  } = useEditProfile();

  const [form, setForm] = useState({
    nickname: initialNickname,
    phone: initialPhone
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // [수정] 프로필 에러: 필드별 분리 (기존 profileMsg 단일 상태 → 닉네임/전화번호 개별 상태)
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // [수정] 비밀번호 에러: 필드별 분리 (기존 passwordMsg 단일 상태 → 각 필드 개별 상태)
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // ── 프로필 수정 제출 ──────────────────────────────────────────────
  const handleProfileSubmit = async () => {
    // [수정] 단일 에러 메시지 대신 필드별 validate 함수로 검증
    setNicknameError(null);
    setPhoneError(null);
    setProfileSuccess(null);

    // [수정] validate 결과를 서비스 친화적 문구로 오버라이드 (useAuth.ts 문구는 회원가입용)
    const nickErr = validate.nickname(form.nickname)
      ? "닉네임은 2~10자로 입력해 주세요."
      : "";
    const phoneErr = validate.phone(form.phone)
      ? "올바른 휴대폰 번호를 입력해 주세요."
      : "";

    if (nickErr) setNicknameError(nickErr);
    if (phoneErr) setPhoneError(phoneErr);
    if (nickErr || phoneErr) return;

    const result = await handleUpdateProfile({
      nickname: form.nickname,
      phone: form.phone
    });
    if (result.success) {
      setProfileSuccess("프로필이 수정되었습니다.");
    } else {
      // 서버 에러는 닉네임 아래에 표시
      setNicknameError(result.message ?? "수정에 실패했습니다.");
    }
  };

  // ── 비밀번호 변경 제출 ────────────────────────────────────────────
  const handlePasswordSubmit = async () => {
    // [수정] 비밀번호 유효성 검사 강화 및 필드별 에러 분리
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    setPasswordSuccess(null);

    let hasError = false;

    // [수정] 현재 비밀번호와 새 비밀번호 동일 여부 프론트 1차 체크
    if (currentPassword === newPassword) {
      setNewPasswordError(
        "현재 비밀번호와 동일합니다. 다른 비밀번호를 입력해 주세요."
      );
      hasError = true;
    }

    // [수정] 기존 length < 8 단순 체크 → validate.password로 교체, 문구는 서비스 친화적으로 오버라이드
    const passwordErr = validate.password(newPassword)
      ? "비밀번호는 영문, 숫자, 특수문자(!@#$%^&*)를 포함하여 8자 이상 입력해 주세요."
      : "";
    if (passwordErr && !hasError) {
      setNewPasswordError(passwordErr);
      hasError = true;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("새 비밀번호가 일치하지 않습니다.");
      hasError = true;
    }

    if (hasError) return;

    const result = await handleChangePassword({ currentPassword, newPassword });
    if (result.success) {
      setPasswordSuccess("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setNewPasswordError(result.message ?? "비밀번호 변경에 실패했습니다.");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#89943d] border-t-transparent" />
          <p className="text-sm font-medium tracking-wide text-[#89943d]">
            불러오는 중...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f6]">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white"
      style={{ maxWidth: 390, margin: "0 auto" }}>
      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-50 bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center text-slate-900">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold tracking-tight text-slate-900">
          개인 정보 수정
        </h1>
        <div className="h-10 w-10" />
      </header>

      {/* ── 컨텐츠 ── */}
      <div className="flex flex-col gap-5 px-6 pt-6 pb-40">
        {/* ── 읽기 전용 정보 ── */}
        <section>
          <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">
            기본 정보
          </p>
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-[#f7f7f6]">
            <InfoRow label="이름" value={profile?.name ?? "—"} />
            <div className="mx-5 h-px bg-slate-200" />
            <InfoRow label="이메일" value={profile?.email ?? "—"} />
            <div className="mx-5 h-px bg-slate-200" />
            <InfoRow label="생년월일" value={profile?.birthDate ?? "—"} />
          </div>
        </section>

        {/* ── 프로필 수정 ── */}
        <section>
          <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">
            프로필 수정
          </p>
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-[#f7f7f6]">
            {/* [수정] 닉네임 필드 아래 개별 에러 문구 표시 */}
            <InputRow
              label="닉네임"
              value={form.nickname}
              onChange={(v) => {
                setForm((prev) => ({ ...prev, nickname: v }));
                setNicknameError(null);
                setProfileSuccess(null);
              }}
              placeholder="닉네임 입력 (2~10자)"
              errorMsg={nicknameError}
            />
            <div className="mx-5 h-px bg-slate-200" />
            {/* [수정] 전화번호 필드 아래 개별 에러 문구 표시 */}
            <InputRow
              label="전화번호"
              value={form.phone}
              onChange={(v) => {
                setForm((prev) => ({ ...prev, phone: v }));
                setPhoneError(null);
                setProfileSuccess(null);
              }}
              placeholder="010-0000-0000"
              type="tel"
              errorMsg={phoneError}
            />
          </div>
          {profileSuccess && (
            <p className="mt-2 text-[11px] font-medium text-[#89943d]">
              {profileSuccess}
            </p>
          )}
          <button
            onClick={handleProfileSubmit}
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#89943d] py-3.5 text-sm font-bold tracking-wide text-white shadow-md shadow-[#89943d]/20 transition-transform active:scale-[0.98]">
            프로필 저장
          </button>
        </section>

        {/* ── 비밀번호 변경 ── */}
        <section>
          <p className="mb-3 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">
            비밀번호 변경
          </p>
          <div className="flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-[#f7f7f6]">
            <PasswordRow
              label="현재 비밀번호"
              value={currentPassword}
              onChange={(v) => {
                setCurrentPassword(v);
                setNewPasswordError(null);
              }}
              placeholder="현재 비밀번호 입력"
            />
            <div className="mx-5 h-px bg-slate-200" />
            {/* [수정] 새 비밀번호 필드 아래 에러 문구 (룰 미충족 / 현재 비밀번호 동일) */}
            <PasswordRow
              label="새 비밀번호"
              value={newPassword}
              onChange={(v) => {
                setNewPassword(v);
                setNewPasswordError(null);
              }}
              placeholder="영문 + 숫자 + 특수문자(!@#$%^&*) 8자 이상"
              errorMsg={newPasswordError}
            />
            <div className="mx-5 h-px bg-slate-200" />
            {/* [수정] 비밀번호 확인 필드 아래 불일치 에러 문구 */}
            <PasswordRow
              label="새 비밀번호 확인"
              value={confirmPassword}
              onChange={(v) => {
                setConfirmPassword(v);
                setConfirmPasswordError(null);
              }}
              placeholder="새 비밀번호 재입력"
              errorMsg={confirmPasswordError}
            />
          </div>
          {passwordSuccess && (
            <p className="mt-2 text-[11px] font-medium text-[#89943d]">
              {passwordSuccess}
            </p>
          )}
          <button
            onClick={handlePasswordSubmit}
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#89943d] py-3.5 text-sm font-bold tracking-wide text-white shadow-md shadow-[#89943d]/20 transition-transform active:scale-[0.98]">
            비밀번호 변경
          </button>
        </section>
      </div>

      {/* ── 마이페이지로 돌아가기 버튼 (하단 고정) ── */}
      <div
        className="fixed bottom-0 left-1/2 w-full -translate-x-1/2 border-t border-slate-100 bg-white px-6 pt-3 pb-8"
        style={{ maxWidth: 390 }}>
        <button
          onClick={() => navigate("/mypage")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-500 transition-colors active:bg-slate-50">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          마이페이지로 돌아가기
        </button>
      </div>
    </div>
  );
};

/* ────────────── 서브 컴포넌트 ────────────── */

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="px-5 py-4">
    <p className="mb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      {label}
    </p>
    <p className="text-sm font-medium text-slate-500">{value}</p>
  </div>
);

// [수정] errorMsg prop 추가 - 필드 바로 아래에 에러 문구 렌더링
const InputRow = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  errorMsg
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  errorMsg?: string | null;
}) => (
  <div className="px-5 py-4">
    <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none"
    />
    {errorMsg && (
      <p className="mt-1.5 text-[11px] font-medium text-red-400">{errorMsg}</p>
    )}
  </div>
);

// [수정] errorMsg prop 추가 - 필드 바로 아래에 에러 문구 렌더링
const PasswordRow = ({
  label,
  value,
  onChange,
  placeholder,
  errorMsg
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  errorMsg?: string | null;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div className="px-5 py-4">
      <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="flex h-7 w-7 items-center justify-center text-slate-300 transition-colors active:text-[#89943d]">
          {show ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {errorMsg && (
        <p className="mt-1.5 text-[11px] font-medium text-red-400">
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default EditProfilePage;
