import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DEFAULT_SETTINGS, useSettings } from '../context/SettingsContext';

const fieldClass =
  'w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-base text-ink outline-none focus:border-signal';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [nameDraft, setNameDraft] = useState(settings.userName);
  const endBeforeStart = settings.workEnd <= settings.workStart;

  const saveName = () => {
    const name = nameDraft.trim() || DEFAULT_SETTINGS.userName;
    setNameDraft(name);
    updateSettings({ userName: name });
  };

  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-4">
      <Link to="/" className="inline-flex items-center gap-1 py-2 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeft size={16} /> 返回主頁
      </Link>
      <h2 className="mt-2 font-display text-2xl font-black">設定</h2>

      <div className="mt-5 space-y-5 rounded-3xl border border-line bg-card p-5">
        <div>
          <label htmlFor="userName" className="mb-1.5 block text-sm font-bold">
            你的名字
          </label>
          <input
            id="userName"
            className={fieldClass}
            value={nameDraft}
            maxLength={12}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
          <p className="mt-1.5 text-xs text-muted">飲品警告同收工結算會用呢個名叫你。留空會變返「{DEFAULT_SETTINGS.userName}」。</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="workStart" className="mb-1.5 block text-sm font-bold">
              上班時間
            </label>
            <input
              id="workStart"
              type="time"
              className={fieldClass}
              value={settings.workStart}
              onChange={(e) => e.target.value && updateSettings({ workStart: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="workEnd" className="mb-1.5 block text-sm font-bold">
              官方下班時間
            </label>
            <input
              id="workEnd"
              type="time"
              className={fieldClass}
              value={settings.workEnd}
              onChange={(e) => e.target.value && updateSettings({ workEnd: e.target.value })}
            />
          </div>
        </div>
        {endBeforeStart && (
          <p className="text-sm font-medium text-signal">下班時間要遲過上班時間，否則收工計算會出錯。</p>
        )}
      </div>
    </main>
  );
}
