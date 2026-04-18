const STORAGE_KEY = "authFlash";

// 현재 페이지 로드에서 읽은 flash를 캐싱.
// StrictMode로 useEffect/initializer가 이중 실행되어도 같은 값을 반환하도록 한다.
// window.location.assign으로 전체 페이지 이동 시 module이 재평가되어 캐시도 초기화된다.
let cachedMessage: string | null | undefined = undefined;

export const setAuthFlash = (message: string) => {
  sessionStorage.setItem(STORAGE_KEY, message);
  cachedMessage = undefined;
};

export const consumeAuthFlash = (): string | null => {
  if (cachedMessage === undefined) {
    cachedMessage = sessionStorage.getItem(STORAGE_KEY);
    if (cachedMessage) sessionStorage.removeItem(STORAGE_KEY);
  }
  return cachedMessage;
};
