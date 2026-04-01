// ─── Validation ───────────────────────────────────────────────────────────────
// 여러 도메인에서 공통으로 사용하는 입력값 유효성 검증 함수 모음

export const validate = {
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? ""
      : "올바른 이메일 형식을 입력해주세요.",

  password: (v: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(v)
      ? ""
      : "8자 이상, 영문 + 숫자 + 특수문자(!@#$%^&*)를 포함해야 합니다.",

  nickname: (v: string) =>
    /^[가-힣a-zA-Z0-9]{2,10}$/.test(v)
      ? ""
      : "한글/영문/숫자 2~10자로 입력해주세요.",

  name: (v: string) =>
    /^[가-힣a-zA-Z]{2,20}$/.test(v) ? "" : "한글/영문 2~20자로 입력해주세요.",

  // 사용자 입력: 010-XXXX-XXXX / 전송 시: 하이픈 제거 후 01012345678
  phone: (v: string) =>
    /^01[0-9]-\d{3,4}-\d{4}$/.test(v)
      ? ""
      : "010-XXXX-XXXX 형식으로 입력해주세요.",

  // type="text" 기반 자동 포맷 (YYYY-MM-DD)
  birthDate: (v: string) => {
    if (!v) return "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "날짜를 끝까지 입력해주세요.";
    const date = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isNaN(date.getTime()) || date >= today
      ? "과거 날짜를 입력해주세요."
      : "";
  }
};
