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

## 주의

- `recipes/*.json`은 로컬 경로(구글드라이브 `G:\...`, 스크래치패드 임시 폴더)를 참조합니다. 원본 사진·바디캠 영상 자체는 용량 문제로 이 저장소에 포함하지 않았습니다 — 구글드라이브에서 별도로 접근해야 합니다.
- `memory/`의 원칙(특히 `shed-photos-must-stay-unaltered.md`, `ezhouse-owner-notes.md`)을 먼저 읽고 작업할 것.
