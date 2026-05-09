import React from 'react';

// Israeli accessibility statement template — תקנות שוויון זכויות לאנשים עם
// מוגבלות (התאמות נגישות לשירות), תשע״ג-2013 + תקן ישראלי 5568 (WCAG 2.0 AA)
//
// !!! חובה: למלא את פרטי רכז/ת הנגישות (שם, מייל, טלפון) לפני העלאה לאוויר.

const COORDINATOR = {
  name: 'רמי קצוני',
  role: 'רכז נגישות — מנהלת ליגת העל בכדורסל לנשים',
  email: 'rami@wbpl.co.il',
  phone: '052-4429997',
};

const LAST_UPDATED = '08/05/2026';

const AccessibilityStatementPage: React.FC = () => {
  return (
    <main
      dir="rtl"
      className="min-h-screen py-12 px-4 md:px-8"
      style={{ background: '#07080C', color: '#F2EDE6' }}
    >
      <article
        className="max-w-3xl mx-auto rounded-2xl p-6 md:p-10"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h1 className="text-3xl font-black mb-2">הצהרת נגישות</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(242,237,230,0.6)' }}>
          עודכן לאחרונה: {LAST_UPDATED}
        </p>

        <Section title="כללי">
          <p>
            מנהלת ליגת העל בכדורסל לנשים בישראל (להלן: "המנהלת") רואה חשיבות רבה
            בהנגשת שירותיה הדיגיטליים לכל אדם, לרבות אנשים עם מוגבלות. אנו פועלים
            להפיכת אתר האינטרנט שלנו לנגיש לכלל הציבור בהתאם להוראות תקנות שוויון
            זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ולתקן
            הישראלי לנגישות אתרי אינטרנט (ת״י 5568) ברמה AA.
          </p>
        </Section>

        <Section title="התאמות הנגישות באתר">
          <p>האתר עומד בדרישות WCAG 2.0 ברמה AA וכולל את ההתאמות הבאות:</p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>תפריט נגישות צף הזמין מכל עמוד באתר.</li>
            <li>אפשרות להגדלת גודל הטקסט עד 130%.</li>
            <li>מצבי ניגודיות גבוהה והפיכה.</li>
            <li>הדגשת קישורים בקו תחתון.</li>
            <li>גופן ברור וקריא להעצמת קריאות.</li>
            <li>סמן עכבר מוגדל.</li>
            <li>מבנה כותרות סמנטי לניווט באמצעות קוראי מסך.</li>
            <li>תיוג תמונות וכפתורים בתגיות ARIA מתאימות.</li>
            <li>ניווט מלא במקלדת (Tab / Shift+Tab) עם סימון מוקד ויזואלי בולט.</li>
            <li>קישור "דילוג לתוכן" המופיע בלחיצה על Tab בכניסה לעמוד.</li>
            <li>טקסטים בעברית בכיוון RTL נכון.</li>
            <li>תאימות לקוראי מסך מובילים (NVDA, JAWS, VoiceOver).</li>
          </ul>
        </Section>

        <Section title="חלקים שעדיין אינם נגישים במלואם">
          <p>
            אנו עמלים על שיפור מתמיד של נגישות האתר. ייתכן שתיתקלו בחלקים מסוימים
            שאינם מונגשים במלואם, ובכלל זה:
          </p>
          <ul className="list-disc pr-6 space-y-1 mt-2">
            <li>תוכן וסרטונים המגיעים מספקי תוכן חיצוניים (YouTube, Facebook, וכד׳).</li>
            <li>מסמכי PDF שנוצרו על ידי גורמים חיצוניים — לבקשתכם נספק חלופה נגישה.</li>
            <li>תמונות היסטוריות שטרם תויגו בטקסט חלופי מלא.</li>
          </ul>
        </Section>

        <Section title="פניות בנושא נגישות">
          <p>
            במקרה שנתקלתם בבעיית נגישות באתר, או שיש לכם הצעות לשיפור, נשמח לשמוע
            ולסייע. ניתן לפנות אל רכז/ת הנגישות שלנו:
          </p>
          <div
            className="mt-4 p-4 rounded-xl"
            style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)' }}
          >
            <div className="font-bold text-lg mb-1">{COORDINATOR.name}</div>
            <div className="text-sm" style={{ color: 'rgba(242,237,230,0.7)' }}>{COORDINATOR.role}</div>
            <div className="mt-3 space-y-1 text-sm">
              <div>
                📧 דוא״ל:{' '}
                <a href={`mailto:${COORDINATOR.email}`} style={{ color: '#FF4D00' }}>
                  {COORDINATOR.email}
                </a>
              </div>
              <div>
                📞 טלפון:{' '}
                <a href={`tel:${COORDINATOR.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#FF4D00' }}>
                  {COORDINATOR.phone}
                </a>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: 'rgba(242,237,230,0.55)' }}>
              נא לציין בפנייה: כתובת הדף שבו נתקלתם בבעיה, תיאור התקלה, סוג המכשיר
              והדפדפן בו השתמשתם, וכן אמצעי קשר חוזר.
            </p>
            <p className="text-xs mt-2" style={{ color: 'rgba(242,237,230,0.55)' }}>
              נשתדל לטפל בפנייתכם תוך 14 ימי עסקים מיום קבלתה.
            </p>
          </div>
        </Section>

        <Section title="הצהרת התאמה">
          <p>
            הצהרה זו נכונה ל־<strong>{LAST_UPDATED}</strong>. רמת הנגישות של אתר זה
            נבדקת באופן שוטף ומותאמת לתקני הנגישות הרלוונטיים. במידה ויחולו שינויים
            מהותיים באתר או בתקנים, ההצהרה תעודכן בהתאם.
          </p>
        </Section>

        <p className="text-xs mt-8" style={{ color: 'rgba(242,237,230,0.4)' }}>
          הצהרה זו נכתבה בהתאם לדרישות תקנות שוויון זכויות לאנשים עם מוגבלות
          (התאמות נגישות לשירות), תשע״ג-2013.
        </p>
      </article>
    </main>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-xl font-bold mb-2" style={{ color: '#FF4D00' }}>{title}</h2>
    <div className="text-base leading-relaxed" style={{ color: 'rgba(242,237,230,0.85)' }}>
      {children}
    </div>
  </section>
);

export default AccessibilityStatementPage;
