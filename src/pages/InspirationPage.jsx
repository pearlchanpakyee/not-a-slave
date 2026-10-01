import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AtSign,
  ClipboardPaste,
  ExternalLink,
  Gift,
  Link2,
  Linkedin,
  Plus,
  Search,
  Trash2,
  X,
  Youtube,
} from 'lucide-react';
import { useLocalStorage } from '../lib/storage';
import {
  OTHER_TAG,
  PRESET_TAGS,
  autoTags,
  dedupeKey,
  describeUrl,
  matchesQuery,
  parseCustomTags,
  parseUrl,
} from '../lib/inspiration';

const ACCENT = '#d99100';
const PLATFORM_ICONS = {
  youtube: Youtube,
  instagram: AtSign,
  threads: AtSign,
  linkedin: Linkedin,
  web: Link2,
};

function Chip({ active, onClick, children, small = false }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        'rounded-full border font-medium transition active:scale-95 ' +
        (small ? 'px-3 py-1 text-xs ' : 'px-3.5 py-1.5 text-sm ') +
        (active
          ? 'border-[var(--accent)] bg-[var(--accent)] text-[#111]'
          : 'border-line bg-card text-ink hover:border-[var(--accent)]')
      }
    >
      {children}
    </button>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('zh-HK', {
    month: 'numeric',
    day: 'numeric',
  });
}

