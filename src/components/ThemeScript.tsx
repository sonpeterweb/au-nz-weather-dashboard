import { THEME_STORAGE_KEY } from '@/lib/theme';

export function ThemeScript() {
  const script = `
    (function () {
      try {
        var theme = localStorage.getItem('${THEME_STORAGE_KEY}');
        if (theme) {
          document.documentElement.setAttribute('data-theme', theme);
        }
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
