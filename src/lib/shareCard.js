import { DRINKS, DRINK_META } from './drinks';

// Draws the 1080x1920 (IG Story ratio) summary card onto a canvas.
export const AVATAR_URL = `${import.meta.env.BASE_URL}pearl_avatar.png`;
const W = 1080;
const H = 1920;
const SANS = '"Noto Sans HK","PingFang HK","Microsoft JhengHei",sans-serif';
const SERIF = '"Noto Serif HK","PingFang HK","Microsoft JhengHei",serif';
const MUTED = '#9aa4b2';
const INK = '#eef1f5';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function renderShareCard({ userName, rangeLabel, summary, avatarUrl }) {
  try {
    await Promise.all([document.fonts.load(`900 64px ${SERIF}`), document.fonts.load(`700 40px ${SANS}`)]);
  } catch {
    /* fall back to system fonts */
  }
  const avatar = await loadImage(avatarUrl);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'alphabetic';

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#16202c');
  bg.addColorStop(1, '#0b1016');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = `900 58px ${SERIF}`;
  ctx.fillText('我哋呢班打工仔～', W / 2, 150);
  ctx.fillStyle = MUTED;
  ctx.font = `500 34px ${SANS}`;
  ctx.fillText('Not A Slave!', W / 2, 205);

  // Heading + range
  ctx.fillStyle = INK;
  ctx.font = `700 46px ${SANS}`;
  ctx.fillText('本週打工仔健康指數', W / 2, 330);
  ctx.fillStyle = MUTED;
  ctx.font = `500 34px ${SANS}`;
  ctx.fillText(rangeLabel, W / 2, 385);

  // Score
  const { band, score, totals, favourite } = summary;
  ctx.fillStyle = band.color;
  ctx.font = `900 360px ${SERIF}`;
  ctx.fillText(String(score), W / 2, 700);
  ctx.fillStyle = MUTED;
  ctx.font = `500 40px ${SANS}`;
  ctx.fillText('/ 100', W / 2, 765);

  // Band title + comment
  ctx.fillStyle = INK;
  ctx.font = `900 76px ${SERIF}`;
  ctx.fillText(band.title, W / 2, 890);
  ctx.fillStyle = MUTED;
  ctx.font = `500 42px ${SANS}`;
  wrapLines(ctx, band.line, 860).forEach((l, i) => ctx.fillText(l, W / 2, 965 + i * 60));

  // Distribution bars
  const maxTotal = Math.max(1, ...DRINKS.map((d) => totals[d.id]));
  const barX = 430;
  const barW = 440;
  DRINKS.forEach((d, i) => {
    const y = 1150 + i * 100;
    ctx.textAlign = 'left';
    ctx.fillStyle = INK;
    ctx.font = `700 40px ${SANS}`;
    ctx.fillText(`${d.emoji} ${DRINK_META[d.id].short}`, 100, y + 14);

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRect(ctx, barX, y - 14, barW, 30, 15);
    ctx.fill();
    const w = Math.max(totals[d.id] > 0 ? 30 : 0, (totals[d.id] / maxTotal) * barW);
    if (w > 0) {
      ctx.fillStyle = DRINK_META[d.id].color;
      roundRect(ctx, barX, y - 14, w, 30, 15);
      ctx.fill();
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = INK;
    ctx.font = `700 40px ${SANS}`;
    ctx.fillText(`${totals[d.id]} 杯`, W - 100, y + 14);
  });

  // Favourite
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = `700 50px ${SANS}`;
  const fav = favourite.ids.map((id) => DRINK_META[id].short).join('、');
  ctx.fillText(`本週最愛：${fav}`, W / 2, 1620);

  // Footer: avatar + name
  const size = 150;
  const ax = 100;
  const ay = 1690;
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    const side = Math.min(avatar.width, avatar.height);
    const sy = (avatar.height - side) * 0.18;
    ctx.drawImage(avatar, 0, sy, side, side, ax, ay, size, size);
    ctx.restore();
    ctx.lineWidth = 6;
    ctx.strokeStyle = band.color;
    ctx.beginPath();
    ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = `700 48px ${SANS}`;
  ctx.fillText(userName, ax + size + 40, ay + 70);
  ctx.fillStyle = MUTED;
  ctx.font = `500 34px ${SANS}`;
  ctx.fillText('#NotASlave  #打工仔', ax + size + 40, ay + 124);

  return canvas;
}
