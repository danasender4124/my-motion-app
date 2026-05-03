import React from 'react';
import { Link } from 'react-router-dom';

interface FooterLink { label: string; to?: string }

const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  { title: 'הליגה', links: [
    { label: 'אודות' }, { label: 'היסטוריה' }, { label: 'אלופות לשעבר' }, { label: 'כללים' }, { label: 'תקנון' },
  ]},
  { title: 'ספורט', links: [
    { label: 'לוח משחקים', to: '/results' },
    { label: 'תוצאות',     to: '/results' },
    { label: 'טבלת הליגה', to: '/standings' },
    { label: 'סטטיסטיקה',  to: '/stats' },
    { label: 'VOD',        to: '/vod' },
  ]},
  { title: 'צרו קשר', links: [
    { label: 'יצירת קשר' }, { label: 'עיתונאים' }, { label: 'שיתופי פעולה' }, { label: 'נגישות' },
  ]},
];

const Footer: React.FC = () => (
  <footer
    className="mt-16 py-10 px-4 md:px-8"
    style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}
    dir="rtl"
  >
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: '#FF4D00', color: '#fff' }}>
              🏀
            </div>
            <span className="font-black text-sm" style={{ color: '#F2EDE6' }}>ליגת העל נשים</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(242,237,230,0.35)' }}>
            הליגה המקצועית הגבוהה ביותר לכדורסל נשים בישראל. 12 קבוצות, עונת 2024/25.
          </p>
          <div className="flex gap-3 mt-4">
            {['פייסבוק', 'אינסטגרם', 'יוטיוב'].map(s => (
              <a
                key={s}
                href="#"
                className="text-xs px-3 py-1.5 rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(242,237,230,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF4D00')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,237,230,0.5)')}
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {FOOTER_COLUMNS.map(col => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF4D00' }}>
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map(link => (
                <li key={link.label}>
                  {link.to ? (
                    <Link
                      to={link.to}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(242,237,230,0.55)' }}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <span className="text-sm" style={{ color: 'rgba(242,237,230,0.35)' }}>
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-4 pt-6 text-xs"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(242,237,230,0.3)' }}
      >
        <span>© 2025 מנהלת ליגת העל בכדורסל נשים · כל הזכויות שמורות</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">פרטיות</a>
          <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
          <a href="#" className="hover:text-white transition-colors">נגישות</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
