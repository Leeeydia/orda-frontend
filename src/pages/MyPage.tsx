import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import useMyPage from "../features/mypage/hooks/useMyPage";

const MyPage = () => {
  const {
    profile,
    stats,
    records,
    loading,
    error,
    handleUploadImage,
    handleDeleteImage
  } = useMyPage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  // [윤종민] 개인 정보 수정 페이지 이동용
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUploadImage(file);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      {/* 프로필 섹션 */}
      <section>
        <h2>프로필</h2>

        {/* [윤종민] 프로필 이미지 + 하단 아이콘 방식으로 변경 */}
        <div style={{ position: "relative", display: "inline-block" }}>
          {profile?.profileImageUrl ? (
            <img
              src={`http://localhost:8080${profile.profileImageUrl}`}
              alt="프로필 이미지"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          ) : (
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#666"
              }}>
              이미지 없음
            </div>
          )}

          {/* [윤종민] 이미지 하단 변경/삭제 아이콘 영역 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 4
            }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="프로필 이미지 변경"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 18
              }}>
              📷
            </button>
            {profile?.profileImageUrl && (
              <button
                onClick={handleDeleteImage}
                title="프로필 이미지 삭제"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18
                }}>
                ✕
              </button>
            )}
          </div>

          <input
            type="file"
            accept="image/jpg, image/jpeg, image/png"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <p>{profile?.nickname}</p>
        <p>{profile?.email}</p>
      </section>

      {/* 통계 섹션 */}
      <section>
        <h2>통계</h2>
        <p>총 등산 횟수: {stats?.totalHikes}회</p>
        <p>총 정상 인증: {stats?.totalSummits}회</p>
        <p>총 거리: {((stats?.totalDistanceM ?? 0) / 1000).toFixed(1)}km</p>
        <p>총 누적 고도: {stats?.totalElevationGainM}m</p>
      </section>

      {/* 등산 기록 섹션 */}
      <section>
        <h2>등산 기록</h2>
        {(records ?? []).length === 0 ? (
          <p>등산 기록이 없습니다.</p>
        ) : (
          records.map((record) => (
            <div key={record.sessionId}>
              <p>{record.startedAt}</p>
              <p>{((record.totalDistanceM ?? 0) / 1000).toFixed(1)}km</p>
              <p>{record.totalDurationSec}초</p>
            </div>
          ))
        )}
      </section>

      {/* [윤종민] 개인 정보 수정 페이지 이동 버튼 */}
      <section>
        <button
          onClick={() => navigate("/edit-profile")}
          style={{
            marginTop: 24,
            padding: "10px 20px",
            cursor: "pointer"
          }}>
          개인 정보 수정
        </button>
      </section>
    </div>
  );
};

export default MyPage;
