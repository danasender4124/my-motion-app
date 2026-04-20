// ─── League data ──────────────────────────────────────────────────────────────

export const TEAMS = [
  { id: 1,  name: 'מ. רמת גן',        short: 'מרג',  wins: 18, losses: 4,  pf: 1820, pa: 1654, color: '#005BAA' },
  { id: 2,  name: 'א. תל אביב',       short: 'אתא',  wins: 16, losses: 6,  pf: 1740, pa: 1658, color: '#E2001A' },
  { id: 3,  name: 'ה. ירושלים',       short: 'היר',  wins: 15, losses: 7,  pf: 1700, pa: 1610, color: '#FFB300' },
  { id: 4,  name: 'מ. חיפה',          short: 'מחי',  wins: 14, losses: 8,  pf: 1680, pa: 1640, color: '#007A33' },
  { id: 5,  name: 'ה. נתניה',         short: 'הנת',  wins: 12, losses: 10, pf: 1620, pa: 1610, color: '#FF4D00' },
  { id: 6,  name: 'מ. אשדוד',         short: 'מאש',  wins: 11, losses: 11, pf: 1590, pa: 1600, color: '#5B2D8E' },
  { id: 7,  name: 'בני ת"א',          short: 'בתא',  wins: 10, losses: 12, pf: 1580, pa: 1620, color: '#003087' },
  { id: 8,  name: 'ה. ב״ש',           short: 'הבש',  wins: 9,  losses: 13, pf: 1540, pa: 1600, color: '#CC0000' },
  { id: 9,  name: 'ה. רמת גן',        short: 'הרג',  wins: 8,  losses: 14, pf: 1490, pa: 1580, color: '#006341' },
  { id: 10, name: 'מ. כפר סבא',       short: 'מכס',  wins: 7,  losses: 15, pf: 1450, pa: 1590, color: '#002868' },
  { id: 11, name: 'א. ראשון לציון',   short: 'אר"ל', wins: 5,  losses: 17, pf: 1400, pa: 1640, color: '#D4AF37' },
  { id: 12, name: 'ה. חיפה',          short: 'החי',  wins: 3,  losses: 19, pf: 1350, pa: 1700, color: '#CC0000' },
];

export const RECENT_RESULTS = [
  { id: 1, date: '15.4', home: 'מ. רמת גן',  homeScore: 84, away: 'א. תל אביב',  awayScore: 71, round: 22 },
  { id: 2, date: '14.4', home: 'ה. ירושלים', homeScore: 78, away: 'מ. חיפה',     awayScore: 82, round: 22 },
  { id: 3, date: '14.4', home: 'ה. נתניה',   homeScore: 65, away: 'מ. אשדוד',    awayScore: 68, round: 22 },
  { id: 4, date: '13.4', home: 'בני ת"א',    homeScore: 90, away: 'ה. ב״ש',      awayScore: 77, round: 22 },
  { id: 5, date: '13.4', home: 'ה. רמת גן',  homeScore: 72, away: 'מ. כפר סבא',  awayScore: 69, round: 22 },
];

export const UPCOMING_GAMES = [
  { id: 1, date: '18.4', time: '19:00', home: 'מ. רמת גן',  away: 'ה. ירושלים', round: 23 },
  { id: 2, date: '18.4', time: '19:30', home: 'א. תל אביב', away: 'מ. חיפה',    round: 23 },
  { id: 3, date: '19.4', time: '18:00', home: 'ה. נתניה',   away: 'בני ת"א',    round: 23 },
  { id: 4, date: '19.4', time: '19:30', home: 'מ. אשדוד',   away: 'ה. ב״ש',     round: 23 },
];

export const TOP_SCORERS = [
  { rank: 1, name: 'ליאת כהן',    team: 'מ. רמת גן',   ppg: 22.4, rpg: 6.1, apg: 4.2 },
  { rank: 2, name: 'נועה לוי',    team: 'א. תל אביב',  ppg: 20.1, rpg: 4.8, apg: 3.9 },
  { rank: 3, name: 'שירה דוד',    team: 'ה. ירושלים',  ppg: 18.7, rpg: 7.3, apg: 2.1 },
  { rank: 4, name: 'מיכל אברהם',  team: 'מ. חיפה',     ppg: 17.9, rpg: 5.5, apg: 5.8 },
  { rank: 5, name: 'רונית שלום',  team: 'ה. נתניה',    ppg: 16.2, rpg: 3.9, apg: 2.4 },
];

export const NEWS = [
  {
    id: 1,
    tag: 'תוצאה',
    title: 'מ. רמת גן מכה את א. תל אביב 84-71 ומחזקת את המקום הראשון',
    excerpt: 'ליאת כהן הובילה עם 28 נקודות ו-9 ריבאונדים. רמת גן שומרת על יתרון של 4 משחקים בראש הטבלה.',
    date: '15 באפריל 2025',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80',
  },
  {
    id: 2,
    tag: 'חדשות',
    title: 'נבחרת הנשים מסיימת את ההכנות לאליפות אירופה',
    excerpt: 'המאמן הודיע על הרשימה הסופית של 12 שחקניות שייצגו את ישראל בטורניר.',
    date: '14 באפריל 2025',
    image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=600&q=80',
  },
  {
    id: 3,
    tag: 'ראיון',
    title: '"נגיע לגמר" – ליאת כהן בראיון בלעדי',
    excerpt: 'כוכבת מ. רמת גן מדברת על העונה המופלאה, על חלומות האלופות ועל הכדורסל הנשי בישראל.',
    date: '13 באפריל 2025',
    image: 'https://images.unsplash.com/photo-1626159550252-6b80e2f8b4a9?w=600&q=80',
  },
  {
    id: 4,
    tag: 'העברות',
    title: 'מ. חיפה מתגברת עם שחקנית אמריקאית מובחרת',
    excerpt: 'חיפה חתמה עם מארשה ג\'ונסון, פורוורד בת 26 מה-WNBA, לסיום העונה ולפלייאוף.',
    date: '12 באפריל 2025',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
  },
];
