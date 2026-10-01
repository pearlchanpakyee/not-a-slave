import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import RoastModal from '../components/RoastModal';
import WeeklyStats from '../components/WeeklyStats';
import { useSettings } from '../context/SettingsContext';
import { DRINKS, EMPTY_COUNTS, crossedThreshold, dateKey, getTip } from '../lib/drinks';
import { useLocalStorage } from '../lib/storage';

const ACCENT = '#0e9f8e';

export default function DrinksPage() {
  const { settings } = useSettings();
  // { "2026-10-01": { coffee, sweet, alcohol, water }, ... }
  const [data, setData] = useLocalStorage('drinks', {});
  const [today, setToday] = useState(dateKey());
  const [alertId, setAlertId] = useState(null);
  // Which drinks already showed their big roast modal today: { "2026-10-01": ["coffee"] }.
  // Saving only today's entry also drops older days.
  const [alerted, setAlerted] = useLocalStorage('drinksAlerted', {});

  // Roll over to the new day if the page stays open past midnight.
  useEffect(() => {
    const refresh = () => setToday(dateKey());
    const interval = setInterval(refresh, 60000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const counts = { ...EMPTY_COUNTS, ...data[today] };

  const change = (drink, delta) => {
    const prev = counts[drink.id];
    const next = Math.max(0, prev + delta);
    if (next === prev) return;
    setData((d) => ({ ...d, [today]: { ...EMPTY_COUNTS, ...d[today], [drink.id]: next } }));
    const shownToday = alerted[today] || [];
    if (delta > 0 && crossedThreshold(drink, prev, next) && !shownToday.includes(drink.id)) {
      setAlerted({ [today]: [...shownToday, drink.id] });
      setAlertId(drink.id);
    }
  };

  const alertDrink = DRINKS.find((d) => d.id === alertId);
  const dateLabel = new Date().toLocaleDateString('zh-HK', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <main style={{ '--accent': ACCENT }} className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <Link to="/" className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> 返回主頁
      </Link>
      <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-black">
        <span aria-hidden="true">🥤</span> 拯救你的kidney
      </h2>
      <p className="mt-1 text-sm text-muted">今日 · {dateLabel}</p>

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DRINKS.map((drink) => {
          const count = counts[drink.id];
          const tip = getTip(drink, count);
          return (
            <li
              key={drink.id}
              className="rounded-3xl border border-line bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_14%,var(--card))] text-2xl"
                >
                  {drink.emoji}
                </span>
                <div className="min-w-0">
                  <p className="font-bold leading-snug">{drink.label}</p>
                  {drink.note && <p className="text-xs text-muted">{drink.note}</p>}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => change(drink, -1)}
                  disabled={count === 0}
                  aria-label={`減少一杯${drink.label}`}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-line text-ink transition active:scale-90 disabled:opacity-30"
                >
                  <Minus size={20} />
                </button>
                <p className="min-w-[3ch] text-center font-display text-5xl font-black tabular-nums" aria-live="polite">
                  {count}
                  <span className="ml-1 text-base font-bold text-muted">杯</span>
                </p>
                <button
                  type="button"
                  onClick={() => change(drink, 1)}
                  aria-label={`增加一杯${drink.label}`}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-white transition active:scale-90"
                >
                  <Plus size={20} />
                </button>
              </div>

              <p
                className={
                  'mt-3 min-h-[1.25rem] text-center text-sm font-medium ' +
                  (drink.good ? 'text-[#0e9f8e]' : 'text-signal')
                }
              >
                {tip}
              </p>
            </li>
          );
        })}
      </ul>

      <WeeklyStats data={data} today={today} userName={settings.userName} />

      {alertDrink && (
        <RoastModal drink={alertDrink} userName={settings.userName} onClose={() => setAlertId(null)} />
      )}
    </main>
  );
}
