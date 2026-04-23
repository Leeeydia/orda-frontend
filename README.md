## 화면 구성

| 화면 | 설명 |
|---|---|
| 스플래시 | 앱 진입점. 토큰 유무에 따라 등산 화면 또는 로그인으로 분기 |
| 로그인 | 이메일/비번 로그인, 카카오 OAuth 로그인 |
| 회원가입 | 이메일·비번·닉네임·이름·전화번호·생년월일 입력 |
| 가이드 | 준비물·안전수칙·예절 정적 안내, 오늘의 명언 표시 |
| 등산 기록 (메인 지도) | GPS 실시간 추적, 등산로 난이도 레이어, 100대 명산 모드, 정상 GPS·사진 인증, 경과시간·거리·고도 패널, 고도 차트 |
| 세션 상세 | 트랙 지도 + 인증 정상 마커, 요약 카드(거리·시간·상승·하강), 고도 프로파일 차트 |
| 경로 리플레이 | 2D 경로 재생/일시정지/seek, 카메라 연출(개요→시작→추적→마무리), 인증 정상 점진 표시 |
| 마이페이지 | 프로필·통계 조회, 프로필 이미지 업로드/삭제, 등산 기록 목록, 로그아웃 |
| 프로필 편집 | 닉네임·전화번호 수정, 비밀번호 변경 |

> 시연 영상 및 스크린샷 추후 추가 예정

<br>

## ERD

> ERD 이미지 추후 추가 예정

```text
users (user_id PK, email, password_hash, nickname, phone, birth_date,
        profile_image_url, provider, kakao_id, created_at, updated_at)

hiking_sessions (session_id PK, user_id FK → users, status,
                  started_at, ended_at,
                  total_distance_m, total_elevation_gain_m,
                  total_elevation_loss_m, total_duration_sec, created_at)

gps_tracks (track_id PK, session_id FK → hiking_sessions, sequence_num,
             raw_latitude, raw_longitude, raw_elevation_m,
             snapped_latitude, snapped_longitude, canonical_elevation_m,
             elevation_source, accuracy_m, recorded_at, geom)

summit_verifications (verification_id PK, session_id, summit_id,
                       verification_method, photo_path, verified_at)
  └─ unique: (session_id, summit_id) ※ 서비스 중복 체크는 method까지 포함

user_stats (stat_id PK, user_id FK → users,
             total_hikes, total_summits, total_distance_m,
             total_elevation_gain_m, total_duration_sec,
             last_hiked_at, updated_at)

trail_edges  (edge_id PK, difficulty, difficulty_score,
               nearest_summit_id, geom ST_LineString)

trail_nodes  (node_id PK, geom)

summit_points (summit_id PK, name, elevation_m, source, radius_m, geom)
```

<br>

## API 명세

### 인증 (`/api/auth`)

| 기능 | Method | Endpoint | 설명 |
|---|---|---|---|
| 회원가입 | POST | `/api/auth/signup` | 이메일/비번 회원가입 |
| 로그인 | POST | `/api/auth/login` | JWT 발급 |
| 카카오 로그인 | POST | `/api/auth/kakao` | 인가 코드로 로그인/자동 회원가입 |

### 마이페이지 (`/api/mypage`)

| 기능 | Method | Endpoint | 설명 |
|---|---|---|---|
| 프로필 조회 | GET | `/api/mypage/profile` | 닉네임·이메일·이미지 URL |
| 통계 조회 | GET | `/api/mypage/stats` | 누적 등산 횟수·거리·상승 고도 |
| 기록 목록 | GET | `/api/mypage/records` | 등산 기록 리스트 (시작일 desc) |
| 이미지 업로드 | POST | `/api/mypage/profile-image` | multipart, jpg/png ≤5MB |
| 이미지 삭제 | DELETE | `/api/mypage/profile-image` | 파일·DB 동시 삭제 |

### 설정 (`/api/settings`)

| 기능 | Method | Endpoint | 설명 |
|---|---|---|---|
| 프로필 조회 | GET | `/api/settings/profile` | 이름·전화·생년월일 포함 |
| 프로필 수정 | PATCH | `/api/settings/profile` | 닉네임·전화번호 |
| 비밀번호 변경 | PATCH | `/api/settings/password` | 현재 비번 검증 후 변경 |

