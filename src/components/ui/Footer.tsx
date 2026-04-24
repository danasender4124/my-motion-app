import React from 'react';

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
        {[
          { title: 'הליגה', links: ['אודות', 'היסטוריה', 'אלופות לשעבר', 'כללים', 'תקנון'] },
          { title: 'ספורט', links: ['לוח משחקים', 'תוצאות', 'טבלת הליגה', 'סטטיסטיקה', 'פלייאוף'] },
          { title: 'צרו קשר', links: ['יצירת קשר', 'עיתונאים', 'שיתופי פעולה', 'נגישות'] },
        ].map(col => (
          <div key={col.title}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#FF4D00' }}>
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map(link => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(242,237,230,0.45)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F2EDE6')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,237,230,0.45)')}
                  >
                    {link}
                  </a>
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
