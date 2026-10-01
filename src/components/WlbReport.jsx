import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import ShareCardModal from './ShareCardModal';
import { WEEKDAY_LABELS, dateKey, weekRangeLabel, weekStart } from '../lib/drinks';
import { buildPeriod, buildWlbShareText, fmtClock, hoursLabel, otVerdict, parseKey } from '../lib/wlb';
import { renderWlbCard } from '../lib/wlbShareCard';

const tickStyle = { style: { fill: 'var(--muted)', fontSize: 12 } };
const COLORS = { normal: '#3b5bdb', ot: '#d92d20', priv: '#8a94a6' };

export default function WlbReport({ data, today, userName }) {
  const [mode, setMode] = useState('week'); // 'week' | 'month'
  const [offset, setOffset] = useState(0); // 0 = current, -1 = previous, ...
  const [sharing, setSharing] = useState(false);

  const { days, rangeLabel, heading, tag } = useMemo(() => {
    const base = parseKey(today);
    if (mode === 'week') {
      const start = weekStart(base);
      start.setDate(start.getDate() + offset * 7);
      const list = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
      return {
        days: list,
        rangeLabel: weekRangeLabel(start),
        heading: offset === 0 ? '本週' : offset === -1 ? '上星期' : '',
        tag: dateKey(start),
      };
    }
    const first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return {
      days: Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1)),
      rangeLabel: `${first.getFullYear()}年${first.getMonth() + 1}月`,
      heading: offset === 0 ? '本月' : offset === -1 ? '上個月' : '',
      tag: `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}`,
    };
  }, [mode, offset, today]);

  const stats = useMemo(() => buildPeriod(data, days), [data, days]);
  const chartData = stats.perDay.map((d) => ({ ...d, name: mode === 'week' ? d.weekLabel : d.label }));

  const switchMode = (m) => {
    setMode(m);
    setOffset(0);
  };

  const tab = (m, text) => (
    <button
      type="button"
      onClick={() => switchMode(m)}
      aria-pressed={mode === m}
      className={
        'rounded-full px-4 py-1.5 text-sm font-bold transition ' +
        (mode === m ? 'bg-[#3b5bdb] text-white' : 'border border-line text-ink')
      }
    >
      {text}
    </button>
  );

  const stat = (label, value) => (
    <div className="rounded-2xl border border-line p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );

  return (
    <section className="mt-10" aria-label="工時報告">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-black">工時報告</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOffset((o) => o - 1)}
            aria-label={mode === 'week' ? '上一個星期' : '上一個月'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.min(0, o + 1))}
            disabled={offset === 0}
            aria-label={mode === 'week' ? '下一個星期' : '下一個月'}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {tab('week', '每週')}
        {tab('month', '每月')}
      </div>
      <p className="mt-2 text-sm text-muted">
        {heading} {rangeLabel}
        {mode === 'week' ? '（星期一至星期日）' : ''}
      </p>

      {!stats.hasData ? (
        <p className="mt-4 rounded-3xl border border-line bg-card p-6 text-center text-sm text-muted">
          {mode === 'week' ? '呢個星期' : '呢個月'}仲未有收工記錄。
        </p>
      ) : (
        <>
          <div className="mt-4 rounded-3xl border border-line bg-card p-4">
            <p className="mb-1 text-sm font-bold">每日 24 小時分佈（小時）</p>
            <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {[
                ['normal', '正常工時'],
                ['ot', 'OT'],
                ['priv', '私人時間'],
              ].map(([k, text]) => (
                <li key={k} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-3 w-3 rounded-full" style={{ background: COLORS[k] }} />
                  {text}
                </li>
              ))}
            </ul>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="name" tick={tickStyle} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
                  <YAxis domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} tick={tickStyle} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'var(--line)', opacity: 0.4 }}
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--line)',
                      borderRadius: 12,
                      color: 'var(--ink)',
                    }}
                    labelFormatter={(_, p) => {
                      const d = p?.[0]?.payload?.date;
                      return d ? `${d.getMonth() + 1}/${d.getDate()}（星期${WEEKDAY_LABELS[(d.getDay() + 6) % 7]}）` : '';
                    }}
                    formatter={(v, name) => [`${v} 小時`, name]}
                  />
                  <Bar dataKey="normal" name="正常工時" stackId="h" fill={COLORS.normal} />
                  <Bar dataKey="ot" name="OT" stackId="h" fill={COLORS.ot} />
                  <Bar dataKey="priv" name="私人時間" stackId="h" fill={COLORS.priv} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {stat('打卡日數', `${stats.recordedDays} 日`)}
            {stat('總工時', `${hoursLabel(stats.totalWorkMin)} 小時`)}
            {stat('總 OT', `${hoursLabel(stats.totalOtMin)} 小時（${stats.otDays} 日）`)}
            {stat('平均收工時間', fmtClock(stats.avgOutMin))}
          </div>

          <div className="mt-3 rounded-3xl border border-line bg-card p-5">
            <p className="text-sm text-muted">OT 王</p>
            <p className="mt-1 text-lg font-bold">
              {stats.king ? `${stats.king.name}，OT ${hoursLabel(stats.king.otMin)} 小時` : `${mode === 'week' ? '本週' : '本月'}冇 OT 🎉`}
            </p>
            <p className="mt-2 text-sm text-muted">{otVerdict(stats.totalOtMin, mode)}</p>
          </div>

          <button
            type="button"
            onClick={() => setSharing(true)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#3b5bdb] px-5 py-3.5 text-base font-bold text-white transition active:scale-[0.97]"
          >
            <Share2 size={18} /> 生成分享卡
          </button>
        </>
      )}

      {sharing && stats.hasData && (
        <ShareCardModal
          makeCard={() => renderWlbCard({ kind: mode, userName, rangeLabel, stats })}
          shareText={buildWlbShareText({ kind: mode, rangeLabel, stats })}
          fileTag={`wlb-${tag}`}
          imageAlt={mode === 'week' ? '本週工時報告分享卡' : '本月工時報告分享卡'}
          onClose={() => setSharing(false)}
        />
      )}
    </section>
  );
}
