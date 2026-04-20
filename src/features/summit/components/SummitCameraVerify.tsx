import { useRef, useEffect, useState } from "react";
import { useSummit } from "../hooks/useSummit";
import type { PhotoVerifyResponse } from "../types/summit.types";

interface SummitCameraVerifyProps {
  sessionId: number;
  latitude: number;
  longitude: number;
  onClose: () => void;
  onVerified: (result: PhotoVerifyResponse) => void;
}

export default function SummitCameraVerify({
  sessionId,
  latitude,
  longitude,
  onClose,
  onVerified
}: SummitCameraVerifyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const {
    isVerifying,
    result,
    error,
    openCamera,
    closeCamera,
    capturePhoto,
    verify,
    reset
  } = useSummit();

  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  // 카메라 열기
  useEffect(() => {
    let mounted = true;

    openCamera().then((stream) => {
      if (stream && mounted) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    });

    return () => {
      mounted = false;
      closeCamera();
    };
  }, [openCamera, closeCamera]);

  // preview가 null로 돌아오면 (재촬영 시) video에 스트림 재연결
  useEffect(() => {
    if (!preview && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [preview]);

  // 촬영
  const handleCapture = () => {
    if (!videoRef.current) return;
    const file = capturePhoto(videoRef.current);
    if (file) {
      setCapturedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // 인증 요청
  const handleVerify = async () => {
    if (!capturedFile) return;
    const res = await verify(sessionId, latitude, longitude, capturedFile);
    if (res) {
      onVerified(res);
    }
  };

  // 재촬영
  const handleRetake = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setCapturedFile(null);
    reset();
  };

  // 닫기
  const handleClose = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    closeCamera();
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#000",
        display: "flex",
        flexDirection: "column"
      }}>
      {/* 상단 닫기 */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 210
        }}>
        <button
          onClick={handleClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.5)",
            border: "none",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
          ✕
        </button>
      </div>

      {/* 카메라 뷰 또는 미리보기 */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {!preview ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />

            {/* 정상석 가이드 오버레이 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none"
              }}>
              {/* 반투명 마스크 */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  maskImage:
                    "radial-gradient(ellipse 45% 35% at center, transparent 95%, black 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 45% 35% at center, transparent 95%, black 100%)"
                }}
              />

              {/* 정상석 모양 가이드 프레임 */}
              <div style={{ position: "relative", width: "60%" }}>
                <svg
                  viewBox="0 0 200 260"
                  fill="none"
                  style={{ width: "100%" }}>
                  {/* 정상석 본체 */}
                  <path
                    d="M45 215 C38 180, 28 130, 35 80 C42 40, 65 15, 100 8 C135 15, 158 40, 165 80 C172 130, 162 180, 155 215"
                    stroke="rgba(137, 148, 61, 0.85)"
                    strokeWidth="2.5"
                    strokeDasharray="8 5"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* 받침대 */}
                  <path
                    d="M45 215 L35 218 L30 240 L170 240 L165 218 L155 215"
                    stroke="rgba(137, 148, 61, 0.85)"
                    strokeWidth="2.5"
                    strokeDasharray="8 5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>

                {/* 안내 텍스트 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -28,
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 600,
                    textShadow: "0 1px 4px rgba(0,0,0,0.6)"
                  }}>
                  정상석을 가이드 안에 맞춰주세요
                </div>
              </div>
            </div>
          </>
        ) : (
          <img
            src={preview}
            alt="촬영된 사진"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        )}
      </div>

      {/* 하단 컨트롤 */}
      <div
        style={{
          padding: "20px 24px 40px",
          background: "rgba(0,0,0,0.8)"
        }}>
        {/* 에러 메시지 */}
        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: "10px 16px",
              borderRadius: 12,
              background: "#fef2f2",
              color: "#dc2626",
              fontSize: 13,
              textAlign: "center"
            }}>
            {error}
          </div>
        )}

        {/* 인증 결과 */}
        {result && (
          <div
            style={{
              marginBottom: 12,
              padding: "12px 16px",
              borderRadius: 12,
              background: result.verified ? "#f0fdf4" : "#fefce8",
              color: result.verified ? "#15803d" : "#a16207",
              fontSize: 13,
              textAlign: "center"
            }}>
            {result.verified ? (
              <>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  🏔 {result.summitName} 정상 인증 완료!
                </div>
                <div style={{ fontSize: 12 }}>
                  AI 인식: {result.aiRecognizedName} · 해발{" "}
                  {result.aiRecognizedElevation}m
                </div>
              </>
            ) : (
              <>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  📍 정상 인증에 실패했습니다
                </div>
                <div style={{ fontSize: 12 }}>{result.aiReason}</div>
              </>
            )}
          </div>
        )}

        {/* 버튼 */}
        {!preview ? (
          <button
            onClick={handleCapture}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 16,
              background: "#89943d",
              border: "none",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}>
            📷 촬영
          </button>
        ) : !result ? (
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={handleRetake}
              disabled={isVerifying}
              style={{
                flex: 1,
                padding: "16px 0",
                borderRadius: 16,
                background: "#374151",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                opacity: isVerifying ? 0.4 : 1
              }}>
              재촬영
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              style={{
                flex: 1.5,
                padding: "16px 0",
                borderRadius: 16,
                background: "#89943d",
                border: "none",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                opacity: isVerifying ? 0.4 : 1
              }}>
              {isVerifying ? "AI 분석 중..." : "🔍 인증하기"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleClose}
            style={{
              width: "100%",
              padding: "16px 0",
              borderRadius: 16,
              background: result.verified ? "#89943d" : "#374151",
              border: "none",
              color: "white",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer"
            }}>
            {result.verified ? "완료" : "닫기"}
          </button>
        )}
      </div>
    </div>
  );
}
