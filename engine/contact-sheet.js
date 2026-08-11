/* 폴더의 이미지를 격자 컨택트시트로 합쳐 한눈에 훑기 위한 도구 */
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

GlobalFonts.registerFromPath('C:\\Windows\\Fonts\\malgunbd.ttf', 'Lbl');

const SRC = process.argv[2];
const OUT = process.argv[3];
const COLS = 6, ROWS = 5, CW = 300, CH = 225;
const PER = COLS * ROWS;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter(f => /\.(jpg|jpeg|png)$/i.test(f)).sort();
  const sheets = Math.ceil(files.length / PER);

  for (let s = 0; s < sheets; s++) {
    const canvas = createCanvas(COLS * CW, ROWS * CH);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < PER; i++) {
      const fi = s * PER + i;
      if (fi >= files.length) break;
      const img = await loadImage(path.join(SRC, files[fi]));
      const col = i % COLS, row = Math.floor(i / COLS);
      const x0 = col * CW, y0 = row * CH;
      const sc = Math.min((CW - 4) / img.width, (CH - 4) / img.height);
      const w = img.width * sc, h = img.height * sc;
      ctx.drawImage(img, x0 + (CW - w) / 2, y0 + (CH - h) / 2, w, h);

      // 번호 라벨
      const label = String(fi + 1);
      ctx.font = '22px "Lbl"';
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(x0 + 2, y0 + 2, 12 + ctx.measureText(label).width, 28);
      ctx.fillStyle = '#FFE300';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x0 + 8, y0 + 5);
    }

    const out = path.join(OUT, `sheet${s + 1}.jpg`);
    fs.writeFileSync(out, canvas.toBuffer('image/jpeg', 82));
    console.log(`${path.basename(out)}  (${Math.min(PER, files.length - s * PER)}장)`);
  }
  console.log(`\n총 ${files.length}장 / 시트 ${sheets}개`);
})();
