import { WEEKDAY_LABELS, dateKey } from './drinks';
import { HK_HOLIDAYS, nextWorkday } from './hkHolidays';

// A day's record: { outMin, startMin, endMin }
//   outMin   = clock-out time in minutes since midnight of the work day (can exceed 1440 after midnight)
//   startMin / endMin = the start / official end time that were set when clocking out
// Records are stored per work day under "YYYY-MM-DD". Only the last tap of a day is kept.

export const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const fmtClock = (min) => {
  const t = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

export const fmtDuration = (min) => {
  const m = Math.round(min);
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r} 分鐘`;
  return r ? `${h} 小時 ${r} 分` : `${h} 小時`;
};

// Hours with at most 1 decimal, no trailing ".0" (e.g. 90 -> "1.5", 120 -> "2").
export const hoursLabel = (min) => (min / 60).toFixed(1).replace(/\.0$/, '');

const round1 = (n) => Math.round(n * 10) / 10;

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const weekdayName = (date) => `星期${WEEKDAY_LABELS[(date.getDay() + 6) % 7]}`;
export const monthDayLabel = (date) => `${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAY_LABELS[(date.getDay() + 6) % 7]}）`;

// Which work day does a clock-out at `now` belong to?
// Clocking out before the start time (e.g. 00:30) counts as late OT of the previous day.
export function clockOutTarget(now, startMin) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (nowMin < startMin) {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { key: dateKey(y), date: y, outMin: nowMin + 1440 };
  }
  return { key: dateKey(today), date: today, outMin: nowMin };
}

// Work time = start -> clock-out (lunch is not deducted). OT = time after the official end.
export function calcDay(rec) {
  const workMin = Math.max(0, rec.outMin - rec.startMin);
  const otMin = Math.min(workMin, Math.max(0, rec.outMin - rec.endMin));
  return {
    workMin,
    otMin,
    normalMin: workMin - otMin,
    earlyMin: Math.max(0, rec.endMin - rec.outMin),
  };
}

// Free time from clock-out until the start of the next working day
// (weekends and general holidays are skipped).
export function calcMeTime(date, outMin, startMin) {
  const next = nextWorkday(date);
  const from = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, outMin);
  const to = new Date(next.getFullYear(), next.getMonth(), next.getDate(), 0, startMin);
  const minutes = Math.round((to - from) / 60000);

  const holidayNames = [];
  let offDays = 0;
  const d = new Date(date);
  for (d.setDate(d.getDate() + 1); d < next; d.setDate(d.getDate() + 1)) {
    offDays += 1;
    const name = HK_HOLIDAYS[dateKey(d)];
    if (name && !holidayNames.includes(name)) holidayNames.push(name);
  }
  return { minutes, next, nextLabel: monthDayLabel(next), offDays, holidayNames };
}

// Everything the settlement card needs.
export function buildSettlement(date, rec) {
  return { date, rec, ...calcDay(rec), me: calcMeTime(date, rec.outMin, rec.startMin) };
}

export function settleQuip(s) {
  if (s.otMin > 0) {
    return `你今日超時 OT 咗 ${hoursLabel(s.otMin)} 個鐘，又送免費勞動力比你老細，你老細聽日隨時多咗筆錢去日本旅行呀陰質！`;
  }
  if (s.earlyMin > 0) {
    return `早走咗 ${fmtDuration(s.earlyMin)}，走得瀟灑！聽日記得準時返呀。`;
  }
  return '準時收工！今日冇送免費勞動力俾老細，叻！';
}

// ---------------------------------------------------------------------------
// Week / month report
// ---------------------------------------------------------------------------

// `days` = array of Dates. Chart values are in hours; each recorded day stacks to 24h:
// normal work + OT + private time (24h minus work time).
export function buildPeriod(data, days) {
  const perDay = days.map((date) => {
    const key = dateKey(date);
    const rec = data[key];
    const base = { key, date, label: String(date.getDate()), weekLabel: WEEKDAY_LABELS[(date.getDay() + 6) % 7] };
    if (!rec) return { ...base, has: false, normal: 0, ot: 0, priv: 0, workMin: 0, otMin: 0, outMin: null };
    const c = calcDay(rec);
    return {
      ...base,
      has: true,
      normal: round1(c.normalMin / 60),
      ot: round1(c.otMin / 60),
      priv: round1(Math.max(0, 24 - c.workMin / 60)),
      workMin: c.workMin,
      otMin: c.otMin,
      outMin: rec.outMin,
    };
  });

  const recorded = perDay.filter((d) => d.has);
  const totalWorkMin = recorded.reduce((a, d) => a + d.workMin, 0);
  const totalOtMin = recorded.reduce((a, d) => a + d.otMin, 0);
  const otDays = recorded.filter((d) => d.otMin > 0).length;
  const avgOutMin = recorded.length ? recorded.reduce((a, d) => a + d.outMin, 0) / recorded.length : null;

  let king = null;
  for (const d of recorded) if (d.otMin > 0 && (!king || d.otMin > king.otMin)) king = d;

  return {
    perDay,
    hasData: recorded.length > 0,
    recordedDays: recorded.length,
    totalWorkMin,
    totalOtMin,
    otDays,
    avgOutMin,
    king: king ? { name: `${king.date.getMonth() + 1}/${king.date.getDate()}（${weekdayName(king.date)}）`, otMin: king.otMin } : null,
  };
}

// Short roast for the period's total OT. Month thresholds are 4x the week ones.
export function otVerdict(totalOtMin, kind) {
  const h = totalOtMin / 60;
  const k = kind === 'month' ? 4 : 1;
  if (h === 0) return '零 OT！你老細冇機會多咗筆錢去旅行。';
  if (h < 5 * k) return 'OT 唔算多，仲救得返。';
  if (h < 10 * k) return 'OT 唔少，你老細可能已經訂咗去日本嘅機票。';
  return 'OT 超標！你老細隨時搬咗去日本住。';
}

export function buildWlbShareText({ kind, rangeLabel, stats }) {
  const lines = [
    `⏳ 我哋呢班打工仔～ ${kind === 'month' ? '本月' : '本週'}工時報告`,
    `📅 ${rangeLabel}`,
    `打卡 ${stats.recordedDays} 日｜總工時 ${hoursLabel(stats.totalWorkMin)} 小時｜OT ${hoursLabel(stats.totalOtMin)} 小時`,
  ];
  if (stats.king) lines.push(`OT 王：${stats.king.name}（${hoursLabel(stats.king.otMin)} 小時）`);
  lines.push(`平均收工時間：${fmtClock(stats.avgOutMin)}`);
  lines.push(`「${otVerdict(stats.totalOtMin, kind)}」`, '#NotASlave #打工仔');
  return lines.join('\n');
}
