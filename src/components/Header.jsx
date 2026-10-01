import { Link } from 'react-router-dom';
import { Moon, Settings, Sun } from 'lucide-react';

const iconBtn =
  'inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition active:scale-90 hover:bg-line/60';

export default function Header({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';
  return (
    <header
      className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="min-w-0 leading-tight">
          <h1 className="truncate font-display text-xl font-black sm:text-2xl">我哋呢班打工仔～</h1>
          <p className="text-xs font-medium text-muted">Not A Slave!</p>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <Link to="/settings" className={iconBtn} aria-label="設定">
            <Settings size={20} />
          </Link>
          <button
            type="button"
            onClick={onToggleTheme}
            className={iconBtn}
            aria-label={isDark ? '切換到亮色模式' : '切換到暗色模式'}
            title={isDark ? '亮色模式 ☀️' : '暗色模式 🌙'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
