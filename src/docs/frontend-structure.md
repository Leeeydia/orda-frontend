# ORDA 프론트엔드 폴더 구조 규칙

## 전체 구조

```
src/
├── assets/                        # 정적 리소스 (이미지, 아이콘, 폰트)
├── components/                    # 공통 컴포넌트
│   └── map/
│       └── CommonMap.tsx
├── docs/                          # 개발 문서
│   └── geojson-guide.md
├── features/                      # 도메인별 기능 모듈
│   ├── gps/
│   │   ├── components/
│   │   │   └── GpsTrackingMap.tsx
│   │   ├── hooks/
│   │   │   └── useGPS.ts
│   │   └── types/
│   │       └── gps.types.ts
│   └── hiking/
│       ├── api/
│       │   └── hikingApi.ts
│       ├── hooks/
│       │   └── useHiking.ts
│       └── types/
│           └── hiking.types.ts
├── mock/                          # 목 데이터
│   └── sampleGeoJson.ts
├── pages/                         # 페이지 컴포넌트
│   ├── HikingPage.tsx
│   └── MapTestPage.tsx
├── App.tsx
├── index.css
└── main.tsx
```

---

## 폴더별 규칙

### `components/`

- 여러 도메인에서 공통으로 사용하는 컴포넌트
- 도메인 종속성 없어야 함
- 하위 폴더는 컴포넌트 카테고리 단위로 구분 (예: `map/`, `ui/`, `layout/`)
- 특정 도메인에서만 쓰이는 컴포넌트는 `features/{도메인}/components/`에 위치

### `features/`

- 도메인 단위로 폴더 구분
- 각 도메인 폴더 안에 `api/`, `hooks/`, `types/`, `components/` 포함
- **api 파일은 도메인 단위로 통합** (예: `hikingApi.ts` 하나에 start/end/tracks 통합)
- **hooks 파일은 도메인 단위로 통합** (예: `useHiking.ts` 하나에 start/end/verify 통합)
- 도메인 간 의존성은 최소화

```
features/
└── {도메인}/
    ├── api/
    │   └── {도메인}Api.ts       # 해당 도메인 API 함수 전체
    ├── hooks/
    │   └── use{도메인}.ts       # 해당 도메인 훅 전체
    ├── types/
    │   └── {도메인}.types.ts    # 해당 도메인 타입 전체
    └── components/              # 해당 도메인 전용 컴포넌트 (필요 시)
```

### `pages/`

- 라우터에 연결되는 페이지 단위 컴포넌트
- 비즈니스 로직은 `features/`의 hook에서 처리, 페이지는 조합만 담당
- 파일명은 `{기능}Page.tsx` 형식

### `assets/`

- 이미지, 아이콘, 폰트 등 정적 리소스
- 하위 폴더로 타입 구분 (예: `images/`, `icons/`)

### `mock/`

- 개발/테스트용 목 데이터
- 실제 API 연동 완료 후 불필요한 파일은 정리

### `docs/`

- 팀원 간 공유가 필요한 개발 가이드 문서
- 마크다운 형식으로 작성

---

## 파일 네이밍 규칙

| 종류      | 규칙                     | 예시                 |
| --------- | ------------------------ | -------------------- |
| 컴포넌트  | PascalCase               | `GpsTrackingMap.tsx` |
| 훅        | camelCase, use 접두사    | `useHiking.ts`       |
| API       | camelCase, Api 접미사    | `hikingApi.ts`       |
| 타입      | camelCase, .types 접미사 | `hiking.types.ts`    |
| 페이지    | PascalCase, Page 접미사  | `HikingPage.tsx`     |
| 목 데이터 | camelCase                | `sampleGeoJson.ts`   |

---

## 새 도메인 추가 시 체크리스트

- [ ] `features/{도메인}/` 폴더 생성
- [ ] `types/{도메인}.types.ts` 타입 정의
- [ ] `api/{도메인}Api.ts` API 함수 작성
- [ ] `hooks/use{도메인}.ts` hook 작성
- [ ] 필요 시 `components/` 추가
- [ ] 페이지 필요 시 `pages/{기능}Page.tsx` 추가
