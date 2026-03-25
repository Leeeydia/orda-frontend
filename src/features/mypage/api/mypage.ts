const BASE_URL = "http://localhost:8080";

const getToken = () => localStorage.getItem("accessToken");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

export const fetchProfile = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/profile`, {
    headers: authHeaders()
  });
  return res.json();
};

export const fetchStats = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/stats`, {
    headers: authHeaders()
  });
  return res.json();
};

export const fetchRecords = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/records`, {
    headers: authHeaders()
  });
  return res.json();
};

export const updateProfile = async (nickname: string) => {
  const res = await fetch(`${BASE_URL}/api/mypage/profile`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ nickname })
  });
  return res.json();
};

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

export const uploadProfileImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file); // [윤종민] "image" → "file" 수정 (백엔드 key명 맞춤)
  const res = await fetch(`${BASE_URL}/api/mypage/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`
    },
    body: formData
  });
  return res.json();
};

export const deleteProfileImage = async () => {
  const res = await fetch(`${BASE_URL}/api/mypage/profile-image`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return res.json();
};
