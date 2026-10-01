import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import WlbReport from '../components/WlbReport';
import WlbSettleModal from '../components/WlbSettleModal';
import { useSettings } from '../context/SettingsContext';
import { dateKey } from '../lib/drinks';
import { useLocalStorage } from '../lib/storage';
import { buildSettlement, clockOutTarget, fmtClock, fmtDuration, parseKey, toMin } from '../lib/wlb';

const ACCENT = '#3b5bdb';

export default function WlbPage() {
  const { settings } = useSettings();
  // { "2026-10-01": { outMin, startMin, endMin } } — one record per work day, last tap wins.
  const [data, setData] = useLocalStorage('wlb', {});
  const [now, setNow] = useState(() => new Date());
  const [settlement, setSettlement] = useState(null);

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const interval = setInterval(refresh, 30000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const startMin = toMin(settings.workStart);
  const endMin = toMin(settings.workEnd);
  const target = clockOutTarget(now, startMin);
  const record = data[target.key];

  const clockOut = () => {
    const t = clockOutTarget(new Date(), startMin);
    const rec = { outMin: t.outMin, startMin, endMin };
    setData((d) => ({ ...d, [t.key]: rec }));
    setSettlement(buildSettlement(t.date, rec));
    setNow(new Date());
  };

  const dateLabel = now.toLocaleDateString('zh-HK', { month: 'long', day: 'numeric', weekday: 'long' });
  const recordWork = record ? buildSettlement(target.date, record) : null;

  return (
    <main style={{ '--accent': ACCENT }} className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <Link to="/" className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> 返回主頁
      </Link>
      <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-black">
        <span aria-hidden="true">⏳</span> 你好收工啦！
      </h2>
      <p className="mt-1 text-sm text-muted">今日 · {dateLabel}</p>

      <section className="mt-5 rounded-3xl border border-line bg-[color-mix(in_srgb,var(--accent)_9%,var(--card))] p-5 text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-muted">
          官方工時 {settings.workStart} – {settings.workEnd}
          <Link to="/settings" aria-label="修改工作時間" className="inline-flex text-muted hover:text-ink">
            <Settings size={14} />
          </Link>
        </p>

        <button
          type="button"
          onClick={clockOut}
          className="mt-4 w-full rounded-2xl bg-[var(--accent)] px-5 py-4 text-lg font-bold text-white transition active:scale-[0.97]"
        >
          🏠 {record ? '更新收工時間' : '我要收工！'}
        </button>

        {record ? (
          <div className="mt-4 text-sm">
            <p>
              今日已於 <strong>{fmtClock(record.outMin)}</strong> 收工，工時 {fmtDuration(recordWork.workMin)}
              {recordWork.otMin > 0 ? `，OT ${fmtDuration(recordWork.otMin)}` : ''}
            </p>
            <button
              type="button"
              onClick={() => setSettlement(recordWork)}
              className="mt-2 text-sm font-medium text-[var(--accent)] underline underline-offset-2"
            >
              重睇結算
            </button>
            <p className="mt-2 text-xs text-muted">再按一次會用而家時間覆蓋今日收工記錄。</p>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted">收工嗰刻㩒一下，即刻幫你計工時、OT 同剩餘 Me Time。</p>
        )}
      </section>

      <WlbReport data={data} today={dateKey(now)} userName={settings.userName} />

      {settlement && (
        <WlbSettleModal settlement={settlement} userName={settings.userName} onClose={() => setSettlement(null)} />
      )}
    </main>
  );
}
