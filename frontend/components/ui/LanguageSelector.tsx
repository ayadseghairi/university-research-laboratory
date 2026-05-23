'use client';

import { LANGUAGES, Language } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  showLabel?: boolean;
  inline?: boolean;
}

export default function LanguageSelector({ showLabel = true, inline = false }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setLanguage(e.target.value as Language);
  };

  if (inline) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {showLabel && <label style={{ fontSize: 14, color: '#666', fontWeight: 500 }}>{t('common.language')}</label>}
        <select
          value={language}
          onChange={handleChange}
          style={{
            padding: '6px 10px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 14,
            cursor: 'pointer',
            backgroundColor: 'white',
            color: '#333',
          }}
        >
          {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES['ar']][]).map(([code, { name }]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {showLabel && <label style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{t('common.language')}</label>}
      <div style={{ display: 'grid', gap: 8 }}>
        {(Object.entries(LANGUAGES) as [Language, typeof LANGUAGES['ar']][]).map(([code, { name, flag }]) => (
          <label
            key={code}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 12px',
              border: language === code ? '2px solid #667eea' : '1px solid #ddd',
              borderRadius: 6,
              cursor: 'pointer',
              backgroundColor: language === code ? '#f0f4ff' : 'white',
              transition: 'all 0.2s',
            }}
          >
            <input
              type="radio"
              name="language"
              value={code}
              checked={language === code}
              onChange={handleChange}
              style={{ marginInlineEnd: 12, cursor: 'pointer' }}
            />
            <span style={{ marginInlineEnd: 8, fontSize: 16 }}>{flag}</span>
            <span style={{ color: language === code ? '#667eea' : '#666', fontWeight: language === code ? 600 : 400 }}>
              {name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
