/*
 * EASY HOUSE 숏츠 엔진 (재사용 템플릿)
 * 사용법:  node shorts-engine.js recipes/<이름>.json
 *
 * 레이아웃 2종
 *   기본(full)   : 화면 전체에 영상, 자막 오버레이
 *   banded       : 상단 제목띠 / 중간 영상 / 하단 행동버튼(구독·좋아요·아래영상클릭)
 *                  → 레시피 루트에 "layout":"banded", "title":"...", "cta":{...}
 * 출력: 1080x1920 / 30fps / 무음
 */
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

GlobalFonts.registerFromPath('C:\\Windows\\Fonts\\NanumGothicExtraBold.ttf', 'AdHeavy');

const SP = __dirname;
const FFMPEG = path.join(SP, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
const W = 1080, H = 1920, FPS = 30;

const RED = '#E8112D', YELLOW = '#FFE300', INK = '#141414', BAND = '#17191C';
const FRAME_PX = 14;

const recipePath = process.argv[2];
if (!recipePath) { console.error('레시피 경로를 지정하세요'); process.exit(1); }
const R = JSON.parse(fs.readFileSync(recipePath, 'utf8'));

const BANDED = R.layout === 'banded';
const TOP_H = BANDED ? (R.topH ?? 330) : 0;          // 제목띠
const BOT_H = BANDED ? (R.botH ?? 400) : 0;          // 행동버튼띠
const MID_Y = TOP_H;
const MID_H = H - TOP_H - BOT_H;                      // 영상 영역

const WORK = path.join(SP, 'work', path.basename(recipePath, '.json'));
const FRAMES = path.join(WORK, 'frames');
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });

const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

function fitFont(ctx, text, maxW, start) {
  let s = start;
  for (;;) { ctx.font = `${s}px "AdHeavy"`; if (ctx.measureText(text).width <= maxW || s <= 18) return s; s -= 2; }
}

function extractClip(cut, idx, nFrames) {
  const dir = path.join(WORK, 'clip' + idx);
  fs.mkdirSync(dir, { recursive: true });
  const args = ['-y', '-loglevel', 'error'];
  if (cut.noAutorotate) args.push('-noautorotate');
  args.push('-ss', String(cut.start || 0), '-i', cut.src);
  const vf = [cut.vf || 'crop=1080:1080:420:0', `fps=${FPS}`].filter(Boolean).join(',');
  args.push('-vf', vf, '-frames:v', String(nFrames), path.join(dir, '%04d.jpg'));
  execFileSync(FFMPEG, args);
  return fs.readdirSync(dir).sort().map(f => path.join(dir, f));
}

function outlined(ctx, text, cx, y, size, fill) {
  ctx.font = `${size}px "AdHeavy"`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.miterLimit = 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = size * 0.18; ctx.shadowOffsetY = size * 0.07;
  ctx.strokeStyle = INK; ctx.lineWidth = size * 0.30;
  ctx.strokeText(text, cx, y);
  ctx.restore();
  ctx.fillStyle = fill; ctx.fillText(text, cx, y);
}

