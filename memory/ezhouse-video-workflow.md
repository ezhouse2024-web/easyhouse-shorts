---
name: ezhouse-video-workflow
description: "사용자와 합의한 지속 작업 방식 — 미드폼 올리면 편집, 숏츠는 릴스/숏츠/틱톡용으로 다양하게 창작"
metadata: 
  node_type: memory
  type: project
  originSessionId: 086bf66d-cd9f-4336-9aab-949e81037bc4
  modified: 2026-08-10T13:11:40.639Z
---

2026-08-10에 사용자가 요청한 앞으로의 상시 업무:
1. 사용자가 **미드폼 영상을 올리면 편집**해준다
2. **주력은 숏츠** — 유튜브 숏츠 / 인스타 릴스 / 틱톡 3곳에 올릴 소재를 다양하게 창작한다

**Why:** 채널([[ezhouse-youtube-channel]]) 구독자 40명의 초기 성장 단계이고, 숏츠가 유입 채널이다. 실제로 숏츠 조회수(최고 1.6천)가 롱폼 평균보다 높게 나온다.

**How to apply:**
- 규격은 **9:16 / 1080×1920 / 30fps**, 세 플랫폼 공용으로 한 벌 제작
- 자막·그래픽은 [[ezhouse-visual-system]] 규칙을 그대로 따른다
- 카피는 [[ezhouse-content-formula]] 공식(혼자서·설치기사 없이·가격·치수·의외의 현장) 적용
- 제품 컷은 [[shed-photos-must-stay-unaltered]] 원칙 준수 — 원본 보존
- **크레딧 최소화가 사용자 요구사항**: 로컬 합성(@napi-rs/canvas + ffmpeg-static, 스크래치패드에 설치됨)으로 편집·자막·켄번즈·컷 편집은 전부 0 크레딧 처리. AI 생성은 꼭 필요할 때만.
- 안전 영역: 자막은 상단 12%~하단 75% 안에 배치 (플랫폼 UI 회피)
- BGM·내레이션은 넣지 않고 무음으로 납품 → 사용자가 트렌딩 사운드를 얹는다 (별도 요청 시 TTS 추가)

**쓸 수 있는 Higgsfield 도구**
- `personal_clipper_create` — 유튜브 URL을 숏츠 클립으로 자동 절단 (30분+ 소요, 클립수/비율/자막폰트 먼저 물어볼 것)
- `video_analysis_create` — 유튜브 URL 직접 분석 가능(씬 단위). 긴 영상일수록 부정확
- `outpaint_image` — 사진 비율 변경 시 크롭 대신 사용 (2크레딧)
- `seedance_2_0` — 정지컷에 실사 모션 필요할 때 (5초 1080p = 45크레딧, 비쌈)