### 등산 세션 (`/api/hiking`)

| 기능 | Method | Endpoint | 설명 |
|---|---|---|---|
| 세션 시작 | POST | `/api/hiking/start` | 세션 생성, 반경 3km 정상 목록 반환 |
| 세션 종료 | POST | `/api/hiking/{sessionId}/end` | 통계 집계 + UserStats 누적 |
| 세션 상세 | GET | `/api/hiking/{sessionId}` | 세션 정보 + 인증된 정상 목록 |
| GPS 저장 | POST | `/api/hiking/{sessionId}/tracks` | 포인트 저장, canonical 고도 반환 |
| GPS 조회 | GET | `/api/hiking/{sessionId}/tracks` | GeoJSON FeatureCollection |
| 고도 프로파일 | GET | `/api/hiking/{sessionId}/elevation-profile` | summary + points |
| 리플레이 데이터 | GET | `/api/hiking/{sessionId}/replay` | 보간된 좌표·시간 시퀀스 |

### 정상 인증 (`/api/summit`)

| 기능 | Method | Endpoint | 설명 |
|---|---|---|---|
| GPS 인증 | POST | `/api/summit/verify` | 반경 내 정상 GPS 인증 |
| 사진 인증 | POST | `/api/summit/verify/photo` | GPS + OpenAI Vision 3조건 판정 |

### 등산로 (`/api/trails`)

| 기능 | Method | Endpoint | 설명 |
|---|---|---|---|
| 전체 난이도 GeoJSON | GET | `/api/trails/difficulty/map` | LineString + 난이도 속성 |
| 정상별 GeoJSON | GET | `/api/trails/difficulty/map/summit?summitId=` | 특정 정상 등산로 |
| 뷰포트 GeoJSON | GET | `/api/trails/difficulty/map/bbox?minLng&minLat&maxLng&maxLat` | 화면 범위 기반 조회 |
| edgeIds GeoJSON | GET | `/api/trails/difficulty/map/edges?edgeIds=` | 산 단건 클릭용 |
| edgeIds GeoJSON (POST) | POST | `/api/trails/difficulty/map/edges` | URL 길이 초과 시 body 방식 |
| 등산로 근접 여부 | GET | `/api/trails/check-nearby?lat&lng` | 반경 100m 내 등산로 존재 여부 |

### 100대 명산 (`/api/mountains`)

| 기능 | Method | Endpoint | 설명 |
|---|---|---|---|
| 명산 목록 | GET | `/api/mountains/top100` | 이름·위치·난이도·edgeIds 포함 |

<br>

## 폴더 구조

```bash
project-root
├── frontend/
│   └── src/
│       ├── pages/          # 라우트 단위 페이지 (splash/auth/guide/hiking/mypage)
│       ├── features/       # 도메인별 api·hooks·types·components
│       │   ├── auth/
│       │   ├── hiking/
│       │   ├── gps/
│       │   ├── trail/
│       │   ├── mountain/
│       │   ├── summit/
│       │   ├── mypage/
│       │   └── edit-profile/
│       ├── components/     # 공통 컴포넌트 (layout/map/ui/auth)
│       ├── lib/            # axios 인터셉터
│       └── utils/          # 인증·에러·포맷·검증 유틸
└── backend/
    └── src/main/java/com/orda/backend/
        ├── common/         # ApiResponse, GeoJSON 공통 응답, 예외 처리
        ├── config/         # Security, CORS, WebMvc 설정
        ├── security/       # JWT Provider·Filter, CustomUserDetails
        └── domain/
            ├── user/       # auth·mypage·settings (controller/service/repository/entity/dto)
            ├── hiking/     # 세션·GPS·고도·리플레이 (controller + 8개 헬퍼 서비스)
            ├── summit/     # GPS·사진 인증, OpenAI Vision 연동
            ├── trail/      # 난이도 조회·GeoJSON 반환
            ├── mountain/   # 100대 명산 JSON 캐시 제공
            └── stats/      # UserStats 엔티티·레포지터리 (MyPage 서비스가 직접 사용)
```

<br>

## 트러블슈팅

### 1. 지도 데이터 품질 개선

