// ─── League data — ליגת על נשים 2025 (source: ibasketball.co.il) ─────────────

export const TEAMS = [
  { id: 1,  name: 'מ. רמת גן',    short: 'מרג',  wins: 17, losses: 1,  pf: 1516, pa: 1233, color: '#005BAA' },
  { id: 2,  name: 'מ. אשדוד',     short: 'מאש',  wins: 12, losses: 6,  pf: 1375, pa: 1261, color: '#0066CC' },
  { id: 3,  name: 'א. רמלה',      short: 'ארמ',  wins: 10, losses: 8,  pf: 1376, pa: 1340, color: '#CC0000' },
  { id: 4,  name: 'ה. ראשל"צ',    short: 'הרל',  wins: 10, losses: 8,  pf: 1296, pa: 1230, color: '#E2001A' },
  { id: 5,  name: 'א. חולון',     short: 'אחל',  wins: 9,  losses: 9,  pf: 1369, pa: 1377, color: '#FF6600' },
  { id: 6,  name: 'ב. פ"ת',       short: 'בפת',  wins: 8,  losses: 10, pf: 1253, pa: 1362, color: '#003087' },
  { id: 7,  name: 'ה. ירושלים',   short: 'היר',  wins: 8,  losses: 10, pf: 1333, pa: 1340, color: '#FFB300' },
  { id: 8,  name: 'מ. כרמיאל',    short: 'מכר',  wins: 8,  losses: 10, pf: 1278, pa: 1313, color: '#4A90D9' },
  { id: 9,  name: 'מ. חיפה',      short: 'מחי',  wins: 7,  losses: 11, pf: 1325, pa: 1367, color: '#007A33' },
  { id: 10, name: 'ה. ב"ש',       short: 'הבש',  wins: 1,  losses: 17, pf: 1218, pa: 1516, color: '#CC0000' },
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
  { id: 1, date: '23.4', time: '19:00', home: 'ה. ראשל"צ', away: 'מ. אשדוד', round: 'פלייאוף' },
  { id: 3, date: '23.4', time: '20:10', home: 'א. חולון',  away: 'מ. רמת גן', round: 'פלייאוף' },
  { id: 4, date: '26.4', time: '19:00', home: 'מ. אשדוד',  away: 'ה. ראשל"צ', round: 'פלייאוף' },
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
