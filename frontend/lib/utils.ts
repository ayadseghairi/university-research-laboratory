const SUPPORTED_LANGUAGES = ['ar', 'fr', 'en'] as const;

type UILanguage = (typeof SUPPORTED_LANGUAGES)[number];

const getActiveLanguage = (): UILanguage => {
  if (typeof window === 'undefined') {
    return 'ar';
  }

  const stored = localStorage.getItem('language');
  if (stored && SUPPORTED_LANGUAGES.includes(stored as UILanguage)) {
    return stored as UILanguage;
  }

  const browserLang = navigator.language.split('-')[0] as UILanguage;
  if (SUPPORTED_LANGUAGES.includes(browserLang)) {
    return browserLang;
  }

  return 'ar';
};

const getLocale = (language: UILanguage) => {
  switch (language) {
    case 'fr':
      return 'fr-DZ';
    case 'en':
      return 'en-US';
    default:
      return 'ar-DZ';
  }
};

export const formatDZD = (amount: number | string, language?: UILanguage) => {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  const activeLanguage = language || getActiveLanguage();
  return `${Number(value || 0).toLocaleString(getLocale(activeLanguage))} DA`;
};

export const getPercentage = (spent: number, allocated: number) => {
  if (!allocated) {
    return 0;
  }
  return Math.min(Math.round((spent / allocated) * 100), 100);
};

export const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return 'danger';
  if (percentage >= 75) return 'warning';
  return 'normal';
};

export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
