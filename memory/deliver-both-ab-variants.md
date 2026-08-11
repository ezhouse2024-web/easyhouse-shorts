---
name: deliver-both-ab-variants
description: 이미지 결과물은 매번 A안(원본 픽셀 보존)과 B안(AI 재생성)을 둘 다 만들어 전달할 것
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 220edcef-1f58-47f4-bf68-d6c32dec6775
  modified: 2026-08-11T11:46:42.547Z
---

썸네일·광고 등 창고 이미지 결과물을 만들 때 **한 가지 방식만 고르지 말고 항상 두 가지를 다 만들어 나란히 전달한다.**

- **A안 — 원본 픽셀 보존**: 실제 설치 사진을 베이스로 쓰고, 비율이 안 맞으면 `outpaint`로 배경만 확장, 프레임·문구·배지는 로컬 합성(System.Drawing, 크레딧 0)
- **B안 — AI 재생성**: `nano_banana_pro` 4K에 실사진을 `--image` 레퍼런스로 넘기고 PRODUCT LOCK 프롬프트로 형태 고정

**Why:** 2026-08-11 썸네일 작업에서 사용자가 "둘 다 뽑아서 비교" → 결과 확인 후 **"다 좋아, 매번 A안과 B안을 둘다 만들어줘"**라고 지시했다. 둘의 장점이 갈린다 — 같은 장소 BEFORE/AFTER처럼 진실성이 핵심인 컷은 A안이 압도적이고, 조명·대비가 필요해 작은 크기에서 읽혀야 하는 컷은 B안이 강했다. 미리 하나로 좁히면 더 나은 쪽을 못 본다.

**How to apply:**
- 컨셉이 여러 개면 컨셉마다 A/B를 만들고, 비율(16:9·9:16)도 요청대로 각각 낸다
- 마지막엔 컨셉별로 A안·B안을 나란히 붙인 비교 시트를 만들어 전달하고, **어느 쪽이 왜 나은지 내 판단을 함께 말한다** (선택은 사용자 몫)
- 크레딧 소모를 결과 보고에 함께 적는다 — [[ezhouse-video-workflow]]의 크레딧 최소화 원칙과 충돌하지 않게, A안 쪽은 대부분 0~2크레딧으로 끝난다

관련: [[shed-photos-must-stay-unaltered]] · [[ezhouse-visual-system]]
