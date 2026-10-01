// 靈感收集箱 — URL parsing, front-end summary and smart tags.
// Zero-backend: pages are never fetched. Summary is inferred from URL/platform
// and the optional note, so everything stays local in the browser.

export const PRESET_TAGS = ['#AI工具', '#簡報技巧', '#Marketing', '#設計', '#職場生存', '#其他'];
export const OTHER_TAG = '#其他';

const RULES = [
  {
    tag: '#AI工具',
    domains: [
      'openai.com',
      'chatgpt.com',
      'anthropic.com',
      'claude.ai',
      'gemini.google.com',
      'perplexity.ai',
      'huggingface.co',
      'midjourney.com',
      'copilot.microsoft.com',
    ],
    keywords: [
      'ai',
      'gpt',
      'chatgpt',
      'claude',
      'gemini',
      'copilot',
      'midjourney',
      'llm',
      'prompt',
      'openai',
      '人工智能',
      '人工智慧',
      '生成式',
      '提示詞',
    ],
  },
  {
    tag: '#簡報技巧',
    domains: ['gamma.app', 'slidesgo.com', 'pitch.com'],
    keywords: [
      'deck',
      'slide',
      'slides',
      'presentation',
      'pitch',
      'powerpoint',
      'ppt',
      '簡報',
      '投影片',
      '執deck',
    ],
  },
  {
    tag: '#Marketing',
    domains: ['hubspot.com', 'mailchimp.com'],
    keywords: [
      'marketing',
      'seo',
      'sem',
      'campaign',
      'brand',
      'branding',
      'copywriting',
      'advertis',
      'social media',
      'kol',
      '行銷',
      '營銷',
      '推廣',
      '文案',
      '品牌',
    ],
  },
  {
    tag: '#設計',
    domains: ['figma.com', 'canva.com', 'behance.net', 'dribbble.com', 'pinterest.com'],
    keywords: [
      'design',
      'designer',
      'ui',
      'ux',
      'figma',
      'typography',
      'font',
      'layout',
      'color palette',
      '設計',
      '排版',
      '配色',
      '字體',
    ],
  },
  {
    tag: '#職場生存',
    domains: ['linkedin.com'],
    keywords: [
      'career',
      'boss',
      'workplace',
      'productivity',
      'meeting',
      'burnout',
      'interview',
      'resume',
      'email',
      '職場',
      '打工',
      '老細',
      '上司',
      '辭職',
      '面試',
      '開會',
      '加薪',
    ],
  },
];

const PLATFORMS = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  threads: 'Threads',
  linkedin: 'LinkedIn',
  web: '網頁',
};

const TRACKING = /^(utm_.*|igsh|igshid|si|fbclid|feature)$/i;
const SLUG_STOP = new Set([
  'posts',
  'pulse',
  'in',
  'p',
  'reel',
  'reels',
  'watch',
  'shorts',
  'status',
  'post',
  'feed',
  'company',
  'learning',
]);

