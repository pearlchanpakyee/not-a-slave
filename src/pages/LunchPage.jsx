import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dices, Trash2 } from 'lucide-react';
import { DISTRICTS, TYPES, getPool, getRandomRestaurant } from '../lib/lunch';
import { useLocalStorage } from '../lib/storage';

const ACCENT = '#e8590c';
const RECENT_COUNT = 3; // don't repeat the last 3 picks
const HISTORY_LIMIT = 50;
const SPIN_STEPS = 14;

function Chip({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={
        'rounded-full border px-3.5 py-1.5 text-sm font-medium transition active:scale-95 disabled:opacity-50 ' +
        (active
          ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
          : 'border-line bg-card text-ink hover:border-[var(--accent)]')
      }
    >
      {children}
    </button>
  );
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('zh-HK', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function LunchPage() {
  const [district, setDistrict] = useState('');
  const [type, setType] = useState('');
  const [history, setHistory] = useLocalStorage('lunchHistory', []); // newest first
  const [spinning, setSpinning] = useState(false);
  const [reel, setReel] = useState(null);
  const [result, setResult] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const pool = getPool(district, type);

  const draw = () => {
    if (spinning) return;
    const recentIds = history.slice(0, RECENT_COUNT).map((h) => h.id);
    const pick = getRandomRestaurant(district, type, recentIds);
    if (!pick) return;

    const finish = () => {
      setSpinning(false);
      setReel(null);
      setResult(pick);
      setHistory((prev) =>
        [{ ...pick, at: new Date().toISOString() }, ...prev].slice(0, HISTORY_LIMIT)
      );
    };

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    setSpinning(true);
    setResult(null);
    let step = 0;
    const tick = () => {
      step += 1;
      if (step >= SPIN_STEPS) {
        finish();
        return;
      }
      setReel(pool[Math.floor(Math.random() * pool.length)]);
      timer.current = setTimeout(tick, 60 + step * step * 1.4); // slows down towards the end
    };
    tick();
  };

  const clearHistory = () => {
    if (window.confirm('確定要清除所有抽籤記錄？')) setHistory([]);
  };

  const shown = spinning ? reel : result;

  return (
    <main style={{ '--accent': ACCENT }} className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <Link to="/" className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> 返回主頁
      </Link>
      <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-black">
        <span aria-hidden="true">🍱</span> 今日食咩？
      </h2>

      {/* Filters */}
      <section className="mt-5 space-y-4" aria-label="篩選">
        <div>
          <p className="mb-2 text-sm font-bold">地區</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={district === ''} disabled={spinning} onClick={() => setDistrict('')}>
              全部
            </Chip>
            {DISTRICTS.map((d) => (
              <Chip key={d} active={district === d} disabled={spinning} onClick={() => setDistrict(d)}>
                {d}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">類型</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={type === ''} disabled={spinning} onClick={() => setType('')}>
              全部
            </Chip>
            {TYPES.map((t) => (
              <Chip key={t} active={type === t} disabled={spinning} onClick={() => setType(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Draw area */}
      <section className="mt-6 rounded-3xl border border-line bg-[color-mix(in_srgb,var(--accent)_9%,var(--card))] p-5 text-center">
        <div className="flex min-h-[8.5rem] flex-col items-center justify-center" aria-live="polite">
          {shown ? (
            <>
              <p
                className={
                  'font-display text-3xl font-black leading-tight ' +
                  (spinning ? 'text-muted' : 'text-ink')
                }
              >
                {shown.name}
              </p>
              <p className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
                <span className="rounded-full bg-card px-2.5 py-0.5 font-medium">{shown.district}</span>
                <span className="rounded-full bg-card px-2.5 py-0.5 font-medium">{shown.type}</span>
                <span className="rounded-full bg-card px-2.5 py-0.5 font-bold">{shown.priceRange}</span>
              </p>
            </>
          ) : pool.length === 0 ? (
            <p className="text-sm text-muted">呢個地區同類型暫時未有餐廳，試下轉其他條件。</p>
          ) : (
            <p className="text-sm text-muted">揀好條件，㩒掣抽今日午餐。</p>
          )}
        </div>

        <button
          type="button"
          onClick={draw}
          disabled={spinning || pool.length === 0}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-base font-bold text-white transition active:scale-[0.97] disabled:opacity-50 sm:w-auto sm:min-w-[12rem]"
        >
          <Dices size={20} className={spinning ? 'motion-safe:animate-spin' : ''} />
          {spinning ? '抽緊…' : result ? '唔食呢間，再抽' : '抽！'}
        </button>
        <p className="mt-3 text-xs text-muted">符合條件：{pool.length} 間（會避開最近抽中嘅 {RECENT_COUNT} 間）</p>
      </section>

      {/* History */}
      <section className="mt-8" aria-label="抽籤記錄">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">抽籤記錄</h3>
          {history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-muted hover:text-signal"
            >
              <Trash2 size={14} /> 清除
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">仲未抽過，第一次抽籤後會喺呢度出現。</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
            {history.map((h, i) => (
              <li key={h.at + '-' + i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{h.name}</p>
                  <p className="text-xs text-muted">
                    {h.district} · {h.type} · {h.priceRange}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted" dateTime={h.at}>
                  {formatTime(h.at)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
