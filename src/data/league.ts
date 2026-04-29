// ─── League data — ליגת על נשים 2025 (source: ibasketball.co.il) ─────────────

export const TEAMS = [
  { id: 1,  name: 'מכבי עירוני רמת גן',    short: 'מרג',  wins: 21, losses: 2,  pf: 1913, pa: 1573, color: '#005BAA' },
  { id: 2,  name: 'מכבי אשדוד נשים',       short: 'מאש',  wins: 15, losses: 8,  pf: 1749, pa: 1629, color: '#0066CC' },
  { id: 3,  name: 'הפועל ראשון לציון',      short: 'הרל',  wins: 13, losses: 10, pf: 1668, pa: 1580, color: '#E2001A' },
  { id: 4,  name: 'אליצור נוה דוד רמלה',   short: 'ארמ',  wins: 12, losses: 11, pf: 1792, pa: 1752, color: '#CC0000' },
  { id: 5,  name: 'אליצור חולון',           short: 'אחל',  wins: 10, losses: 13, pf: 1748, pa: 1791, color: '#FF6600' },
  { id: 6,  name: 'בנות פתח תקווה בני',    short: 'בפת',  wins: 10, losses: 13, pf: 1603, pa: 1766, color: '#003087' },
  { id: 7,  name: 'ה. ירושלים',            short: 'היר',  wins: 9,  losses: 14, pf: 1540, pa: 1625, color: '#FFB300' },
  { id: 8,  name: 'מ. כרמיאל',             short: 'מכר',  wins: 9,  losses: 14, pf: 1478, pa: 1553, color: '#4A90D9' },
  { id: 9,  name: 'מ. חיפה',               short: 'מחי',  wins: 9,  losses: 14, pf: 1495, pa: 1562, color: '#007A33' },
  { id: 10, name: 'ה. ב"ש',                short: 'הבש',  wins: 7,  losses: 16, pf: 1318, pa: 1469, color: '#CC0000' },
];

export const RECENT_RESULTS = [
  { id: 1, date: '20.4', home: 'מ. רמת גן', homeScore: 58, away: 'א. חולון',  awayScore: 79, round: 'פלייאוף' },
  { id: 3, date: '19.4', home: 'מ. אשדוד',  homeScore: 67, away: 'ה. ראשל"צ', awayScore: 74, round: 'פלייאוף' },
  { id: 4, date: '16.4', home: 'א. רמלה',   homeScore: 70, away: 'א. חולון',  awayScore: 80, round: 'פלייאוף' },
  { id: 5, date: '19.1', home: 'ה. ראשל"צ', homeScore: 92, away: 'מ. כרמיאל', awayScore: 54, round: 'מ׳ 17' },
  { id: 6, date: '19.1', home: 'מ. חיפה',   homeScore: 80, away: 'מ. רמת גן', awayScore: 71, round: 'מ׳ 17' },
  { id: 7, date: '19.1', home: 'ב. פ"ת',    homeScore: 75, away: 'ה. ב"ש',   awayScore: 68, round: 'מ׳ 17' },
  { id: 8, date: '12.1', home: 'מ. אשדוד',  homeScore: 76, away: 'מ. רמת גן', awayScore: 86, round: 'מ׳ 16' },
];