/** 컷별 자막 — banded 에서는 영상 영역 기준으로 배치 */
function drawCaption(ctx, cap, alpha) {
  if (!cap) return;
  ctx.save(); ctx.globalAlpha = alpha;
  const maxW = W * 0.86;
  const size = Math.min(fitFont(ctx, cap.l1, maxW, cap.size || 106),
                        cap.l2 ? fitFont(ctx, cap.l2, maxW, cap.size || 106) : 999);
  ctx.font = `${size}px "AdHeavy"`;
  const m1 = ctx.measureText(cap.l1);
  const baseY = BANDED ? MID_Y + MID_H * (cap.y ?? 0.06) : H * (cap.y ?? 0.16);
  const y1 = baseY + m1.actualBoundingBoxAscent;

  if (!cap.l2 && cap.hl) {
    const padX = size * 0.19, padY = size * 0.13;
    const top = y1 - m1.actualBoundingBoxAscent - padY;
    const bh = m1.actualBoundingBoxAscent + m1.actualBoundingBoxDescent + padY * 2;
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    ctx.roundRect(W / 2 - m1.width / 2 - padX, top, m1.width + padX * 2, bh, size * 0.13);
    ctx.fill();
    ctx.font = `${size}px "AdHeavy"`; ctx.fillStyle = INK; ctx.textAlign = 'center';
    ctx.fillText(cap.l1, W / 2, y1);
    ctx.restore(); return;
  }
  outlined(ctx, cap.l1, W / 2, y1, size, '#FFFFFF');
  if (cap.l2) {
    const m2 = ctx.measureText(cap.l2);
    const y2 = y1 + size * 1.24;
    if (cap.hl) {
      const padX = size * 0.19, padY = size * 0.13;
      const top = y2 - m2.actualBoundingBoxAscent - padY;
      const bh = m2.actualBoundingBoxAscent + m2.actualBoundingBoxDescent + padY * 2;
      ctx.fillStyle = YELLOW;
      ctx.beginPath();
      ctx.roundRect(W / 2 - m2.width / 2 - padX, top, m2.width + padX * 2, bh, size * 0.13);
      ctx.fill();
      ctx.font = `${size}px "AdHeavy"`; ctx.fillStyle = INK; ctx.textAlign = 'center';
      ctx.fillText(cap.l2, W / 2, y2);
    } else outlined(ctx, cap.l2, W / 2, y2, size, YELLOW);
  }
  ctx.restore();
}

function pillRow(ctx, items, alpha, yAbs, h, fontPx, bg, fg) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.font = `${fontPx}px "AdHeavy"`;
  const padX = h * 0.45, gap = 18;
  const ws = items.map(t => ctx.measureText(t).width + padX * 2);
  let x = (W - (ws.reduce((a, b) => a + b, 0) + gap * (items.length - 1))) / 2;
  items.forEach((t, i) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x, yAbs, ws[i], h, h / 2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(t, x + ws[i] / 2, yAbs + h / 2 + 2);
    x += ws[i] + gap;
  });
  ctx.restore();
}

const drawPills = (ctx, items, alpha, yR) =>
  pillRow(ctx, items, alpha, (BANDED ? MID_Y + MID_H * (yR ?? 0.72) : H * (yR ?? 0.63)), 78, 38, RED, '#FFF');
const drawSpecs = (ctx, items, alpha, yR) =>
  pillRow(ctx, items, alpha, (BANDED ? MID_Y + MID_H * (yR ?? 0.82) : H * (yR ?? 0.72)), 74, 34, '#FFF', INK);

function drawRibbon(ctx, text, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  const bh = 112, cy = BANDED ? MID_Y + MID_H * 0.90 : H * 0.80;
  ctx.translate(W / 2, cy); ctx.rotate(-1.8 * Math.PI / 180);
  ctx.fillStyle = RED; ctx.fillRect(-W * 0.56, -bh / 2, W * 1.12, bh);
  ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const s = fitFont(ctx, text, W * 0.84, 54);
  ctx.font = `${s}px "AdHeavy"`; ctx.fillText(text, 0, 3);
  ctx.restore();
}

function drawBrand(ctx) {
  const bw = 196, bh = 128, x = FRAME_PX, y = (BANDED ? MID_Y + 10 : H * 0.055);
  ctx.fillStyle = RED; ctx.fillRect(x, y, bw, bh);
  ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = `44px "AdHeavy"`; ctx.fillText('EASY', x + bw / 2, y + 58);
  ctx.font = `40px "AdHeavy"`; ctx.fillText('HOUSE', x + bw / 2, y + 106);
}

function drawFrame(ctx) {
  ctx.strokeStyle = RED; ctx.lineWidth = FRAME_PX * 2;
  ctx.strokeRect(0, 0, W, H);
}

/** 상단 제목띠 */
function drawTitle(ctx) {
  ctx.fillStyle = BAND;
  ctx.fillRect(0, 0, W, TOP_H);
  const lines = Array.isArray(R.title) ? R.title : [R.title];
  const maxW = W * 0.88;
  let size = 96;
  lines.forEach(l => { size = Math.min(size, fitFont(ctx, l, maxW, 96)); });
  ctx.font = `${size}px "AdHeavy"`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  const lh = size * 1.22;
  const blockH = lh * (lines.length - 1) + size;
  let y = (TOP_H - blockH) / 2 + size * 0.82;
  lines.forEach((l, i) => {
    ctx.fillStyle = (R.titleHl === i) ? YELLOW : '#FFFFFF';
    ctx.fillText(l, W / 2, y + i * lh);
  });
}

