import { useEffect, useRef, useState } from 'react';
import { Copy, Download, FileText, X } from 'lucide-react';

// Generic share dialog. `makeCard` returns a canvas (called once when the dialog opens),
// `shareText` is the plain-text version for captions.
export default function ShareCardModal({ makeCard, shareText, fileTag, imageAlt, onClose }) {
  const [image, setImage] = useState(null); // { url, blob }
  const [status, setStatus] = useState('');
  const closeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    (async () => {
      const canvas = await makeCard();
      canvas.toBlob((blob) => {
        if (cancelled || !blob) return;
        objectUrl = URL.createObjectURL(blob);
        setImage({ url: objectUrl, blob });
      }, 'image/png');
    })();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // The dialog remounts on every open, so the card is generated once per open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const copyImage = async () => {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': image.blob })]);
      setStatus('已複製圖片，可以直接貼上。');
    } catch {
      setStatus('呢個瀏覽器唔支援複製圖片，請用「下載圖片」。');
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus('已複製文字，可以貼去 Threads / IG。');
    } catch {
      setStatus('複製失敗，請手動揀選文字。');
    }
  };

  const btn =
    'inline-flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-3 text-sm font-bold transition active:scale-[0.97] disabled:opacity-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="分享卡"
        onClick={(e) => e.stopPropagation()}
        className="animate-pop relative flex max-h-full w-full max-w-sm flex-col overflow-y-auto rounded-3xl border border-line bg-paper p-4"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white"
        >
          <X size={18} />
        </button>

        <div className="aspect-[9/16] w-full overflow-hidden rounded-2xl bg-card">
          {image ? (
            <img src={image.url} alt={imageAlt} className="h-full w-full object-contain" />
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-muted">生成緊分享卡…</p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button type="button" className={btn} onClick={copyImage} disabled={!image}>
            <Copy size={16} /> 複製圖片
          </button>
          <a
            className={btn + (image ? '' : ' pointer-events-none opacity-50')}
            href={image?.url}
            download={`not-a-slave-${fileTag}.png`}
          >
            <Download size={16} /> 下載圖片
          </a>
          <button type="button" className={btn + ' col-span-2'} onClick={copyText}>
            <FileText size={16} /> 複製文字（Threads / IG caption）
          </button>
        </div>
        <p className="mt-2 min-h-[1.25rem] text-center text-xs text-muted" aria-live="polite">
          {status}
        </p>
      </div>
    </div>
  );
}
