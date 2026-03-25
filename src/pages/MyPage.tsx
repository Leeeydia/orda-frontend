import { useRef } from "react";
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
        {profile?.profileImageUrl ? (
          <img
            src={`http://localhost:8080${profile.profileImageUrl}`}
            alt="프로필 이미지"
          />
        ) : (
          <div>이미지 없음</div>
        )}
        <p>{profile?.nickname}</p>
        <p>{profile?.email}</p>

        {/* 프로필 이미지 업로드/삭제 버튼 */}
        <input
          type="file"
          accept="image/jpg, image/jpeg, image/png"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          프로필 이미지 변경
        </button>
        {profile?.profileImageUrl && (
          <button onClick={handleDeleteImage}>프로필 이미지 삭제</button>
        )}
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
    </div>
  );
};

export default MyPage;
