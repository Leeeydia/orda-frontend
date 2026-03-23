# ORDA 지도 GeoJSON 연동 가이드

## 1. 개요

현재 ORDA 지도는 `CommonMap` 컴포넌트를 통해 GeoJSON 데이터를 받아 렌더링한다.

현재 상태:

- MapLibre 지도 렌더링 완료
- 공통 맵 컴포넌트 구성 완료
- GeoJSON props 기반 렌더링 가능
- Point / LineString 표시 가능

즉, GeoJSON 형식만 맞추면 지도에 바로 표시할 수 있다.

## 2. 사용 방법

`CommonMap`에 `geoJsonData`를 넘기면 된다.

    <CommonMap geoJsonData={geoJsonData} />

예시:

    <CommonMap
      center={[127.389, 36.354]}
      zoom={11}
      geoJsonData={geoJsonData}
    />

## 3. geoJsonData 타입

    import type { FeatureCollection } from "geojson";

    type CommonMapProps = {
      geoJsonData?: FeatureCollection | null;
    };

의미:

- `geoJsonData` : 지도에 그릴 데이터
- `?` : 안 넘겨도 됨
- `FeatureCollection` : GeoJSON 전체 구조
- `null` : 아직 데이터가 없는 상태도 허용

즉, 데이터가 있을 수도 있고 아직 없어서 `null`일 수도 있다.

## 4. 타입 import 설명

    import type { FeatureCollection } from "geojson";

`import type`은 실행 코드가 아니라 타입 정보만 가져오는 것이다.

즉, TypeScript에게  
"이 데이터는 GeoJSON FeatureCollection 구조여야 한다"  
라고 알려주는 역할이다.

## 5. GeoJSON 기본 구조

지도에 넘기는 데이터는 반드시 아래 구조여야 한다.

    {
      "type": "FeatureCollection",
      "features": []
    }

최상위 `type`은 반드시 `FeatureCollection`이어야 하고, 실제 데이터는 `features` 배열 안에 들어가야 한다.

## 6. 지원 geometry 타입

- `Point` : 위치, 정상, 특정 지점
- `LineString` : 등산로, 경로, 라인 데이터

## 7. 좌표 규칙

좌표 순서는 반드시 아래 규칙을 따라야 한다.

    [경도, 위도]

예:

    [127.3845, 36.3504]

잘못된 예:

    [36.3504, 127.3845]

이 순서를 반대로 넣으면 지도에 정상적으로 표시되지 않는다.

## 8. Feature 예시

### Point 예시

    {
      "type": "Feature",
      "properties": {
        "name": "정상"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [127.3845, 36.3504]
      }
    }

### LineString 예시

    {
      "type": "Feature",
      "properties": {
        "name": "등산로"
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [127.3845, 36.3504],
          [127.387, 36.352],
          [127.39, 36.355]
        ]
      }
    }

## 9. 전체 예시 데이터

    const geoJsonData = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            name: "정상"
          },
          geometry: {
            type: "Point",
            coordinates: [127.3845, 36.3504]
          }
        },
        {
          type: "Feature",
          properties: {
            name: "등산로"
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [127.3845, 36.3504],
              [127.387, 36.352],
              [127.39, 36.355]
            ]
          }
        }
      ]
    };

## 10. 렌더링 방식

현재 `CommonMap`은 아래 흐름으로 동작한다.

- GeoJSON 데이터를 source로 등록
- `LineString`은 line layer로 렌더링
- `Point`는 circle layer로 렌더링

즉, GeoJSON 형식만 맞게 넘기면 공통 맵 컴포넌트가 지도에 표시해주는 구조다.

## 11. 백엔드 연동 기준

백엔드에서 이미 API 공통 응답과 GeoJSON DTO를 정의해두었다면, 프론트에서는 그 응답 안의 실제 GeoJSON 데이터를 꺼내 `geoJsonData`에 연결하면 된다.

중요한 것은 아래 두 가지다.

- 실제 데이터가 `FeatureCollection` 구조인지 확인
- 좌표 순서가 `[경도, 위도]`인지 확인

## 12. 문제 발생 시 체크리스트

지도에 데이터가 안 보이면 아래 순서대로 확인한다.

- `geoJsonData`가 실제로 전달되고 있는지 확인
- 최상위 `type`이 `FeatureCollection`인지 확인
- `features` 배열이 존재하는지 확인
- 각 Feature의 `geometry.type`이 올바른지 확인
- 좌표 순서가 `[경도, 위도]`인지 확인
- `LineString`의 `coordinates`가 배열의 배열인지 확인
- `Point`의 `coordinates`가 단일 좌표 배열인지 확인

## 13. 정리

- `CommonMap`은 GeoJSON을 받으면 지도에 그린다
- 팀원은 GeoJSON 형식만 맞추면 된다
- 현재 상태에서 API 또는 목데이터를 연결해 바로 테스트할 수 있다
