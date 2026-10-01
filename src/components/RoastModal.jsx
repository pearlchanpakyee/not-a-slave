import { useEffect, useRef } from 'react';

const AVATAR = `${import.meta.env.BASE_URL}pearl_avatar.png`;

export default function RoastModal({ drink, userName, onClose }) {
  const btnRef = useRef(null);

  useEffect(() => {
    btnRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="roast-title"
        aria-describedby="roast-body"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop w-full max-w-sm rounded-3xl border border-line bg-card p-6 text-center shadow-2xl"
      >
        <img
          src={AVATAR}
          alt="Pearl"
          className="mx-auto h-36 w-36 rounded-full border-4 border-card object-cover shadow-lg ring-4 ring-[var(--ring)]"
          style={{
            objectPosition: '50% 18%',
            '--ring': drink.good ? '#0e9f8e' : 'var(--signal)',
          }}
        />
        <h3 id="roast-title" className="mt-4 font-display text-2xl font-black">
          {drink.modalTitle}
        </h3>
        <p id="roast-body" className="mt-2 text-base leading-relaxed">
          <span aria-hidden="true" className="mr-1">
            {drink.emoji}
          </span>
          {drink.modal(userName)}
        </p>
        <button
          ref={btnRef}
          type="button"
          onClick={onClose}
          className={
            'mt-5 w-full rounded-2xl px-5 py-3 text-base font-bold text-white transition active:scale-[0.97] ' +
            (drink.good ? 'bg-[#0e9f8e]' : 'bg-signal')
          }
        >
          {drink.modalButton}
        </button>
      </div>
    </div>
  );
}
