import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import ShareCardModal from './ShareCardModal';
import { DRINKS, DRINK_META, buildShareText, dateKey, weekRangeLabel, weekStart, weekSummary } from '../lib/drinks';
import { AVATAR_URL, renderShareCard } from '../lib/shareCard';

const tickStyle = { style: { fill: 'var(--muted)', fontSize: 12 } };

export default function WeeklyStats({ data, today, userName }) {
  const [offset, setOffset] = useState(0); // 0 = this week, -1 = last week, ...
  const [sharing, setSharing] = useState(false);

  const start = useMemo(() => {
    const [y, m, d] = today.split('-').map(Number);
    const s = weekStart(new Date(y, m - 1, d));
    s.setDate(s.getDate() + offset * 7);
    return s;
  }, [today, offset]);

  const startKey = dateKey(start);
  const summary = useMemo(() => weekSummary(data, start), [data, startKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const rangeLabel = weekRangeLabel(start);
  const heading = offset === 0 ? '本週' : offset === -1 ? '上星期' : '';

  const favouriteText = summary.favourite
    ? summary.favourite.ids.map((id) => `${DRINKS.find((d) => d.id === id).emoji} ${DRINK_META[id].short}`).join('、') +
      `（${summary.favourite.count} 杯）`
    : null;

  return (
    <section className="mt-10" aria-label="每週統計">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl font-black">每週統計</h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOffset((o) => o - 1)}
            aria-label="上一個星期"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => setOffset((o) => Math.min(0, o + 1))}
            disabled={offset === 0}
            aria-label="下一個星期"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <p className="mt-1 text-sm text-muted">
        {heading} {rangeLabel}（星期一至星期日）
      </p>

      {!summary.hasData ? (
        <p className="mt-4 rounded-3xl border border-line bg-card p-6 text-center text-sm text-muted">
          呢個星期仲未有飲品記錄。
        </p>
      ) : (
        <>
          {/* Score */}
          <div className="mt-4 rounded-3xl border border-line bg-card p-5 text-center">
            <p className="text-sm font-bold text-muted">每週打工仔健康指數</p>
            <p className="mt-1 font-display text-7xl font-black tabular-nums" style={{ color: summary.band.color }}>
              {summary.score}
              <span className="ml-1 text-xl font-bold text-muted">/ 100</span>
            </p>
            <p className="mt-2 font-display text-2xl font-black">{summary.band.title}</p>
            <p className="mt-1 text-sm text-muted">{summary.band.line}</p>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              計法：滿分 100。每杯手搖/汽水 −5、每杯酒 −6、咖啡每日第 3 杯起每杯 −4；每日飲水達 8 杯 +5。
            </p>
          </div>

          {/* Favourite + totals */}
          <div className="mt-3 rounded-3xl border border-line bg-card p-5">
            <p className="text-sm text-muted">本週最愛飲品</p>
            <p className="mt-1 text-lg font-bold">{favouriteText}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {DRINKS.map((d) => (
                <li key={d.id} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: DRINK_META[d.id].color }}
                  />
                  <span className="truncate">{DRINK_META[d.id].short}</span>
                  <span className="ml-auto font-bold tabular-nums">{summary.totals[d.id]} 杯</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chart */}
          <div className="mt-3 rounded-3xl border border-line bg-card p-4">
            <p className="mb-2 text-sm font-bold">每日飲品分佈（杯）</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.perDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="label" tick={tickStyle} tickLine={false} axisLine={{ stroke: 'var(--line)' }} />
                  <YAxis allowDecimals={false} tick={tickStyle} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'var(--line)', opacity: 0.4 }}
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--line)',
                      borderRadius: 12,
                      color: 'var(--ink)',
                    }}
                    labelFormatter={(l) => `星期${l}`}
                  />
                  {DRINKS.map((d) => (
                    <Bar
                      key={d.id}
                      dataKey={d.id}
                      name={DRINK_META[d.id].short}
                      stackId="cups"
                      fill={DRINK_META[d.id].color}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSharing(true)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-base font-bold text-white transition active:scale-[0.97]"
          >
            <Share2 size={18} /> 生成分享卡
          </button>
        </>
      )}

      {sharing && summary.hasData && (
        <ShareCardModal
          makeCard={() => renderShareCard({ userName, rangeLabel, summary, avatarUrl: AVATAR_URL })}
          shareText={buildShareText({ rangeLabel, summary })}
          fileTag={startKey}
          imageAlt="本週飲品報告分享卡"
          onClose={() => setSharing(false)}
        />
      )}
    </section>
  );
}
