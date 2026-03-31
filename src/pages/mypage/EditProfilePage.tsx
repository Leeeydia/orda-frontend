import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useEditProfile from "@/features/edit-profile/hooks/useEditProfile";
import type { SettingsProfile } from "@/features/edit-profile/types/editProfile.types";

const EditProfileForm = ({
  profile,
  handleUpdateProfile,
  handleChangePassword
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
}) => {
  const [nickname, setNickname] = useState(profile.nickname);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleProfileSubmit = async () => {
    setProfileMessage(null);
    const result = await handleUpdateProfile({ nickname, phone });
    if (result.success) {
      setProfileMessage({ type: "success", text: "프로필이 수정되었습니다" });
    } else {
      setProfileMessage({ type: "error", text: result.message ?? "수정 실패" });
    }
  };

  const handlePasswordSubmit = async () => {
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "새 비밀번호가 일치하지 않습니다"
      });
      return;
    }
    const result = await handleChangePassword({ currentPassword, newPassword });
    if (result.success) {
      setPasswordMessage({
        type: "success",
        text: "비밀번호가 변경되었습니다"
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({
        type: "error",
        text: result.message ?? "변경 실패"
      });
    }
  };

  return (
    <>
      <section className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">기본 정보</h2>
        <div className="mb-2">
          <label className="block text-sm text-gray-600">이메일</label>
          <p className="text-sm">{profile.email}</p>
        </div>
        <div className="mb-2">
          <label className="block text-sm text-gray-600">이름</label>
          <p className="text-sm">{profile.name}</p>
        </div>
        <div className="mb-2">
          <label className="block text-sm text-gray-600">생년월일</label>
          <p className="text-sm">{profile.birthDate ?? "-"}</p>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600">닉네임</label>
          <input
            className="w-full rounded border px-2 py-1 text-sm"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600">전화번호</label>
          <input
            className="w-full rounded border px-2 py-1 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {profileMessage && (
          <p
            className={`mb-2 text-sm ${profileMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {profileMessage.text}
          </p>
        )}
        <button
          onClick={handleProfileSubmit}
          className="rounded bg-blue-500 px-4 py-2 text-sm text-white">
          저장
        </button>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">비밀번호 변경</h2>
        <div className="mb-2">
          <label className="block text-sm text-gray-600">현재 비밀번호</label>
          <input
            type="password"
            className="w-full rounded border px-2 py-1 text-sm"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm text-gray-600">새 비밀번호</label>
          <input
            type="password"
            className="w-full rounded border px-2 py-1 text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            className="w-full rounded border px-2 py-1 text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {passwordMessage && (
          <p
            className={`mb-2 text-sm ${passwordMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {passwordMessage.text}
          </p>
        )}
        <button
          onClick={handlePasswordSubmit}
          className="rounded bg-blue-500 px-4 py-2 text-sm text-white">
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
    return <div className="p-4 text-sm text-gray-500">로딩 중...</div>;
  if (error) return <div className="p-4 text-sm text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-md p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-500">
        ← 뒤로
      </button>
      <h1 className="mb-6 text-xl font-bold">개인정보 수정</h1>
      <EditProfileForm
        profile={profile}
        handleUpdateProfile={handleUpdateProfile}
        handleChangePassword={handleChangePassword}
      />
    </div>
  );
};

export default EditProfilePage;
