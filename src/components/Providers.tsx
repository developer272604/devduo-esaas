import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { applyTheme } from '@/lib/theme';
import { useTemplate } from '@/store/template';
import { themeFor, useThemeStore } from '@/store/theme';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SettingsDrawer, SettingsTab } from '@/components/settings/SettingsDrawer';
import { ModalHost } from '@/components/common/ModalHost';
import { ToastHost } from '@/components/common/Toast';

/** Writes the active template's theme to CSS variables on <html> whenever it changes. */
function ThemeApplier() {
  const template = useTemplate();
  const themes = useThemeStore((s) => s.themes);
  const theme = themeFor(themes, template);
  useEffect(() => {
    applyTheme(theme, template.theme.bg);
    document.title = `${template.name} · Vilva D2C demo`;
  }, [theme, template]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Layout shared by every page: header, footer, settings drawer, dialogs and toast. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeApplier />
      <ScrollToTop />
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <SettingsTab />
      <SettingsDrawer />
      <ModalHost />
      <ToastHost />
    </>
  );
}
