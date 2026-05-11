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
        col_watch: 'צפייה', col_round: 'מחזור', col_details: 'פרטים',
        no_results: 'אין משחקים להציג כעת.',
        loading: 'טוען משחקים...', error: 'לא ניתן לטעון משחקים כעת.',
        no_games_season: 'אין משחקים בעונה זו.',
        title_watch: 'צפי במשחק', title_stats: 'סטטיסטיקת משחק',
        title_details: 'פרטי משחק וסגלים',
        title_no_stats: 'סטטיסטיקה טרם זמינה', title_no_watch: 'קישור צפייה טרם זמין',
      },
      standings: {
        title: 'טבלת הליגה',
        col_rank: '#', col_team: 'קבוצה', col_played: 'מש׳',
        col_won: 'ניצ׳', col_lost: 'הפ׳', col_pf: 'קלעה',
        col_pa: 'ספגה', col_diff: 'הפרש', col_pts: 'נק׳',
        lower_bracket: 'בית תחתון', lower_bracket_note: '· מקומות 7-10',
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
        loading: 'טוען...', error: 'לא ניתן לטעון חדשות כעת.',
        no_posts: 'אין כתבות עדיין', more_posts: '+ כתבות נוספות',
        sidebar_title: 'חדשות וכתבות',
        gallery_close: 'סגור', gallery_next: 'הבא', gallery_prev: 'הקודם',
      },
      vod: {
        title: 'VOD',
        all: 'הכל', highlights: 'היי-לייטס', interview: 'ראיון',
        recap: 'סיקור', other: 'אחר',
        no_videos: 'אין סרטונים עדיין.',
        close: 'סגור', cannot_play: 'לא ניתן להציג את הסרטון',
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
        col_watch: 'Watch', col_round: 'Round', col_details: 'Details',
        no_results: 'No games to display.',
        loading: 'Loading games...', error: 'Could not load games right now.',
        no_games_season: 'No games this season.',
        title_watch: 'Watch game', title_stats: 'Game statistics',
        title_details: 'Game details and rosters',
        title_no_stats: 'Statistics not yet available', title_no_watch: 'Stream link not yet available',
      },
      standings: {
        title: 'League Standings',
        col_rank: '#', col_team: 'Team', col_played: 'GP',
        col_won: 'W', col_lost: 'L', col_pf: 'PF',
        col_pa: 'PA', col_diff: '+/-', col_pts: 'Pts',
        lower_bracket: 'Lower Bracket', lower_bracket_note: '· Positions 7-10',
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
        loading: 'Loading...', error: 'Could not load news right now.',
        no_posts: 'No articles yet', more_posts: '+ More articles',
        sidebar_title: 'News & Articles',
        gallery_close: 'Close', gallery_next: 'Next', gallery_prev: 'Previous',
      },
      vod: {
        title: 'VOD',
        all: 'All', highlights: 'Highlights', interview: 'Interview',
        recap: 'Recap', other: 'Other',
        no_videos: 'No videos yet.',
        close: 'Close', cannot_play: 'Unable to play this video',
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
