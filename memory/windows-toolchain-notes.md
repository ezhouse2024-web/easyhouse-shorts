---
name: windows-toolchain-notes
description: 이 PC(Windows 11)에서 이미지 작업할 때의 도구 사정과 반복해서 걸린 함정
metadata: 
  node_type: memory
  type: reference
  originSessionId: 220edcef-1f58-47f4-bf68-d6c32dec6775
  modified: 2026-08-11T11:47:25.398Z
---

2026-08-11 썸네일 작업 중 확인. 이 환경에서 매번 다시 부딪히는 것들.

**설치된 것 / 없는 것**
- **node·npm 없음, ffmpeg 없음.** 과거 메모의 `contact-sheet.js`(node) 방식은 이 PC에서 못 쓴다
- **PowerShell + System.Drawing이 실질적 대안** — 컨택트시트, 합성, 회전 굽기, 텍스트 오버레이 전부 가능하고 설치가 필요 없다
- `higgsfield` CLI는 `C:\Users\user\bin\higgsfield.exe`에 설치해 뒀다 (v1.1.23). `ezhouse2024@gmail.com` 계정으로 이미 로그인 상태

**higgsfield CLI를 다시 설치해야 한다면**
공식 `install.sh`는 `darwin|linux`만 받고 Git Bash의 `MINGW64_NT`를 "Unsupported OS"로 거절한다. 릴리스에는 Windows 빌드가 있으니 직접 받을 것: `hf_<ver>_windows_amd64.tar.gz` → `checksums.txt`로 sha256 검증 → `hf.exe`를 `~/bin/higgsfield.exe`로 복사.

**PowerShell 5.1 함정 2개 (둘 다 실제로 당했다)**
1. **`.ps1`에 한글이 들어가면 BOM이 없을 때 ANSI로 읽혀 파서 에러가 난다.** Write 툴은 BOM 없이 저장하므로, 저장 후 반드시 BOM을 붙일 것:
   `$c=[IO.File]::ReadAllText($p,(New-Object Text.UTF8Encoding $false)); [IO.File]::WriteAllText($p,$c,(New-Object Text.UTF8Encoding $true))`
   한글 경로를 스크립트 안 기본값으로 쓰지 말고 **파라미터로 넘기면** 이 문제를 피할 수 있다.
2. **변수명이 대소문자 구분을 안 한다.** `$W`/`$H` 파라미터를 쓰는 스크립트에서 `$w = ...`로 지역변수를 만들면 파라미터가 덮어써진다. 캔버스는 맞는데 프레임만 캔버스 밖으로 그려지는 식으로 조용히 깨진다. `$dw`/`$dh`처럼 이름을 분리할 것.

**Higgsfield 잡 실패는 산발적이다** — 같은 프롬프트가 1회차 `failed`, 2회차 성공하는 경우가 있었다. 러너에 재시도(최대 3회)를 넣어 둘 것.

관련: [[ezhouse-install-photos]] · [[deliver-both-ab-variants]]
