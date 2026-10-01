import { useEffect, useRef } from 'react';
import { AVATAR_URL } from '../lib/shareCard';
import { fmtClock, fmtDuration, hoursLabel, settleQuip } from '../lib/wlb';

export default function WlbSettleModal({ settlement: s, userName, onClose }) {
  const btnRef = useRef(null);

  useEffect(() => {
    btnRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const { me } = s;
  const overtime = s.otMin > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settle-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop max-h-full w-full max-w-sm overflow-y-auto rounded-3xl border border-line bg-card p-5"
      >
        <div className="flex items-center gap-3">
          <img
            src={AVATAR_URL}
            alt="Pearl"
            className="h-16 w-16 shrink-0 rounded-full border-2 border-line object-cover"
            style={{ objectPosition: '50% 18%' }}
          />
          <div>
            <h3 id="settle-title" className="font-display text-xl font-black">
              收工啦，{userName}！
            </h3>
            <p className="text-sm text-muted">收工時間 {fmtClock(s.rec.outMin)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-line p-4">
            <p className="text-sm text-muted">今日總工時</p>
            <p className="mt-1 font-display text-3xl font-black tabular-nums">{fmtDuration(s.workMin)}</p>
            <p className="mt-1 text-xs text-muted">
              {fmtClock(s.rec.startMin)} 開工計起（未扣午飯時間）
            </p>
          </div>

          <div
            className={
              'rounded-2xl border p-4 ' +
              (overtime ? 'border-signal/50 bg-signal/10' : 'border-line')
            }
          >
            <p className="text-sm text-muted">
              {overtime ? `OT ${hoursLabel(s.otMin)} 小時` : '冇 OT'}
            </p>
            <p className={'mt-1 text-base font-medium leading-relaxed ' + (overtime ? 'text-signal' : '')}>
              {settleQuip(s)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#3b5bdb]/40 bg-[#3b5bdb]/10 p-4">
            <p className="text-sm text-muted">剩餘 Me Time</p>
            <p className="mt-1 font-display text-3xl font-black tabular-nums">{fmtDuration(me.minutes)}</p>
            <p className="mt-1 text-sm">
              直至 {me.nextLabel} {fmtClock(s.rec.startMin)} 開工前
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {me.offDays > 0
                ? `呢段時間跨越 ${me.offDays} 日假期／週末${
                    me.holidayNames.length ? `（${me.holidayNames.join('、')}）` : ''
                  }，好好享受！`
                : '今晚到聽朝返工前，全部都係你嘅。'}
            </p>
          </div>
        </div>

        <button
          ref={btnRef}
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-[#3b5bdb] px-5 py-3 text-base font-bold text-white transition active:scale-[0.97]"
        >
          收到，走人！
        </button>
      </div>
    </div>
  );
}
