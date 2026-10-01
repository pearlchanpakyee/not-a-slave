import { AVATAR_URL, loadImage, wrapLines } from './shareCard';
import { fmtClock, hoursLabel, otVerdict } from './wlb';

const W = 1080;
const H = 1920;
const SANS = '"Noto Sans HK","PingFang HK","Microsoft JhengHei",sans-serif';
const SERIF = '"Noto Serif HK","PingFang HK","Microsoft JhengHei",serif';
const MUTED = '#9aa4b2';
const INK = '#eef1f5';

// 1080x1920 week/month work-hours card (same look as the drinks card).
export async function renderWlbCard({ kind, userName, rangeLabel, stats }) {
  try {
    await Promise.all([document.fonts.load(`900 64px ${SERIF}`), document.fonts.load(`700 40px ${SANS}`)]);
  } catch {
    /* fall back to system fonts */
  }
  const avatar = await loadImage(AVATAR_URL);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#16202c');
  bg.addColorStop(1, '#0b1016');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const accent = stats.totalOtMin > 0 ? '#ff5a4f' : '#0e9f8e';

  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = `900 58px ${SERIF}`;
  ctx.fillText('我哋呢班打工仔～', W / 2, 150);
  ctx.fillStyle = MUTED;
  ctx.font = `500 34px ${SANS}`;
  ctx.fillText('Not A Slave!', W / 2, 205);

  ctx.fillStyle = INK;
  ctx.font = `700 46px ${SANS}`;
  ctx.fillText(kind === 'month' ? '本月打工仔工時報告' : '本週打工仔工時報告', W / 2, 330);
  ctx.fillStyle = MUTED;
  ctx.font = `500 34px ${SANS}`;
  ctx.fillText(rangeLabel, W / 2, 385);

  // Big number: total OT hours
  ctx.fillStyle = accent;
  ctx.font = `900 340px ${SERIF}`;
  ctx.fillText(hoursLabel(stats.totalOtMin), W / 2, 700);
  ctx.fillStyle = MUTED;
  ctx.font = `500 40px ${SANS}`;
  ctx.fillText('小時 OT', W / 2, 765);

  // Verdict
  ctx.fillStyle = INK;
  ctx.font = `700 48px ${SANS}`;
  wrapLines(ctx, otVerdict(stats.totalOtMin, kind), 860).forEach((l, i) => ctx.fillText(l, W / 2, 890 + i * 70));

  // Rows
  const rows = [
    ['打卡日數', `${stats.recordedDays} 日`],
    ['總工時', `${hoursLabel(stats.totalWorkMin)} 小時`],
    ['平均收工時間', fmtClock(stats.avgOutMin)],
    ['OT 王', stats.king ? `${stats.king.name} ${hoursLabel(stats.king.otMin)}h` : '—'],
  ];
  rows.forEach(([label, value], i) => {
    const y = 1180 + i * 105;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(100, y + 38, W - 200, 2);
    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED;
    ctx.font = `500 40px ${SANS}`;
    ctx.fillText(label, 100, y + 10);
    ctx.textAlign = 'right';
    ctx.fillStyle = INK;
    ctx.font = `700 42px ${SANS}`;
    ctx.fillText(value, W - 100, y + 10);
  });

  // Footer
  const size = 150;
  const ax = 100;
  const ay = 1690;
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + size / 2, ay + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    const side = Math.min(avatar.width, avatar.height);
    ctx.drawImage(avatar, 0, (avatar.height - side) * 0.18, side, side, ax, ay, size, size);
    ctx.restore();
    ctx.lineWidth = 6;
    ctx.strokeStyle = accent;
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
