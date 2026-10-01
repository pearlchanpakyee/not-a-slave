import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import DrinksPage from './pages/DrinksPage';
import InspirationPage from './pages/InspirationPage';
import LunchPage from './pages/LunchPage';
import ModulePlaceholder from './pages/ModulePlaceholder';
import SettingsPage from './pages/SettingsPage';
import WlbPage from './pages/WlbPage';
import AiTipsPage from './pages/AiTipsPage';
import AskPearlPage from './pages/AskPearlPage';
import { MODULES } from './data/modules';
import { useTheme } from './lib/theme';

// Modules that are built. Anything not listed here still shows the placeholder.
const PAGES = {
  lunch: LunchPage,
  drinks: DrinksPage,
  wlb: WlbPage,
  inspiration: InspirationPage,
  'ai-tips': AiTipsPage,
  'ask-pearl': AskPearlPage,
};

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <Header theme={theme} onToggleTheme={toggle} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<SettingsPage />} />
        {MODULES.map((m) => {
          const Page = PAGES[m.id];
          return <Route key={m.id} path={m.path} element={Page ? <Page /> : <ModulePlaceholder module={m} />} />;
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