const stripWww = (host) => host.replace(/^www\./, '').toLowerCase();
const hostMatches = (host, domain) => host === domain || host.endsWith(`.${domain}`);

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Accepts "example.com/x" and "https://example.com/x".
// Returns a URL object only for usable HTTP(S) links.
export function parseUrl(raw) {
  const text = (raw || '').trim();
  if (!text || /\s/.test(text)) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`;

  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname.includes('.')) return null;
    return url;
  } catch {
    return null;
  }
}

// Used for duplicate detection. Tracking parameters, www, hash and trailing slash
// do not make a link a new inspiration.
export function dedupeKey(url) {
  const params = [...url.searchParams.entries()]
    .filter(([key]) => !TRACKING.test(key))
    .map(([key, value]) => `${key}=${value}`);
  const path = url.pathname.replace(/\/+$/, '');
  return `${stripWww(url.hostname)}${path}${params.length ? `?${params.join('&')}` : ''}`.toLowerCase();
}

export function detectPlatform(url) {
  const host = stripWww(url.hostname);
  if (hostMatches(host, 'youtube.com') || hostMatches(host, 'youtu.be')) return 'youtube';
  if (hostMatches(host, 'instagram.com')) return 'instagram';
  if (hostMatches(host, 'threads.net') || hostMatches(host, 'threads.com')) return 'threads';
  if (hostMatches(host, 'linkedin.com')) return 'linkedin';
  return 'web';
}

// Finds a human-readable URL path segment for the local preview.
export function slugWords(pathname) {
  const candidates = pathname
    .split('/')
    .map(safeDecode)
    .filter((segment) => segment && !SLUG_STOP.has(segment.toLowerCase()))
    .map((segment) =>
      segment
        .replace(/\.(html?|php|aspx?)$/i, '')
        .replace(/[-_+]+/g, ' ')
        .replace(/\s+activity\s+\d+.*$/i, '')
        .trim()
    )
    .filter((segment) => segment.length >= 6 && /[A-Za-z\u4e00-\u9fff]/.test(segment))
    .filter(
      (segment) =>
        /\s/.test(segment) ||
        /[\u4e00-\u9fff]/.test(segment) ||
        segment.length < 10 ||
        !/^[A-Za-z0-9]+$/.test(segment)
    );

  if (!candidates.length) return '';
  const best = candidates.sort((a, b) => b.length - a.length)[0];
  return best.length > 70 ? `${best.slice(0, 70)}…` : best;
}

// Local preview only — no external page request is made.
export function describeUrl(url) {
  const platform = detectPlatform(url);
  const host = stripWww(url.hostname);
  const segments = url.pathname.split('/').filter(Boolean);
  const slug = slugWords(url.pathname);
  let title;

  if (platform === 'youtube') {
    title = segments[0] === 'shorts' ? 'YouTube Shorts' : 'YouTube 影片';
  } else if (platform === 'instagram') {
    if (segments[0] === 'reel' || segments[0] === 'reels') title = 'Instagram Reel';
    else if (segments[0] === 'p') title = 'Instagram 帖文';
    else if (segments[0]) title = `Instagram @${safeDecode(segments[0])}`;
    else title = 'Instagram';
  } else if (platform === 'threads') {
    const user = segments.find((segment) => segment.startsWith('@'));
    title = user ? `Threads 帖文 · ${safeDecode(user)}` : 'Threads 帖文';
  } else if (platform === 'linkedin') {
    title = segments[0] === 'in' ? 'LinkedIn 個人檔案' : slug ? `LinkedIn：${slug}` : 'LinkedIn 帖文';
  } else {
    title = slug || host;
  }

  return { platform, platformLabel: PLATFORMS[platform], host, title };
}

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ').trim();
}

function hasKeyword(text, keyword) {
  const normalized = normalizeText(keyword);
  if (/^[a-z0-9 ]+$/.test(normalized) && normalized.length < 4) {
    return new RegExp(`(^|[^a-z0-9])${normalized}($|[^a-z0-9])`).test(text);
  }
  return text.includes(normalized);
}

export function autoTags(note, url) {
  const host = stripWww(url.hostname);
  const text = normalizeText(`${note || ''} ${host} ${safeDecode(url.pathname)} ${safeDecode(url.search)}`);
  const tags = RULES.filter(
    (rule) =>
      rule.domains.some((domain) => hostMatches(host, domain)) ||
      rule.keywords.some((keyword) => hasKeyword(text, keyword))
  ).map((rule) => rule.tag);

  return tags.length ? tags : [OTHER_TAG];
}

// "#foo bar,baz" -> ["#foo", "#bar", "#baz"]
export function parseCustomTags(input) {
  return [...new Set(
    input
      .split(/[\s,，、]+/)
      .map((tag) => tag.replace(/^#+/, '').trim().slice(0, 20))
      .filter(Boolean)
      .map((tag) => `#${tag}`)
  )];
}

export function matchesQuery(item, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [item.title, item.note, item.url, item.host, item.tags.join(' ')]
    .join('\n')
    .toLowerCase()
    .includes(normalizedQuery);
}
