import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  he: {
    translation: {
      nav: {
        home: 'בית', games: 'משחקים', standings: 'טבלת הליגה',
        stats: 'סטטיסטיקה', news: 'חדשות', vod: 'VOD',
      },
      results: {
        title: 'משחקים ותוצאות',
        tab_results: 'תוצאות', tab_upcoming: 'המשחקים הבאים',
        col_date: 'תאריך', col_time: 'שעה', col_hall: 'אולם',
        col_home: 'מארחת', col_away: 'אורחת', col_score: 'תוצאה', col_stats: 'סטטיסטיקה',
        no_results: 'אין משחקים להציג כעת.',
      },
      standings: {
        title: 'טבלת הליגה',
        col_rank: 'דירוג', col_team: 'קבוצה', col_played: 'משחקים',
        col_won: 'נצחונות', col_lost: 'הפסדים', col_pf: 'נק׳ זכות',
        col_pa: 'נק׳ חובה', col_diff: 'הפרש', col_pts: 'נקודות',
      },
      stats: {
        title: 'סטטיסטיקה', pick_season: 'בחרי עונה',
        loading: 'טוען...', error: 'לא ניתן לטעון סטטיסטיקות כעת.',
        category_points: 'נקודות', category_rebounds: 'ריבאונדים',
        category_assists: 'אסיסטים', category_steals: 'חטיפות',
        category_blocks: 'חסימות', category_efficiency: 'יעילות',
        rank: 'דירוג', player: 'שחקנית', team: 'קבוצה', avg: 'ממוצע',
        view_all: 'הצגי הכל',
      },
      news: {
        title: 'חדשות', read_more: 'קראי עוד', back: 'חזרה לחדשות',
        loading: 'טוען חדשות...', no_posts: 'אין כתבות עדיין.',
      },
      vod: {
        title: 'VOD',
        all: 'הכל', highlights: 'היי-לייטס', interview: 'ראיון',
        recap: 'סיקור', other: 'אחר',
        no_videos: 'אין סרטונים עדיין.',
      },
      team: {
        roster: 'סגל', schedule: 'לוח משחקים', stats: 'סטטיסטיקה',
        management: 'הנהלה', coaching_staff: 'צוות מקצועי',
        latest_posts: 'חדשות אחרונות', contact: 'צרו קשר',
        quick_stats: 'נתונים מהירים', leaders: 'מובילות',
        no_roster: 'הסגל טרם פורסם', no_games: 'אין משחקים', position: 'עמדה',
        height: 'גובה', age: 'גיל', jersey: 'מס׳',
      },
      match: {
        box_score: 'בוקס סקור', lineups: 'הרכבים',
        media: 'מדיה', videos: 'סרטונים',
        quarter: 'רבע', total: 'סה״כ',
        starting_five: 'חמישייה פותחת', bench: 'ספסל', coach: 'מאמן/ת',
      },
      player: {
        season_avg: 'ממוצעי עונה', game_log: 'יומן משחקים',
        date: 'תאריך', opponent: 'יריבה', min: 'דקות', pts: 'נק׳',
        reb: 'ריב׳', ast: 'אס׳', stl: 'חט׳', blk: 'חס׳', to: 'איב׳',
      },
      footer: {
        copyright: 'כל הזכויות שמורות',
        col_league: 'הליגה', col_sport: 'ספורט', col_contact: 'צרו קשר',
        about: 'אודות', history: 'היסטוריה', past_champs: 'אלופות לשעבר',
        rules: 'כללים', regulations: 'תקנון',
        schedule: 'לוח משחקים', results: 'תוצאות', table: 'טבלת הליגה',
        stats: 'סטטיסטיקה', vod: 'VOD',
        contact_us: 'יצירת קשר', press: 'עיתונאים', partnerships: 'שיתופי פעולה',
        accessibility: 'נגישות', privacy: 'פרטיות', terms: 'תנאי שימוש',
        accessibility_statement: 'הצהרת נגישות',
        slogan: 'מנהלת ליגת העל בכדורסל לנשים בישראל.',
        brand: 'ליגת העל נשים',
      },
      common: {
        loading: 'טוען...', retry: 'נסי שוב', back: 'חזרה',
        error: 'שגיאה', search: 'חיפוש', all: 'הכל', view: 'הצגי',
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home', games: 'Games', standings: 'Standings',
        stats: 'Stats', news: 'News', vod: 'VOD',
      },
      results: {
        title: 'Games & Results',
        tab_results: 'Results', tab_upcoming: 'Upcoming',
        col_date: 'Date', col_time: 'Time', col_hall: 'Venue',
        col_home: 'Home', col_away: 'Away', col_score: 'Score', col_stats: 'Stats',
        no_results: 'No games to display.',
      },
      standings: {
        title: 'League Standings',
        col_rank: 'Rank', col_team: 'Team', col_played: 'GP',
        col_won: 'W', col_lost: 'L', col_pf: 'PF',
        col_pa: 'PA', col_diff: '+/-', col_pts: 'Pts',
      },
      stats: {
        title: 'Statistics', pick_season: 'Select season',
        loading: 'Loading...', error: 'Could not load statistics.',
        category_points: 'Points', category_rebounds: 'Rebounds',
        category_assists: 'Assists', category_steals: 'Steals',
        category_blocks: 'Blocks', category_efficiency: 'Efficiency',
        rank: 'Rank', player: 'Player', team: 'Team', avg: 'Avg',
        view_all: 'View all',
      },
      news: {
        title: 'News', read_more: 'Read more', back: 'Back to news',
        loading: 'Loading news...', no_posts: 'No articles yet.',
      },
      vod: {
        title: 'VOD',
        all: 'All', highlights: 'Highlights', interview: 'Interview',
        recap: 'Recap', other: 'Other',
        no_videos: 'No videos yet.',
      },
      team: {
        roster: 'Roster', schedule: 'Schedule', stats: 'Stats',
        management: 'Management', coaching_staff: 'Coaching Staff',
        latest_posts: 'Latest News', contact: 'Contact',
        quick_stats: 'Quick Stats', leaders: 'Team Leaders',
        no_roster: 'Roster not yet published', no_games: 'No games', position: 'Position',
        height: 'Height', age: 'Age', jersey: '#',
      },
      match: {
        box_score: 'Box Score', lineups: 'Lineups',
        media: 'Media', videos: 'Videos',
        quarter: 'Q', total: 'Total',
        starting_five: 'Starting Five', bench: 'Bench', coach: 'Coach',
      },
      player: {
        season_avg: 'Season Averages', game_log: 'Game Log',
        date: 'Date', opponent: 'Opponent', min: 'MIN', pts: 'PTS',
        reb: 'REB', ast: 'AST', stl: 'STL', blk: 'BLK', to: 'TO',
      },
      footer: {
        copyright: 'All rights reserved',
        col_league: 'League', col_sport: 'Sport', col_contact: 'Contact',
        about: 'About', history: 'History', past_champs: 'Past Champions',
        rules: 'Rules', regulations: 'Regulations',
        schedule: 'Schedule', results: 'Results', table: 'Standings',
        stats: 'Statistics', vod: 'VOD',
        contact_us: 'Contact us', press: 'Press', partnerships: 'Partnerships',
        accessibility: 'Accessibility', privacy: 'Privacy', terms: 'Terms of Use',
        accessibility_statement: 'Accessibility Statement',
        slogan: 'Israeli Women\'s Premier Basketball League.',
        brand: 'Women\'s Premier League',
      },
      common: {
        loading: 'Loading...', retry: 'Retry', back: 'Back',
        error: 'Error', search: 'Search', all: 'All', view: 'View',
      },
    },
  },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // Hebrew is the default — English is opt-in via the language toggle.
    // Browser language is intentionally ignored so we don't auto-switch
    // English-speaking visitors away from the canonical Hebrew site.
    lng: 'he',
    fallbackLng: 'he',
    supportedLngs: ['he', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
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
