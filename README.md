# EASY HOUSE 숏츠 제작 프로젝트

이지하우스(조립식창고) 유튜브 숏츠/릴스/틱톡용 영상 자동 제작 프로젝트.

## 구성

- `memory/` — Claude 프로젝트 기억 파일. 채널 분석, 사장님 기획 원칙, 제품 치수, 훅 공식 등
- `engine/shorts-engine.js` — 레시피(JSON)를 읽어 9:16 숏츠 mp4를 렌더링하는 엔진 (Node.js + @napi-rs/canvas + ffmpeg)
- `engine/contact-sheet.js` — 사진 폴더를 격자 컨택트시트로 합쳐 빠르게 훑어보는 도구
- `recipes/` — 실제로 만든 영상들의 레시피 JSON (컷 구성, 자막, 소스 경로)
- `ads/` — 완성된 숏츠 mp4 결과물

## 다른 컴퓨터에서 이어서 작업하기

1. 이 저장소를 클론
2. Node.js LTS 설치 (`winget install OpenJS.NodeJS.LTS`)
3. `cd engine && npm install @napi-rs/canvas ffmpeg-static`
4. Higgsfield CLI 설치 + 로그인: `npm i -g @higgsfield/cli` → `higgsfield auth login` (ezhouse2024@gmail.com)
5. 구글드라이브 데스크톱 설치 + 같은 계정 로그인 → `G:\` 드라이브에 시공 원본 영상/사진 마운트됨
6. `node engine/shorts-engine.js recipes/<파일명>.json` 으로 렌더링

## 소스 이미지

`engine/` 아래에 레시피가 참조하는 사진들이 포함되어 있습니다 (레시피의 상대경로가 `engine/`을 기준으로 풀림):

- `engine/cuts/` — AI로 생성한 훅(문제 상황) 이미지
- `engine/exp/` — 아웃페인팅으로 배경 확장한 3x5 제품 사진 (초기 영상용)
- `engine/real/`, `engine/real2/`, `engine/fresh3/` — 실제 설치 사진 (회전 보정 완료본)
- `engine/sheettmp2/006.jpg` — 시공자 뒷모습 참고컷

**바디캠 원본 영상(`G:\내 드라이브\영상자료\영상\...`)은 용량이 너무 커서 포함하지 않았습니다.** 이 영상을 쓰는 레시피(수원닭발·인천BBQ·강릉·중국설치 시공 컷)를 재실행하려면 구글드라이브가 마운트돼 있어야 합니다. 사진만 쓰는 레시피는 클론 즉시 재실행 가능합니다.

## 주의

- `memory/`의 원칙(특히 `shed-photos-must-stay-unaltered.md`, `ezhouse-owner-notes.md`)을 먼저 읽고 작업할 것.
- 사진을 새로 추가할 때도 [[ezhouse-install-photos]] 메모의 회전 함정(EXIF 태그 이중회전 버그)을 주의할 것.
