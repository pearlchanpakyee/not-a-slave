import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Temporary screen for modules not built yet. Each module replaces this in its own step.
export default function ModulePlaceholder({ module }) {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <Link to="/" className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> 返回主頁
      </Link>
      <div className="mt-4 rounded-3xl border border-line bg-card p-8 text-center">
        <div className="text-5xl" aria-hidden="true">
          {module.emoji}
        </div>
        <h2 className="mt-4 font-display text-2xl font-black">{module.title}</h2>
        <p className="mt-2 text-sm text-muted">呢個模組仲未開工，之後會逐步加入。</p>
      </div>
    </main>
  );
}
