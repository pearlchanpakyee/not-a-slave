import { useState } from 'react';
import { ArrowLeft, CalendarDays, Check, Clipboard, Presentation, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const CARDS = [
  {
    id: 'deck',
    icon: Presentation,
    emoji: '📊',
    title: 'Presentation Deck',
    subtitle: '執 Deck 唔使由零開始',
    advice:
      '內部開會／Idea Drafting 推薦用 Gemini（免費、可直接 Save 為 Google Slides 或匯出 PPTX 掉入 Canva 慢慢執）；外部呈交／高階展示推薦用 Gamma（支援 Brand Guidelines，質感較完整）。',
    prompt: `請扮演頂尖的商業策略顧問。我現在需要準備一個關於 [請填寫主題，例如：Q4 市場推廣策略] 的簡報（Presentation Deck），總共大約需要 [請填寫頁數，例如：6-8] 頁。請融入以下品牌視覺與規範 [請填寫 Brand Guideline，例如：HKJC 官方企業藍色系 / 或參考附件視覺規範]。
請幫我輸出每一頁的結構，格式如下：
- 第 X 頁：頁面標題
- 核心重點 (Key Bullet Points)：(請列出 3-4 個精簡有力、商務口吻的重點)
- 建議視覺排版/圖表類型：(例如：SWOT Matrix / Funnel Chart / 4格對比卡片)
目標對象是 [請填寫對象，例如：公司管理層 / 客戶]，語氣需要專業、精煉且具說服力。請生成內容！`,
  },
  {
    id: 'calendar',
    icon: CalendarDays,
    emoji: '🗓️',
    title: 'Calendar 秘書',
    subtitle: '叫 AI 幫你整理 To-Do 同行程',
    advice:
      '利用能存取日曆與電郵的 AI（如 Copilot / Gemini）充當私人秘書，自動提取 To-Do、設定每日早上 8 點定時早安 Summary，以及智能尋找開會／飯局空檔。',
    prompt: `請扮演我的全能首席行政秘書（Executive Secretary）。請幫我全面接管並優化我的時間、行程與待辦清單管理，具體要求如下：
1. 【每日早安秘書 Summary（設定時間：每日早上 08:00 AM）】：
- 請每天早上 8 點定時為我生成並發送一份勸世又高效的「今日打工仔生存簡報」，內容必須包含：
a) 今日最重要的頭 3 項關鍵任務 (Top 3 Priorities)
b) 今日所有即將到期的死線 (Deadlines Countdown)
c) 需要在今天優先處理或回覆的急件 Email 摘要
2. 【自動提取與死線管理】：
- 請掃描我的 Calendar（日曆）與 Email，自動掘出所有隱藏的 To-Do 與 Deadlines。
- 如果資料中沒有寫明明確死線，請主動向我追問：「請問 [某項任務] 的死線是何時？需要我幫你加進行事曆嗎？」
3. 【智能空檔排程 (Smart Scheduling)】：
- 當我需要約人（例如：約食飯 / 1 小時專案會議）時，只要告訴你對象與時長，請自動掃描我這星期的行事曆。
- 請幫我避開已有會議、預留合理午休時間（如 13:00 - 14:00），擬定 3 個最佳的黃金空檔選擇。經我確認後，直接幫我安排上 Calendar。
請根據以上要求，先為我進行第一次的行事曆與電郵掃描，並輸出我今天的早安秘書 Summary！`,
  },
  {
    id: 'email',
    icon: Mail,
    emoji: '✉️',
    title: 'Email Drafting',
    subtitle: '職場太極：真心話變商務英文',
    advice:
      '高情商商務溝通：將真心話轉化為得體、專業、滴水不漏的商務英文，保持 Professional and Firm。',
    prompt: `請扮演職場溝通大師。請幫我起草一封專業、得體且具說服力的商務電郵：
- 發件人身份：[請填寫，例如：項目經理 / Marketing Assistant]
- 收件人身份：[請填寫，例如：經常遲交貨的外判商 / 態度強硬的合作夥伴 / 臨收工先黎料的老細]
- 核心目的與訴求：[請填寫你真實想表達的事，例如：要求對方必須在星期五前交稿，否則項目會延誤]
- 語氣要求：使用專業、禮貌但堅定的商務語氣（Professional and Firm），切中要害，避免過多冗長廢話。
- 格式要求：Type this email in commercial/business english.
請幫我生成主旨 (Subject Line) 以及正文內容！`,
  },
];

function PromptCard({ card }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const Icon = card.icon;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(card.prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-paper active:scale-[0.99]"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper text-2xl">
          {card.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-display text-lg font-black">
            <Icon size={18} />
            {card.title}
          </span>
          <span className="mt-0.5 block text-sm text-muted">{card.subtitle}</span>
        </span>
        <span className="text-xl text-muted" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className="border-t border-line p-4">
          <div className="rounded-2xl bg-paper p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">
              實戰心法
            </p>
            <p className="mt-2 text-sm leading-6 text-ink">{card.advice}</p>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-bold">專用 Prompt</p>
              <button
                type="button"
                onClick={copyPrompt}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[#111] transition active:scale-95"
              >
                {copied ? <Check size={14} /> : <Clipboard size={14} />}
                {copied ? '已複製' : '一鍵複製'}
              </button>
            </div>
            <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap rounded-2xl border border-line bg-paper p-4 text-sm leading-6 text-ink">
              {card.prompt}
            </pre>
          </div>
        </div>
      )}
    </article>
  );
}

export default function AiTipsPage() {
  return (
    <main
      style={{ '--accent': '#f5c84b' }}
      className="mx-auto max-w-3xl px-4 pb-10 pt-4"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> 返回主頁
      </Link>

      <div className="mt-2">
        <h2 className="font-display text-2xl font-black">
          🏰 米奇妙妙屋💡
        </h2>
        <p className="mt-1 text-sm text-muted">
          三招 AI 打工仔生存技：撳開卡片，拎走 Prompt，直接貼去你慣用嘅 AI。
        </p>
      </div>

      <section className="mt-5 space-y-3" aria-label="AI Tips & Tricks">
        {CARDS.map((card) => (
          <PromptCard key={card.id} card={card} />
        ))}
      </section>
    </main>
  );
}
