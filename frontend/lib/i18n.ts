export type Language = 'ar' | 'fr' | 'en';

export const LANGUAGES = {
  ar: { name: 'العربية', flag: '🇸🇦' },
  fr: { name: 'Français', flag: '🇫🇷' },
  en: { name: 'English', flag: '🇬🇧' },
};

// Translation cache
let translationCache: Record<Language, Record<string, any>> = {
  ar: {},
  fr: {},
  en: {},
};

/**
 * Load translation file for a specific language
 */
export const loadTranslation = async (lang: Language): Promise<Record<string, any>> => {
  if (Object.keys(translationCache[lang]).length > 0) {
    return translationCache[lang];
  }

  try {
    const response = await fetch(`/locales/${lang}/common.json`);
    if (!response.ok) {
      throw new Error(`Failed to load translation for ${lang}`);
    }
    const translation = await response.json();
    translationCache[lang] = translation;
    return translation;
  } catch (error) {
    console.error(`Error loading translation for ${lang}:`, error);
    // Fall back to English if translation fails
    if (lang !== 'en') {
      return loadTranslation('en');
    }
    return {};
  }
};

/**
 * Get a translation value by key with dot notation support
 * Example: t('login.title')
 */
export const getTranslation = (translation: Record<string, any>, key: string): string => {
  const keys = key.split('.');
  let value: any = translation;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
};

/**
 * Get the default language based on browser or user preference
 */
export const getDefaultLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'ar';
  }

  // Check localStorage first
  const stored = localStorage.getItem('language') as Language | null;
  if (stored && Object.keys(LANGUAGES).includes(stored)) {
    return stored;
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (Object.keys(LANGUAGES).includes(browserLang)) {
    return browserLang as Language;
  }

  // Default to Arabic
  return 'ar';
};

/**
 * Save language preference
 */
export const saveLanguagePreference = (lang: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
};

/**
 * Clear the translation cache (useful for testing)
 */
export const clearTranslationCache = (): void => {
  translationCache = {
    ar: {},
    fr: {},
    en: {},
  };
};