function InspirationCard({ item, onDelete, highlight = false }) {
  const Icon = PLATFORM_ICONS[item.platform] || Link2;

  return (
    <article
      className={
        'rounded-3xl border bg-card p-4 ' +
        (highlight
          ? 'animate-pop border-[var(--accent)] ring-2 ring-[var(--accent)]/40'
          : 'border-line')
      }
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Icon size={14} /> {item.platformLabel}
        </span>
        <time dateTime={item.at}>{formatDate(item.at)}</time>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-start gap-1.5 font-bold leading-snug hover:underline"
      >
        <span className="min-w-0 break-words">{item.title}</span>
        <ExternalLink size={14} className="mt-1 shrink-0 text-muted" aria-hidden="true" />
      </a>
      <p className="mt-0.5 break-all text-xs text-muted">{item.host}</p>

      {item.note && (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{item.note}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[color-mix(in_srgb,var(--accent)_16%,var(--card))] px-2.5 py-0.5 text-xs font-medium"
          >
            {tag}
          </span>
        ))}
        <button
          type="button"
          onClick={() => onDelete(item)}
          aria-label="刪除呢條靈感"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-signal"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}

export default function InspirationPage() {
  // useLocalStorage -> nas:inspirations through the shared storage helper.
  const [items, setItems] = useLocalStorage('inspirations', []);

  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [removedAutoTags, setRemovedAutoTags] = useState([]);
  const [extraTags, setExtraTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [message, setMessage] = useState({ text: '', ok: false });

  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [drawnId, setDrawnId] = useState(null);

  const parsed = useMemo(() => parseUrl(url), [url]);
  const description = useMemo(
    () => (parsed ? describeUrl(parsed) : null),
    [parsed]
  );
  const auto = useMemo(
    () => (parsed ? autoTags(note, parsed).filter((tag) => tag !== OTHER_TAG) : []),
    [parsed, note]
  );

  const selectedTags = useMemo(() => {
    const set = new Set([
      ...auto.filter((tag) => !removedAutoTags.includes(tag)),
      ...extraTags,
    ]);
    return [...set];
  }, [auto, removedAutoTags, extraTags]);

  const finalTags = selectedTags.length ? selectedTags : [OTHER_TAG];
  const chipTags = [
    ...PRESET_TAGS,
    ...extraTags.filter((tag) => !PRESET_TAGS.includes(tag)),
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setExtraTags((current) => current.filter((item) => item !== tag));
      if (auto.includes(tag)) {
        setRemovedAutoTags((current) => [...new Set([...current, tag])]);
      }
      return;
    }

    setRemovedAutoTags((current) => current.filter((item) => item !== tag));
    if (!auto.includes(tag)) {
      setExtraTags((current) =>
        current.includes(tag) ? current : [...current, tag]
      );
    }
  };

  const addCustomTags = () => {
    const tags = parseCustomTags(tagInput);
    if (!tags.length) return;

    setRemovedAutoTags((current) =>
      current.filter((tag) => !tags.includes(tag))
    );
    setExtraTags((current) => [
      ...current,
      ...tags.filter((tag) => !current.includes(tag) && !auto.includes(tag)),
    ]);
    setTagInput('');
  };

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setMessage({ text: '', ok: false });
      }
    } catch {
      setMessage({
        text: '瀏覽器唔俾讀取剪貼簿，請長按輸入框貼上。',
        ok: false,
      });
    }
  };

  const save = () => {
    if (!parsed) {
      setMessage({ text: '請貼上有效嘅連結（http / https）。', ok: false });
      return;
    }

    const key = dedupeKey(parsed);
    const duplicated = items.some((item) => {
      const existing = parseUrl(item.url);
      return existing && dedupeKey(existing) === key;
    });

    if (duplicated) {
      setMessage({ text: '呢條連結已經收藏過喇。', ok: false });
      return;
    }

    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      url: parsed.href,
      host: description.host,
      platform: description.platform,
      platformLabel: description.platformLabel,
      title: description.title,
      note: note.trim(),
      tags: finalTags,
      at: new Date().toISOString(),
    };

    setItems((current) => [item, ...current]);
    setUrl('');
    setNote('');
    setRemovedAutoTags([]);
    setExtraTags([]);
    setTagInput('');
    setMessage({ text: '已收藏！', ok: true });
  };

  const remove = (item) => {
    if (!window.confirm('確定刪除呢條靈感？')) return;
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    if (drawnId === item.id) setDrawnId(null);
  };

  const draw = () => {
    if (!items.length) return;

    const pool =
      items.length > 1
        ? items.filter((item) => item.id !== drawnId)
        : items;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setDrawnId(pick.id);
  };

  const drawn = items.find((item) => item.id === drawnId);

  const tagCounts = useMemo(() => {
    const counts = {};
    for (const item of items) {
      for (const tag of item.tags) counts[tag] = (counts[tag] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [items]);

  const shown = items.filter(
    (item) =>
      (!activeTag || item.tags.includes(activeTag)) &&
      matchesQuery(item, query)
  );

  const fieldClass =
    'w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none focus:border-[var(--accent)]';

  return (
    <main
      style={{ '--accent': ACCENT }}
      className="mx-auto max-w-3xl px-4 pb-10 pt-4"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> 返回主頁
      </Link>

      <h2 className="mt-2 flex items-center gap-2 font-display text-2xl font-black">
        <span aria-hidden="true">💡</span> 靈感收集箱
      </h2>
      <p className="mt-1 text-sm text-muted">
        見到好嘢就貼低，之後再慢慢消化；全部資料只會留喺你部機。
      </p>

      <section
        className="mt-5 rounded-3xl border border-line bg-[color-mix(in_srgb,var(--accent)_8%,var(--card))] p-4"
        aria-label="新增靈感"
      >
        <label htmlFor="insp-url" className="mb-1.5 block text-sm font-bold">
          貼上連結
        </label>
        <div className="flex gap-2">
          <input
            id="insp-url"
            className={fieldClass}
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="IG Reels、Threads、YouTube、LinkedIn 或網頁連結"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setMessage({ text: '', ok: false });
            }}
          />
          <button
            type="button"
            onClick={paste}
            aria-label="貼上剪貼簿內容"
            className="flex h-[2.9rem] w-[2.9rem] shrink-0 items-center justify-center rounded-xl border border-line bg-card transition active:scale-90"
          >
            <ClipboardPaste size={18} />
          </button>
        </div>

        <label htmlFor="insp-note" className="mb-1.5 mt-3 block text-sm font-bold">
          短評 <span className="font-normal text-muted">（可唔填）</span>
        </label>
        <textarea
          id="insp-note"
          className={`${fieldClass} resize-none`}
          rows={2}
          maxLength={200}
          placeholder="例如：個 deck 排版好靚，下次參考"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />

        {description && (
          <div className="mt-3 rounded-2xl border border-line bg-card p-3 text-sm">
            <p className="text-xs text-muted">
              自動預覽 · {description.platformLabel}
            </p>
            <p className="mt-0.5 break-words font-bold">{description.title}</p>
            <p className="break-all text-xs text-muted">{description.host}</p>
          </div>
        )}

        {parsed && (
          <div className="mt-3">
            <p className="mb-2 text-sm font-bold">標籤</p>
            <div className="flex flex-wrap gap-1.5">
              {chipTags.map((tag) => (
                <Chip
                  key={tag}
                  small
                  active={selectedTags.includes(tag)}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Chip>
              ))}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                className={`${fieldClass} !py-2 text-sm`}
                placeholder="自訂標籤，可用空格分隔"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addCustomTags();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomTags}
                aria-label="新增自訂標籤"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-card transition active:scale-90"
              >
                <Plus size={18} />
              </button>
            </div>

            {!selectedTags.length && (
              <p className="mt-2 text-xs text-muted">
                冇揀標籤會自動歸入 {OTHER_TAG}。
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={!url.trim()}
          className="mt-4 w-full rounded-2xl bg-[var(--accent)] px-5 py-3 text-base font-bold text-[#111] transition active:scale-[0.97] disabled:opacity-50"
        >
          收藏靈感
        </button>
        <p
          className={`mt-2 min-h-[1.25rem] text-center text-sm font-medium ${
            message.ok ? 'text-[#0e9f8e]' : 'text-signal'
          }`}
          aria-live="polite"
        >
          {message.text}
        </p>
      </section>

      <section className="mt-8" aria-label="我嘅靈感">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-black">
            我嘅靈感{' '}
            <span className="text-base font-bold text-muted">{items.length}</span>
          </h3>
          <button
            type="button"
            onClick={draw}
            disabled={!items.length}
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-[#111] transition active:scale-95 disabled:opacity-40"
          >
            <Gift size={16} /> 今日靈感盲盒
          </button>
        </div>

        {drawn && (
          <div className="mt-3">
            <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
              <span>🎁 今日抽到</span>
              <button
                type="button"
                onClick={() => setDrawnId(null)}
                aria-label="收埋抽籤結果"
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <InspirationCard item={drawn} onDelete={remove} highlight />
          </div>
        )}

        {items.length > 0 && (
          <>
            <div className="relative mt-4">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                className={`${fieldClass} !pl-9`}
                type="search"
                placeholder="搜尋標題、短評、連結或標籤"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="搜尋靈感"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip
                small
                active={activeTag === ''}
                onClick={() => setActiveTag('')}
              >
                全部
              </Chip>
              {tagCounts.map(([tag, count]) => (
                <Chip
                  key={tag}
                  small
                  active={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
                >
                  {tag} {count}
                </Chip>
              ))}
            </div>
          </>
        )}

        {items.length === 0 ? (
          <p className="mt-4 rounded-3xl border border-line bg-card p-6 text-center text-sm text-muted">
            仲未有靈感。見到好嘢，貼條連結落嚟就得，急用時再抽一條盲盒。
          </p>
        ) : shown.length === 0 ? (
          <p className="mt-4 rounded-3xl border border-line bg-card p-6 text-center text-sm text-muted">
            搵唔到符合條件嘅靈感，試下轉個關鍵字或標籤。
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {shown.map((item) => (
              <li key={item.id}>
                <InspirationCard item={item} onDelete={remove} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