export const UPCOMING_GAMES = [
  { id: 1,  date: '30/04/2026', time: '19:30', round: '24', venue: 'אולם פייס, כפר בלום',       watchUrl: '', home: 'ה. ראשל"צ',  homeLogo: '/teams/team-03.png', away: 'מ. רמת גן',   awayLogo: '/teams/team-10.png' },
  { id: 2,  date: '01/05/2026', time: '13:30', round: '18', venue: 'לב המחשבה, נס ציונה',       watchUrl: '', home: 'מ. חיפה',    homeLogo: '/teams/team-09.png', away: 'ה. ב"ש',     awayLogo: '/teams/team-04.png' },
  { id: 3,  date: '02/05/2026', time: '20:40', round: '19', venue: 'היכל טוטו, חולון',          watchUrl: '', home: 'א. חולון',   homeLogo: '/teams/team-02.png', away: 'ה. ראשל"צ',  awayLogo: '/teams/team-03.png' },
  { id: 4,  date: '03/05/2026', time: '18:35', round: '23', venue: 'הקונדציה, באר שבע',         watchUrl: '', home: 'ה. ב"ש',    homeLogo: '/teams/team-04.png', away: 'מ. כרמיאל',  awayLogo: '/teams/team-07.png' },
  { id: 5,  date: '03/05/2026', time: '21:00', round: '23', venue: 'פייס ארנה, ירושלים',        watchUrl: '', home: 'ה. ירושלים', homeLogo: '/teams/team-06.png', away: 'מ. חיפה',    awayLogo: '/teams/team-09.png' },
  { id: 6,  date: '04/05/2026', time: '18:00', round: '20', venue: 'ארנה מ. אשדוד',             watchUrl: '', home: 'מ. אשדוד',   homeLogo: '/teams/team-08.png', away: 'א. רמלה',    awayLogo: '/teams/team-01.png' },
  { id: 7,  date: '04/05/2026', time: '21:00', round: '23', venue: 'זיסמן, רמת גן',             watchUrl: '', home: 'מ. רמת גן',  homeLogo: '/teams/team-10.png', away: 'ב. פ"ת',     awayLogo: '/teams/team-05.png' },
  { id: 8,  date: '05/05/2026', time: '20:10', round: '25', venue: 'היכל טוטו, חולון',          watchUrl: '', home: 'א. חולון',   homeLogo: '/teams/team-02.png', away: 'מ. אשדוד',   awayLogo: '/teams/team-08.png' },
  { id: 9,  date: '06/05/2026', time: '19:00', round: '25', venue: 'אולם מ. כרמיאל',            watchUrl: '', home: 'מ. כרמיאל',  homeLogo: '/teams/team-07.png', away: 'מ. רמת גן',  awayLogo: '/teams/team-10.png' },
  { id: 10, date: '06/05/2026', time: '19:10', round: '25', venue: 'בית מכבי, ראשל"צ',          watchUrl: '', home: 'ה. ראשל"צ', homeLogo: '/teams/team-03.png', away: 'ה. ירושלים', awayLogo: '/teams/team-06.png' },
  { id: 11, date: '07/05/2026', time: '18:30', round: '25', venue: 'ארנה מ. ב"ש',              watchUrl: '', home: 'ה. ב"ש',    homeLogo: '/teams/team-04.png', away: 'ב. פ"ת',     awayLogo: '/teams/team-05.png' },
  { id: 12, date: '07/05/2026', time: '20:00', round: '25', venue: 'מגרש ב. פ"ת',              watchUrl: '', home: 'ב. פ"ת',    homeLogo: '/teams/team-05.png', away: 'א. רמלה',    awayLogo: '/teams/team-01.png' },
];

export const TOP_SCORERS = [
  { rank: 1, name: 'ספרקל טיילור',   team: 'ב. פ"ת',     ppg: 23.9, rpg: 6.0,  apg: 3.0 },
  { rank: 2, name: 'ש. סלרס',        team: 'מ. חיפה',    ppg: 21.9, rpg: 7.1,  apg: 6.1 },
  { rank: 3, name: 'שיי קלי',        team: 'א. חולון',   ppg: 20.1, rpg: 10.1, apg: 4.9 },
  { rank: 4, name: 'ק. מלשקה',       team: 'מ. אשדוד',   ppg: 19.0, rpg: 9.1,  apg: 2.8 },
  { rank: 5, name: 'אריאל הירן',     team: 'מ. כרמיאל',  ppg: 18.9, rpg: 6.8,  apg: 6.3 },
  { rank: 6, name: 'ו. ויויאנס',     team: 'מ. רמת גן',  ppg: 18.8, rpg: 8.9,  apg: 3.7 },
  { rank: 7, name: "א. ג'נקינס",    team: 'מ. כרמיאל',  ppg: 18.3, rpg: 11.2, apg: 3.3 },
];

export const NEWS = [
  {
    id: 1,
    tag: 'פלייאוף',
    title: 'א. חולון מנצחת 80–70 ועוברת לסיבוב הבא',
    excerpt: 'אליצור חולון הפתיעה את רמלה בגמ׳ 1 של חצי הגמר ועברה להוביל 1–0 בסדרה.',
    date: '16 באפריל 2026',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
  },
  {
    id: 2,
    tag: 'פלייאוף',
    title: 'ה. ראשל"צ מנצחת את מ. אשדוד 74–67 בגמ׳ 1',
    excerpt: 'הפועל ראשון לציון פתחה את חצי הגמר בניצחון ומובילה 1–0 בדרך לגמר.',
    date: '19 באפריל 2026',
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=600&q=80',
  },
  {
    id: 3,
    tag: 'עונה סדירה',
    title: 'מ. רמת גן סיימה ראשונה עם 17 ניצחונות מתוך 18',
    excerpt: 'מכבי עירוני רמת גן שלטה בעונה הסדירה עם הפרש נקודות של +283, הטוב ביותר בליגה.',
    date: '19 בינואר 2026',
    image: 'https://images.unsplash.com/photo-1626159550252-6b80e2f8b4a9?w=600&q=80',
  },
  {
    id: 4,
    tag: 'סטטיסטיקה',
    title: 'ספרקל טיילור — מלכת הנקודות עם 23.9 לפגישה',
    excerpt: 'שחקנית בנות פ"ת הובילה את ליגת העל נשים בנקודות לאורך כל העונה הסדירה.',
    date: '20 בינואר 2026',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
  },
];
