// 拯救你的kidney — drink categories, roast copy and daily-count helpers.

export const DRINKS = [
  {
    id: 'coffee',
    emoji: '☕',
    label: '咖啡',
    threshold: 3,
    good: false,
    modalTitle: '⚠️ 警告！',
    modalButton: '知道喇，我收皮',
    modal: (name) =>
      `${name}，今日已經第 3 杯咖啡喇！心臟同個電油筒真係頂得順？心臟 is knocking the door 呀陰質！`,
    tips: [
      '仲飲？個心跳緊 disco 呀陰質！',
      '咖啡因已經喺血管入面開派對喇！',
      '今晚瞓唔瞓得著，睇你個心臟批唔批准。',
      '再飲落去，個心跳都快過你部電腦喇。',
    ],
  },
  {
    id: 'sweet',
    emoji: '🧋',
    label: '手搖 / 奶茶 / 汽水',
    note: '邪惡糖分炸彈',
    threshold: 2,
    good: false,
    modalTitle: '⚠️ 警告！',
    modalButton: '知道喇，我收皮',
    modal: (name) =>
      `${name}，今日第 2 杯手搖/汽水喇！糖分超載，個肚腩正在以肉眼可見嘅速度放大呀陰質！`,
    tips: [
      '仲飲？糖尿病喺度同你揮手呀陰質！',
      '又一杯糖水，個肚腩話多謝款待。',
      '今日嘅糖分配額已經破產喇！',
      '杯入面嘅冰塊都比你嘅自制力多。',
    ],
  },
  {
    id: 'alcohol',
    emoji: '🍺',
    label: '酒精 / 啤酒',
    threshold: 3,
    good: false,
    modalTitle: '⚠️ 警告！',
    modalButton: '知道喇，我收皮',
    modal: (name) =>
      `${name}，今日第 3 杯酒喇喂！你個肚腩正在以光速膨脹，聽朝返工照鏡唔好喊呀拿！`,
    tips: [
      '仲飲？聽朝返工邊個幫你頂住對眼？',
      '個肚腩話佢已經冇位擺啤酒喇！',
      '肝臟：「我唔係呢份工嘅 OT 對象。」',
      '再飲落去就同你老細一齊爆肝喇！',
    ],
  },
  {
    id: 'water',
    emoji: '💧',
    label: '水',
    threshold: 8,
    good: true,
    modalTitle: '🎉 好嘢！',
    modalButton: '多謝腎臟',
    modal: (name) => `${name}，今日水分充足，腎臟終於唔需要哭泣喇，抵你今晚準時收工！`,
    tips: [
      '水分爆燈！腎臟向你致敬 🫡',
      '仲飲？你係魚咩？不過抵讚！',
      '腎臟已經喺度開慶功宴。',
    ],
  },
];

export const EMPTY_COUNTS = { coffee: 0, sweet: 0, alcohol: 0, water: 0 };

// Local-time date key, e.g. "2026-10-01". Counts are stored per day under this key.
export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Small line shown under a counter. Returns null while the count is below the threshold.
// At the threshold itself: a status line. Beyond it: a rotating tip (changes with each extra cup).
export function getTip(drink, count) {
  if (count < drink.threshold) return null;
  if (count === drink.threshold) {
    return drink.good ? '今日水分達標 ✅' : `已達警戒線（${drink.threshold} 杯）`;
  }
  return drink.tips[(count - drink.threshold - 1) % drink.tips.length];
}

// True only when this tap moves the count from (threshold - 1) up to the threshold.
export function crossedThreshold(drink, prev, next) {
  return prev === drink.threshold - 1 && next === drink.threshold;
}

// ---------------------------------------------------------------------------
// Weekly stats (calendar week, Monday – Sunday)
// ---------------------------------------------------------------------------

export const DRINK_META = {
  coffee: { short: '咖啡', color: '#8d5524' },
  sweet: { short: '手搖汽水', color: '#e8590c' },
  alcohol: { short: '酒精', color: '#d99100' },
  water: { short: '水', color: '#0e9f8e' },
};

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

// Monday of the week containing `date` (local time, midnight).
export function weekStart(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export function weekRangeLabel(start) {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getMonth() + 1}/${start.getDate()} 至 ${end.getMonth() + 1}/${end.getDate()}`;
}

// Score (0–100). Start at 100, then per day:
//   sweet drink  -5 each | alcohol -6 each | coffee -4 per cup from the 3rd cup | water >= 8: +5
export function calcHealthScore(perDay) {
  let score = 100;
  for (const day of perDay) {
    score -= day.sweet * 5;
    score -= day.alcohol * 6;
    score -= Math.max(0, day.coffee - 2) * 4;
    if (day.water >= 8) score += 5;
  }
  return Math.max(0, Math.min(100, score));
}

const BANDS = [
  { min: 90, title: '養生達人', line: '腎臟感謝你，成個禮拜好似去咗 spa。', color: '#0e9f8e' },
  { min: 75, title: '打工仔標準水準', line: '唔算好但都未死，繼續撐住啦。', color: '#3b9f4a' },
  { min: 60, title: '邊緣打工仔', line: '腎臟開始皺眉，下個禮拜多飲啲水啦。', color: '#d99100' },
  { min: 30, title: '電油筒隨時報廢', line: '腎臟在哭泣，你部機要保養喇。', color: '#e8590c' },
  { min: 0, title: '腎臟已遞辭職信', line: '呢個禮拜嘅飲品清單，連 HR 都唔敢睇。', color: '#d92d20' },
];

export function scoreBand(score) {
  return BANDS.find((b) => score >= b.min);
}

// Summary for the week starting at `start` (a Monday Date). `data` is { "YYYY-MM-DD": counts }.
export function weekSummary(data, start) {
  const perDay = WEEKDAY_LABELS.map((label, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = dateKey(d);
    return { key, label, ...EMPTY_COUNTS, ...data[key] };
  });

  const totals = { ...EMPTY_COUNTS };
  for (const day of perDay) for (const id of Object.keys(totals)) totals[id] += day[id];

  const max = Math.max(...Object.values(totals));
  const hasData = max > 0;
  const favourite = hasData
    ? { ids: DRINKS.filter((d) => totals[d.id] === max).map((d) => d.id), count: max }
    : null;
  const score = hasData ? calcHealthScore(perDay) : null;

  return { perDay, totals, hasData, favourite, score, band: hasData ? scoreBand(score) : null };
}

// Plain-text version for pasting into Threads / IG captions.
export function buildShareText({ rangeLabel, summary }) {
  const { totals, favourite, score, band } = summary;
  const fav = favourite.ids.map((id) => DRINK_META[id].short).join('、');
  return [
    '🥤 我哋呢班打工仔～ 本週飲品報告',
    `📅 ${rangeLabel}`,
    `健康指數：${score}/100｜${band.title}`,
    DRINKS.map((d) => `${d.emoji}${DRINK_META[d.id].short} ${totals[d.id]}杯`).join('  '),
    `最愛飲品：${fav}`,
    `「${band.line}」`,
    '#NotASlave #打工仔',
  ].join('\n');
}
