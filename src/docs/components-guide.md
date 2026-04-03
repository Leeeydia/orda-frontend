# 공통 컴포넌트 가이드

---

## Header

### 기본 구조

| props       | 설명                           |
| ----------- | ------------------------------ |
| `leftSlot`  | 뒤로가기 버튼 등 좌측 영역     |
| `title`     | 페이지 제목                    |
| `subTitle`  | 제목 위 보조 텍스트 (ex. ORDA) |
| `rightSlot` | 우측 액션 버튼 영역            |

### 사용 예시

**메인 페이지 — 로고**

```tsx
<Header />
```

**일반 페이지 — 뒤로가기 + 제목**

```tsx
<Header leftSlot={<BackButton />} title="등산 세션" />
```

**서브타이틀 포함**

```tsx
<Header leftSlot={<BackButton />} subTitle="ORDA" title="등산 세션" />
```

**우측 버튼 포함**

```tsx
<Header
  leftSlot={<BackButton />}
  title="등산 세션"
  rightSlot={<button>⋯</button>}
/>
```

### 규칙

- `title`을 넘기지 않으면 로고가 표시된다
- 뒤로가기는 항상 `BackButton` 컴포넌트를 사용한다
- `rightSlot`이 없으면 우측은 빈 공간으로 유지된다 (레이아웃 균형 유지)

---

## BackButton

뒤로가기 버튼. `Header`의 `leftSlot`에 넣어 사용한다.

```tsx
<Header leftSlot={<BackButton />} title="페이지 제목" />
```

- 내부적으로 `navigate(-1)`을 호출한다
- 아이콘은 `src/assets/icons/back.svg`를 사용한다
- 원형 배경 없이 아이콘만 표시한다
