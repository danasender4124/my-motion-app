import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  he: {
    translation: {
      nav: {
        home: 'בית',
        games: 'משחקים',
        standings: 'טבלת הליגה',
        stats: 'סטטיסטיקה',
        news: 'חדשות',
        vod: 'VOD',
      },
      results: {
        title: 'משחקים ותוצאות',
        tab_results: 'תוצאות',
        tab_upcoming: 'המשחקים הבאים',
        col_date: 'תאריך',
        col_time: 'שעה',
        col_hall: 'אולם',
        col_home: 'מארחת',
        col_away: 'אורחת',
        col_score: 'תוצאה',
        col_stats: 'סטטיסטיקה',
      },
      stats: {
        title: 'סטטיסטיקה',
        pick_season: 'בחרי עונה',
        loading: 'טוען...',
        error: 'לא ניתן לטעון סטטיסטיקות כעת.',
        category_points:    'נקודות',
        category_rebounds:  'ריבאונדים',
        category_assists:   'אסיסטים',
        category_steals:    'חטיפות',
        category_blocks:    'חסימות',
        category_efficiency:'יעילות',
      },
      footer: {
        copyright: 'כל הזכויות שמורות',
      },
      common: {
        loading: 'טוען...',
        retry:  'נסי שוב',
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        games: 'Games',
        standings: 'Standings',
        stats: 'Stats',
        news: 'News',
        vod: 'VOD',
      },
      results: {
        title: 'Games & Results',
        tab_results: 'Results',
        tab_upcoming: 'Upcoming',
        col_date: 'Date',
        col_time: 'Time',
        col_hall: 'Venue',
        col_home: 'Home',
        col_away: 'Away',
        col_score: 'Score',
        col_stats: 'Stats',
      },
      stats: {
        title: 'Statistics',
        pick_season: 'Select season',
        loading: 'Loading...',
        error: 'Could not load statistics.',
        category_points:    'Points',
        category_rebounds:  'Rebounds',
        category_assists:   'Assists',
        category_steals:    'Steals',
        category_blocks:    'Blocks',
        category_efficiency:'Efficiency',
      },
      footer: {
        copyright: 'All rights reserved',
      },
      common: {
        loading: 'Loading...',
        retry:  'Retry',
      },
    },
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'he',
    supportedLngs: ['he', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'wbpl_lang',
    },
  });

// Apply RTL/LTR direction on language change
const applyDir = (lng: string) => {
  document.documentElement.setAttribute('dir', lng === 'he' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lng);
};
applyDir(i18n.language || 'he');
i18n.on('languageChanged', applyDir);

export default i18n;
