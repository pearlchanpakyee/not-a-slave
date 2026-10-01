import { Link } from 'react-router-dom';
import { MODULES } from '../data/modules';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-6">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {MODULES.map((m) => (
          <li key={m.id}>
            <Link
              to={m.path}
              style={{ '--accent': m.accent }}
              className="group flex h-full min-h-[11rem] flex-col justify-between rounded-3xl border border-line bg-[color-mix(in_srgb,var(--accent)_9%,var(--card))] p-4 transition duration-150 active:scale-[0.96] sm:hover:-translate-y-1 sm:hover:border-[var(--accent)]"
            >
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--accent)_18%,var(--card))] text-3xl transition duration-150 group-active:rotate-6"
              >
                {m.emoji}
              </span>
              <span className="mt-4 block">
                <span className="block text-base font-bold leading-snug">{m.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{m.subtitle}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
