const BASE_URL = "http://localhost:8080";

// JWT 토큰 가져오기
const getToken = () => localStorage.getItem("accessToken");

// 공통 헤더
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

// 프로필 조회
export const fetchProfile = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/profile`, {
    headers: authHeaders()
  });
  return res.json();
};

// 통계 조회
export const fetchStats = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/stats`, {
    headers: authHeaders()
  });
  return res.json();
};

// 등산 기록 조회
export const fetchRecords = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/records`, {
    headers: authHeaders()
  });
  return res.json();
};

// 닉네임 수정
export const updateProfile = async (nickname: string) => {
  const res = await fetch(`${BASE_URL}/api/mypage/profile`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ nickname })
  });
  return res.json();
};

// 비밀번호 변경
export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const res = await fetch(`${BASE_URL}/api/mypage/password`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  return res.json();
};

// 프로필 이미지 업로드
export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE_URL}/api/mypage/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  });
  return res.json();
};

// 프로필 이미지 삭제
export const deleteProfileImage = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/profile-image`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return res.json();
};