/** 하단 행동버튼띠 — 구독 / 좋아요(정적) / 아래 영상 클릭(강조 애니메이션) */
function drawCTA(ctx, f) {
  const y0 = H - BOT_H;
  ctx.fillStyle = BAND;
  ctx.fillRect(0, y0, W, BOT_H);

  const cta = R.cta || {};

  // 1행: 구독(빨강) + 좋아요(흰색) — 정적, 애니메이션 없음
  const rowY = y0 + 30, h = 104;
  ctx.font = `46px "AdHeavy"`;
  const a = cta.subscribe || '구독', b = cta.like || '좋아요';
  const padX = 52, gap = 24;
  const wa = ctx.measureText(a).width + padX * 2;
  const wb = ctx.measureText(b).width + padX * 2;
  let x = (W - (wa + wb + gap)) / 2;

  ctx.fillStyle = RED;
  ctx.beginPath(); ctx.roundRect(x, rowY, wa, h, h / 2); ctx.fill();
  ctx.fillStyle = '#FFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `46px "AdHeavy"`; ctx.fillText(a, x + wa / 2, rowY + h / 2 + 2);

  x += wa + gap;
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.roundRect(x, rowY, wb, h, h / 2); ctx.fill();
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `46px "AdHeavy"`; ctx.fillText(b, x + wb / 2, rowY + h / 2 + 2);

  // 2행: 노란 바(아래 영상 클릭) — 여기에 펄스 애니메이션 집중
  const pulse = 1 + 0.05 * Math.sin(f / 6);
  const barY = y0 + 164, barH = 96;
  const cx = W / 2, cy = barY + barH / 2;
  const label = cta.click || '아래 영상 클릭';

  ctx.save();
  ctx.translate(cx, cy); ctx.scale(pulse, pulse); ctx.translate(-cx, -cy);
  ctx.shadowColor = 'rgba(255,227,0,0.55)';
  ctx.shadowBlur = 22 + 10 * Math.sin(f / 6);
  ctx.fillStyle = YELLOW;
  ctx.beginPath(); ctx.roundRect(W * 0.10, barY, W * 0.80, barH, barH / 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const s = fitFont(ctx, label, W * 0.60, 50);
  ctx.font = `${s}px "AdHeavy"`; ctx.fillText(label, cx, cy + 2);
  ctx.restore();

  // 깜빡이며 아래로 튀는 화살표 3개
  const ax = W / 2, ay = barY + barH + 30;
  for (let i = 0; i < 3; i++) {
    const phase = (f / 7 - i * 0.9);
    const al = 0.35 + 0.65 * Math.max(0, Math.sin(phase));
    const bounce = Math.max(0, Math.sin(phase)) * 6;
    ctx.save(); ctx.globalAlpha = al;
    ctx.fillStyle = YELLOW;
    ctx.beginPath();
    const yy = ay + i * 24 + bounce;
    ctx.moveTo(ax - 28, yy); ctx.lineTo(ax + 28, yy); ctx.lineTo(ax, yy + 24);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

/** 소스를 지정 사각형에 그림 */
function drawSource(ctx, img, mode, zoom, offY, rect) {
  const { x: rx, y: ry, w: rw, h: rh } = rect;
  ctx.save();
  ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();
  if (mode === 'fit') {
    const bs = Math.max(rw / img.width, rh / img.height) * 1.3;
    ctx.filter = 'blur(56px)';
    ctx.drawImage(img, rx + (rw - img.width * bs) / 2, ry + (rh - img.height * bs) / 2, img.width * bs, img.height * bs);
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(rx, ry, rw, rh);
    const s = Math.min(rw / img.width, rh / img.height) * zoom;
    ctx.drawImage(img, rx + (rw - img.width * s) / 2, ry + (rh - img.height * s) / 2 + (offY || 0), img.width * s, img.height * s);
  } else {
    const s = Math.max(rw / img.width, rh / img.height) * zoom;
    ctx.drawImage(img, rx + (rw - img.width * s) / 2, ry + (rh - img.height * s) / 2 + (offY || 0), img.width * s, img.height * s);
  }
  ctx.restore();
}

(async () => {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const RECT = { x: 0, y: MID_Y, w: W, h: MID_H };
  let n = 0;

  for (let ci = 0; ci < R.cuts.length; ci++) {
    const cut = R.cuts[ci];
    const nFrames = Math.round((cut.sec || 3) * FPS);
    let stills = null, clipFrames = null;

    if (cut.type === 'video') clipFrames = extractClip(cut, ci, nFrames);
    else stills = await loadImage(path.isAbsolute(cut.src) ? cut.src : path.join(SP, cut.src));

    for (let f = 0; f < nFrames; f++) {
      const t = nFrames > 1 ? f / (nFrames - 1) : 0;
      const e = ease(t);
      const zoom = cut.kb === 'in' ? 1 + 0.08 * e : cut.kb === 'out' ? 1.08 - 0.08 * e : 1;

      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      const img = clipFrames
        ? await loadImage(clipFrames[Math.min(f, clipFrames.length - 1)])
        : stills;
      drawSource(ctx, img, cut.fit || 'cover', zoom, (cut.offY || 0) * MID_H, RECT);

      // 스크림 (영상 영역 안에서만)
      let g = ctx.createLinearGradient(0, MID_Y, 0, MID_Y + MID_H * 0.42);
      g.addColorStop(0, 'rgba(0,0,0,0.60)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, MID_Y, W, MID_H * 0.42);
      g = ctx.createLinearGradient(0, MID_Y + MID_H * 0.70, 0, MID_Y + MID_H);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = g; ctx.fillRect(0, MID_Y + MID_H * 0.70, W, MID_H * 0.30);

      const fade = Math.min(1, f / 5);
      drawCaption(ctx, cut.caption, fade);
      if (cut.pills) drawPills(ctx, cut.pills, Math.min(1, Math.max(0, (f - 6) / 6)), cut.pillsY);
      if (cut.specs) drawSpecs(ctx, cut.specs, Math.min(1, Math.max(0, (f - 8) / 6)), cut.specsY);
      if (cut.ribbon) drawRibbon(ctx, cut.ribbon, Math.min(1, Math.max(0, (f - 8) / 8)));
      if (cut.brand !== false) drawBrand(ctx);

      if (BANDED) { drawTitle(ctx); drawCTA(ctx, n); }
      drawFrame(ctx);

      fs.writeFileSync(path.join(FRAMES, String(n).padStart(5, '0') + '.jpg'),
                       canvas.toBuffer('image/jpeg', 92));
      n++;
    }
    process.stdout.write(`  컷 ${ci + 1}/${R.cuts.length} 완료 (${n}프레임)\n`);
  }

  const out = R.out;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const silent = path.join(WORK, 'silent.mp4');
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-framerate', String(FPS),
    '-i', path.join(FRAMES, '%05d.jpg'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent]);

  const vo = R.cuts.map((c, i) => ({ cut: c, i })).filter(x => x.cut.vo);
  if (vo.length) {
    let t = 0;
    const starts = R.cuts.map(c => { const s = t; t += (c.sec || 3); return s; });
    const args = ['-y', '-loglevel', 'error', '-i', silent];
    vo.forEach(x => args.push('-i', path.isAbsolute(x.cut.vo) ? x.cut.vo : path.join(SP, x.cut.vo)));
    const delays = vo.map((x, k) =>
      `[${k + 1}:a]adelay=${Math.round(starts[x.i] * 1000)}|${Math.round(starts[x.i] * 1000)}[a${k}]`);
    const mix = vo.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${vo.length}:normalize=0[aout]`;
    args.push('-filter_complex', delays.join(';') + ';' + mix,
      '-map', '0:v', '-map', '[aout]', '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out);
    execFileSync(FFMPEG, args);
  } else {
    fs.copyFileSync(silent, out);
  }

  const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ ${out}`);
  console.log(`   ${(n / FPS).toFixed(1)}초 / ${W}x${H} / ${mb} MB / 레이아웃 ${BANDED ? 'banded' : 'full'}`);
})();
