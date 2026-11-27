import { useCallback, useEffect, useState } from 'react';
import { UI_STRINGS } from '../i18n/translations';

export type Locale = 'id' | 'en';

const LOCALE_STORAGE_KEY = 'seoul_temp_locale';

function getInitialLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'id' || saved === 'en') return saved;
  } catch {
    // Abaikan jika localStorage tidak tersedia.
  }
  return 'id';
}

export function useLanguage() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = UI_STRINGS[locale].pageTitle;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Abaikan jika localStorage diblokir.
    }
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'id' ? 'en' : 'id'));
  }, []);

  return {
    locale,
    setLocale,
    toggleLocale,
  };
}
