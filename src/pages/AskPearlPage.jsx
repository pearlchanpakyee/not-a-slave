import { ArrowLeft, ExternalLink, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FORM_URL = 'https://forms.gle/ZAHkh5zenLorMVMeA';

export default function AskPearlPage() {
  return (
    <main
      style={{ '--accent': '#d8b4fe' }}
      className="mx-auto max-w-3xl px-4 pb-10 pt-4"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> 返回主頁
      </Link>

      <section className="mt-2 overflow-hidden rounded-3xl border border-line bg-card shadow-sm">
        <div className="p-6 text-center sm:p-8">
          <img
            src="/pearl_avatar.png"
            alt="Pearl"
            className="mx-auto h-28 w-28 rounded-full border-4 border-[var(--accent)] object-cover shadow-md"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />

          <div className="mx-auto mt-4 max-w-xl">
            <p className="text-sm font-bold text-muted">👑 Ask Pearl</p>
            <h2 className="mt-1 font-display text-2xl font-black">
              快速收工的秘訣
            </h2>
            <p className="mt-4 text-base leading-7 text-ink">
              Hi 各位打工仔，我是 Pearl 珍珠！呢個 Web App 仲爭啲咩搞笑功能？
              定係老細又逼你做埋啲無謂嘢？同我講，我幫你寫入 Code 度！
            </p>
          </div>
        </div>

        <div className="border-t border-line bg-paper p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle size={18} />
            <h3 className="font-bold">打工仔意見收集箱</h3>
          </div>
          <p className="mb-4 text-sm text-muted">
            有咩想加、想改、想吐槽，直接填表。我哋下一輪更新見。
          </p>

          <div className="overflow-hidden rounded-2xl border border-line bg-card">
            <iframe
              title="Ask Pearl Google Form"
              src={FORM_URL}
              className="h-[min(78vh,760px)] w-full min-h-[620px]"
              loading="lazy"
            />
          </div>

          <a
            href={FORM_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-bold text-[#111] transition active:scale-[0.97]"
          >
            <ExternalLink size={16} />
            如果表單未能內嵌，請點此開啟 Google Form
          </a>
        </div>
      </section>
    </main>
  );
}
