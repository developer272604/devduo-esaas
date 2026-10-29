import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { applyTheme } from '@/lib/theme';
import { useTemplate } from '@/store/template';
import { themeFor, useThemeStore } from '@/store/theme';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SettingsDrawer, SettingsTab } from '@/components/settings/SettingsDrawer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ModalHost } from '@/components/common/ModalHost';
import { ToastHost } from '@/components/common/Toast';
import { DemoBar } from '@/components/demo/DemoBar';
import { ImagePicker } from '@/components/demo/ImagePicker';
import { Tour } from '@/components/demo/Tour';

/** Writes the active template's theme to CSS variables on <html> whenever it changes. */
function ThemeApplier() {
  const template = useTemplate();
  const themes = useThemeStore((s) => s.themes);
  const theme = themeFor(themes, template);
  useEffect(() => {
    applyTheme(theme, template.theme.bg);
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
      <aside className="demo-tools" aria-label="Demo tools" data-no-capture>
        <SettingsTab />
        <DemoBar />
      </aside>
      <SettingsDrawer />
      <CartDrawer />
      <ModalHost />
      <ToastHost />
      <ImagePicker />
      <Tour />
    </>
  );
}
