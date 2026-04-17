import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEditProfile from "@/features/edit-profile/hooks/useEditProfile";
import type { SettingsProfile } from "@/features/edit-profile/types/editProfile.types";
import Toast from "@/components/ui/Toast";
import { validate } from "@/utils/validate";

const formatPhone = (phone: string | null): string => {
  if (!phone) return "";
  const raw = phone.replace(/-/g, "");
  if (raw.length > 7)
    return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
  if (raw.length > 3) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  return raw;
};

const EditProfileForm = ({
  profile,
  handleUpdateProfile,
  handleChangePassword,
  onSuccess
}: {
  profile: SettingsProfile;
  handleUpdateProfile: (req: {
    nickname?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  handleChangePassword: (req: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message?: string }>;
  onSuccess: () => void;
}) => {
  const [nickname, setNickname] = useState(profile.nickname);
  const [nicknameError, setNicknameError] = useState("");
  const [phone, setPhone] = useState(formatPhone(profile.phone));
  const [phoneError, setPhoneError] = useState("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
    let formatted = raw;
    if (raw.length > 7)
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7)}`;
    else if (raw.length > 3) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    setPhone(formatted);
    setPhoneError(validate.phone(formatted));
  };

  const getNewPasswordError = (value: string, curPw: string) => {
    const pwErr = validate.password(value);
    if (pwErr) return pwErr;
    if (value === curPw && value !== "")
      return "현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다";
    return "";
  };

  const handleProfileSubmit = async () => {
    const nErr = validate.nickname(nickname);
    const pErr = validate.phone(phone);
    setNicknameError(nErr);
    setPhoneError(pErr);
    if (nErr || pErr) return;
    const result = await handleUpdateProfile({ nickname, phone });
    if (result.success) {
      setToast({ type: "success", text: "프로필이 수정되었습니다" });
      setTimeout(() => onSuccess(), 1000);
    } else {
      setToast({ type: "error", text: result.message ?? "수정 실패" });
    }
  };

  const handlePasswordSubmit = async () => {
    const curPwErr =
      currentPassword.trim() === "" ? "현재 비밀번호를 입력해주세요" : "";
    const pwErr = getNewPasswordError(newPassword, currentPassword);
    const confirmErr =
      newPassword !== confirmPassword ? "새 비밀번호가 일치하지 않습니다" : "";
    setCurrentPasswordError(curPwErr);
    setNewPasswordError(pwErr);
    setConfirmPasswordError(confirmErr);
    if (curPwErr || pwErr || confirmErr) return;
    const result = await handleChangePassword({ currentPassword, newPassword });
    if (result.success) {
      setToast({ type: "success", text: "비밀번호가 변경되었습니다" });
      setTimeout(() => onSuccess(), 1000);
    } else {
      setToast({ type: "error", text: result.message ?? "변경 실패" });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 기본 정보 */}
      <section className="mb-6">
        <p className="text-muted mb-3 text-xs font-bold tracking-wider uppercase">
          기본 정보
        </p>
        <div className="border-default bg-page flex flex-col gap-4 rounded-xl border px-4 py-4">
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              이메일
            </p>
            <p className="text-body text-sm">{profile.email}</p>
          </div>
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              이름
            </p>
            <p className="text-body text-sm">{profile.name}</p>
          </div>
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              생년월일
            </p>
            <p className="text-body text-sm">{profile.birthDate ?? "-"}</p>
          </div>
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              닉네임
            </p>
            <input
              className={`text-heading w-full rounded-md border bg-white px-3 py-2 text-sm transition outline-none focus:ring-1 ${
                nicknameError
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-default focus:border-focus focus:ring-focus/30"
              }`}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameError(validate.nickname(e.target.value));
              }}
            />
            {nicknameError && (
              <p className="text-error mt-1 pl-1 text-xs">{nicknameError}</p>
            )}
          </div>
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              전화번호
            </p>
            <input
              className={`text-heading w-full rounded-md border bg-white px-3 py-2 text-sm transition outline-none focus:ring-1 ${
                phoneError
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-default focus:border-focus focus:ring-focus/30"
              }`}
              value={phone}
              onChange={handlePhoneChange}
              placeholder="010-XXXX-XXXX"
            />
            {phoneError && (
              <p className="text-error mt-1 pl-1 text-xs">{phoneError}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleProfileSubmit}
          className="bg-primary mt-3 inline-flex w-full items-center justify-center rounded-xl px-6 py-4 text-sm font-semibold text-white transition-colors duration-150 active:opacity-60">
          저장
        </button>
      </section>

      {/* 비밀번호 변경 */}
      <section className="mb-8">
        <p className="text-muted mb-3 text-xs font-bold tracking-wider uppercase">
          비밀번호 변경
        </p>
        <div className="border-default bg-page flex flex-col gap-4 rounded-xl border px-4 py-4">
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              현재 비밀번호
            </p>
            <input
              type="password"
              className={`text-heading w-full rounded-md border bg-white px-3 py-2 text-sm transition outline-none focus:ring-1 ${
                currentPasswordError
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-default focus:border-focus focus:ring-focus/30"
              }`}
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (e.target.value.trim() !== "") setCurrentPasswordError("");
                if (newPassword !== "")
                  setNewPasswordError(
                    getNewPasswordError(newPassword, e.target.value)
                  );
              }}
            />
            {currentPasswordError && (
              <p className="text-error mt-1 pl-1 text-xs">
                {currentPasswordError}
              </p>
            )}
          </div>
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              새 비밀번호
            </p>
            <input
              type="password"
              className={`text-heading w-full rounded-md border bg-white px-3 py-2 text-sm transition outline-none focus:ring-1 ${
                newPasswordError
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-default focus:border-focus focus:ring-focus/30"
              }`}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setNewPasswordError(
                  getNewPasswordError(e.target.value, currentPassword)
                );
              }}
              placeholder="8자 이상, 영문+숫자+특수문자"
            />
            {newPasswordError && (
              <p className="text-error mt-1 pl-1 text-xs">{newPasswordError}</p>
            )}
          </div>
          <div>
            <p className="text-muted mb-1 text-xs font-semibold tracking-wider uppercase">
              새 비밀번호 확인
            </p>
            <input
              type="password"
              className={`text-heading w-full rounded-md border bg-white px-3 py-2 text-sm transition outline-none focus:ring-1 ${
                confirmPasswordError
                  ? "border-error focus:border-error focus:ring-error/20"
                  : "border-default focus:border-focus focus:ring-focus/30"
              }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError(
                  e.target.value !== newPassword
                    ? "새 비밀번호가 일치하지 않습니다"
                    : ""
                );
              }}
            />
            {confirmPasswordError && (
              <p className="text-error mt-1 pl-1 text-xs">
                {confirmPasswordError}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handlePasswordSubmit}
          className="border-default text-body mt-3 inline-flex w-full items-center justify-center rounded-xl border bg-white py-4 text-sm font-semibold transition-colors duration-150 active:opacity-60">
          변경
        </button>
      </section>
    </>
  );
};

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { profile, loading, error, handleUpdateProfile, handleChangePassword } =
    useEditProfile();

  if (loading)
    return (
      <div className="bg-page flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-primary text-sm font-medium tracking-wide">
            불러오는 중...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-page flex min-h-screen items-center justify-center">
        <p className="text-error text-sm">{error}</p>
      </div>
    );

  if (!profile) return null;

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[390px] flex-col overflow-x-hidden bg-white">
      {/* 헤더 */}
      <header className="border-default sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="text-heading flex h-10 w-10 items-center justify-center">
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
        <h1 className="text-heading flex-1 text-center text-lg font-bold tracking-tight">
          개인정보 수정
        </h1>
        <div className="h-10 w-10" />
      </header>

      <div className="px-4 pt-6">
        <EditProfileForm
          profile={profile}
          handleUpdateProfile={handleUpdateProfile}
          handleChangePassword={handleChangePassword}
          onSuccess={() => navigate("/mypage", { replace: true })}
        />
      </div>
    </div>
  );
};

export default EditProfilePage;