- **문제:** 산책로·공원길·일반 도로가 등산로처럼 표시됨
- **원인:** 공공데이터 + OSM 혼합 구조에서 OSM 필터링 불완전
- **해결:** OSM을 일시적으로 배제하고 공공 등산로 데이터만 사용하도록 파이프라인 조정. 500m 초과 직선 구간(최대 19km 오류 데이터 존재, 정상 데이터 92.5m 이내) 선형 제거 필터 추가 적용
- **결과:** 등산로 조각 수 112,000개 → 55,000개로 축소, 지도 품질 개선

| 정리 전 | 정리 후 |
|---|---|
| ![정리 전 난이도 지도](docs/images/trail-before.png) | ![정리 후 난이도 지도](docs/images/trail-after.png) |

<br>

### 2. GPS canonical 보정 및 고도 처리

- **문제:** raw GPS를 그대로 사용하면 트랙이 등산로 밖에 찍히고 고도 값이 불규칙하게 튐
- **해결:**
  - PostGIS `ST_ClosestPoint`로 GPS 포인트를 등산로에 스냅
  - NASADEM GeoTIFF에서 고도 샘플링
  - `raw / snapped / canonical / elevation_source` 컬럼 분리 저장
- **결과:** 트랙 신뢰도 및 고도 그래프 품질 개선

| raw GPS vs snapped | 고도 그래프 before/after |
|---|---|
| ![GPS raw vs snapped 비교](docs/images/gps-snap-compare.png) | ![고도 그래프 비교](docs/images/elevation-before-after.png) |

<br>

### 3. DEM 배포 환경 메모리 문제

- **문제:** 앱 시작 시 DEM 전체를 eager load하여 OOM 발생
- **원인:** 대용량 GeoTIFF 파일을 런타임에 통째로 읽는 구조
- **해결:** DEM 파일을 Docker 이미지에 포함하고, 힙 메모리 상향 후 Cloud Run으로 배포 구조 전환
- **결과:** 테스트 가능한 운영 상태 확보

![DEM 포함 Docker → Cloud Run 배포 구조](docs/images/dem-deploy-architecture.png)

<br>

### 4. 카카오 로그인 연쇄 오류 해결

- **문제:** 카카오 OAuth 로그인이 여러 단계에서 연속으로 실패
- **원인 및 해결:** Redirect URI 불일치 → 환경변수 누락 → client secret 미설정 → DB 컬럼 부재 → NOT NULL 제약 조건 충돌 순서로 단계적으로 원인을 추적하여 해결
- **결과:** 카카오 로그인 정상 동작

<br>

### 5. 좌표계 오류 및 시각화 검증

- **문제:** 공공데이터 등산로가 동해 또는 대만 해상에 표시됨
- **원인:** 입력 좌표계(EPSG) 해석 오류
- **해결:** 좌표계를 올바르게 지정하여 재처리. 시각화 검증 과정에서 데이터 병합 로직 결함도 함께 발견·수정
- **결과:** 등산로 위치 정상화

<br>

### 6. 100대 명산 모드 등산로 커버리지 한계 (진행 중)

- **현황:** 명산 모드에서 같은 산 영역임에도 일반 모드보다 등산로가 적게 표시되는 구간 존재 (64개 산 매핑 완료, 36개 산 edgeIds 미확보)
- **원인:** `trail_network_edges.geojson` 데이터 커버리지 한계 및 산 이름 기반 매핑 정확도 문제
- **현재 상태:** 최소 동작 복구 완료. 근본적인 커버리지 개선은 이슈 #68에서 후속 작업 예정

<br>

## 팀원 및 역할

| 이름 | 역할 | 담당 기능 |
|---|---|---|
| 김지현 | 백엔드, 팀장 | 고도 처리, 세션 상세, 리플레이, 공통 API 구조, 운영 기반, 배포, 데이터 가공, 지도 공통 기반 |
| 이윤지 | 풀스택 | 인증/회원, GPS 수집, 등산 시작/종료, AI+GPS 정상 인증, 배포, 데이터 가공, 공통 컴포넌트, 디자인, 지도 공통 기반 |
| 윤종민 | 풀스택 | 난이도 지도, 100대 명산 모드, 마이페이지, 개인정보 수정, 홈, 가이드, 지도 공통 기반 |
