import { useState, useRef, useCallback } from "react";
import { verifySummitWithPhoto } from "../api/summitApi";
import type { PhotoVerifyResponse } from "../types/summit.types";

export const useSummit = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<PhotoVerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  const openCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      return stream;
    } catch {
      setError("카메라 접근이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
      return null;
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  }, []);

  const capturePhoto = useCallback(
    (video: HTMLVideoElement): File | null => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.drawImage(video, 0, 0);

        // canvas → Blob → File 변환 (동기적으로 dataURL 사용)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        const byteString = atob(dataUrl.split(",")[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: "image/jpeg" });
        return new File([blob], "summit_photo.jpg", { type: "image/jpeg" });
      } catch {
        setError("사진 캡처에 실패했습니다.");
        return null;
      }
    },
    []
  );

  const verify = useCallback(
    async (sessionId: number, latitude: number, longitude: number, photo: File) => {
      try {
        setIsVerifying(true);
        setError(null);
        setResult(null);

        const response = await verifySummitWithPhoto(
          sessionId, latitude, longitude, photo
        );
        setResult(response);
        return response;
      } catch {
        setError("사진 인증에 실패했습니다. 다시 시도해주세요.");
        return null;
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isVerifying,
    result,
    error,
    isCameraOpen,
    openCamera,
    closeCamera,
    capturePhoto,
    verify,
    reset,
  };
};