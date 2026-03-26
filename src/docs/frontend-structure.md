# ORDA 프론트엔드 폴더 구조 규칙

## 1. 기본 원칙

- 기능별 구조를 기본으로 사용한다.
- 화면은 `pages`, 도메인별 기능은 `features`, 여러 기능에서 공통으로 사용하는 요소는 `components`, `utils`, `types`에 위치한다.
- 페이지 컴포넌트는 화면 조합에 집중하고, 비즈니스 로직과 데이터 조회는 `features` 내부에서 처리한다.
- 공통으로 쓰이지 않는 로직은 전역 폴더로 빼지 않는다.
- 구조 변경이 필요하면 먼저 공유 후 반영한다.

---

## 2. 기본 폴더 구조

    src/
    ├── assets/          # 정적 리소스
    ├── components/      # 공통 컴포넌트
    ├── docs/            # 개발 문서
    ├── features/        # 도메인별 기능 모듈
    ├── mock/            # 개발용 목 데이터
    ├── pages/           # 라우터에 연결되는 페이지
    ├── types/           # 여러 도메인에서 공통으로 사용하는 타입
    ├── utils/           # 여러 도메인에서 공통으로 사용하는 유틸
    ├── App.tsx
    ├── index.css
    └── main.tsx

---

## 3. 폴더별 규칙

### `pages/`

- 라우터에 연결되는 페이지 단위 컴포넌트를 둔다.
- 페이지는 화면 조합과 레이아웃 구성에 집중한다.
- 데이터 조회, 상태 처리, API 호출 등은 직접 구현하지 않고 `features`의 hook과 component를 사용한다.
- 파일명은 `{기능}Page.tsx` 형식을 사용한다.

### `features/`

- 도메인 단위로 폴더를 구분한다.
- 각 도메인 내부에서 해당 기능에 필요한 API, hook, type, component, mapper를 함께 관리한다.
- 도메인별 기능은 가능한 한 해당 도메인 폴더 내부에서 응집되도록 구성한다.
- 도메인 간 의존성은 최소화한다.

기본 구조는 아래를 따른다.

    features/
    └── {도메인}/
        ├── api/
        ├── hooks/
        ├── types/
        ├── components/
        └── mappers/

#### `api/`

- 해당 도메인 API 호출 함수를 둔다.
- API 파일은 도메인 단위로 통합한다.
- 예: `hikingApi.ts` 하나에 start, end, tracks, session 조회 등을 함께 관리한다.

#### `hooks/`

- 해당 도메인 전용 hook을 둔다.
- hook 파일은 도메인 단위로 통합한다.
- 예: `useHiking.ts` 안에서 hiking 관련 조회/상태 로직을 관리한다.

#### `types/`

- 해당 도메인에서 사용하는 타입을 둔다.
- API 응답 타입, 요청 타입, 도메인 내부 타입 등을 함께 관리한다.

#### `components/`

- 해당 도메인에서만 사용하는 UI 컴포넌트를 둔다.
- 다른 도메인에서도 재사용되는 컴포넌트는 `components/` 공통 폴더로 이동한다.

#### `mappers/`

- 해당 도메인에서만 사용하는 데이터 변환 로직을 둔다.
- API 응답을 UI에서 사용하기 좋은 형태로 가공하는 역할을 한다.
- 특정 도메인에 강하게 종속된 변환 로직은 `utils/`가 아니라 `mappers/`에 둔다.
- 예:
  - hiking track Point FeatureCollection → 지도 표시용 GeoJSON 변환
  - elevation profile 응답 → 그래프 표시용 데이터 변환

### `components/`

- 여러 도메인에서 공통으로 사용하는 컴포넌트를 둔다.
- 도메인 종속성이 없어야 한다.
- 하위 폴더는 컴포넌트 성격에 따라 구분할 수 있다.
- 예: `map/`, `ui/`, `layout/`

### `types/`

- 여러 도메인에서 공통으로 사용하는 타입을 둔다.
- 특정 도메인에 종속되지 않는 공통 응답 타입, 공용 인터페이스 등을 관리한다.
- 예:
  - `ApiResponse<T>`
  - 여러 도메인에서 함께 사용하는 공통 타입

### `utils/`

- 여러 도메인에서 공통으로 사용하는 순수 유틸 함수를 둔다.
- 특정 도메인에 종속된 데이터 가공 로직은 두지 않는다.
- 예:
  - 날짜 포맷
  - 숫자 포맷
  - 거리/시간 단위 변환
  - 공통 문자열 처리

### `assets/`

- 이미지, 아이콘, 폰트 등 정적 리소스를 둔다.
- 필요하면 하위 폴더로 구분한다.
- 예: `images/`, `icons/`, `fonts/`

### `mock/`

- 개발 및 테스트용 목 데이터를 둔다.
- 실제 API 연동 완료 후 불필요한 파일은 정리한다.

### `docs/`

- 팀원 간 공유가 필요한 개발 가이드 문서를 둔다.
- 마크다운 형식으로 작성한다.

---

## 4. 공통 구조와 도메인 구조 구분 기준

- 여러 도메인에서 함께 사용하는 것은 `components/`, `utils/`, `types/`에 둔다.
- 특정 도메인에서만 사용하는 것은 `features/{도메인}/` 내부에 둔다.
- 공통으로 보이더라도 실제로 한 도메인에서만 쓰인다면 먼저 해당 도메인 내부에 둔다.
- 재사용이 확인되면 그때 공통 폴더로 이동한다.

---

## 5. 파일 네이밍 규칙

| 종류 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `CommonMap.tsx` |
| 훅 | camelCase, use 접두사 | `useHiking.ts` |
| API | camelCase, Api 접미사 | `hikingApi.ts` |
| 타입 | camelCase, .types 접미사 | `hiking.types.ts` |
| 공통 타입 | camelCase, .types 접미사 | `common.types.ts` |
| Mapper | camelCase | `hikingMappers.ts` |
| Utils | camelCase | `format.ts` |
| 페이지 | PascalCase, Page 접미사 | `HikingPage.tsx` |
| 목 데이터 | camelCase | `sampleGeoJson.ts` |

---

## 6. 작업 규칙

- 본인 담당 기능은 해당 도메인 폴더 내부에서 우선 작업한다.
- 공용 폴더는 실제로 여러 도메인에서 함께 사용할 때만 사용한다.
- 도메인 내부 전용 변환 로직은 `mappers/`에 둔다.
- 여러 도메인에서 재사용되는 순수 함수만 `utils/`에 둔다.
- 여러 도메인에서 재사용되는 공통 타입은 `types/`에 둔다.
- 구조상 애매한 폴더는 임의로 만들지 않는다.
- 구조 변경이 필요하면 먼저 공유 후 반영한다.

---

## 7. 새 도메인 추가 시 체크리스트

- [ ] `features/{도메인}/` 폴더 생성
- [ ] `types/{도메인}.types.ts` 타입 정의
- [ ] `api/{도메인}Api.ts` API 함수 작성
- [ ] `hooks/use{도메인}.ts` hook 작성
- [ ] 필요 시 `components/` 추가
- [ ] 필요 시 `mappers/` 추가
- [ ] 페이지 필요 시 `pages/{기능}Page.tsx` 추가