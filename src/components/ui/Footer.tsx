import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FooterLink { label: string; to?: string }

const useFooterColumns = (): { title: string; links: FooterLink[] }[] => {
  const { t } = useTranslation();
  return [
    { title: t('footer.col_league'), links: [
      { label: t('footer.about') }, { label: t('footer.history') },
      { label: t('footer.past_champs') }, { label: t('footer.rules') },
      { label: t('footer.regulations') },
    ]},
    { title: t('footer.col_sport'), links: [
      { label: t('footer.schedule'), to: '/results' },
      { label: t('footer.results'),  to: '/results' },
      { label: t('footer.table'),    to: '/standings' },
      { label: t('footer.stats'),    to: '/stats' },
      { label: t('footer.vod'),      to: '/vod' },
    ]},
    { title: t('footer.col_contact'), links: [
      { label: t('footer.contact_us') }, { label: t('footer.press') },
      { label: t('footer.partnerships') },
      { label: t('footer.accessibility'), to: '/accessibility' },
    ]},
  ];
};

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const FOOTER_COLUMNS = useFooterColumns();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  return (
  <footer
    className="mt-16 py-10 px-4 md:px-8"
    style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}
    dir={dir}
  >
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/league-logo.png"
              alt="מנהלת ליגת העל"
              className="h-10 w-auto object-contain shrink-0"
            />
            <span className="font-black text-sm" style={{ color: '#F2EDE6' }}>{t('footer.brand')}</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(242,237,230,0.35)' }}>
            {t('footer.slogan')}
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href="https://www.facebook.com/share/1Gt2jBuLPP/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="פייסבוק"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(242,237,230,0.6)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = '#1877F2'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(242,237,230,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.99 22 12z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/wbl_israel?igsh=dHUzd200bzI0cTQw"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="אינסטגרם"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(242,237,230,0.6)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(242,237,230,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
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
        <span>© 2025 {t('footer.brand')} · {t('footer.copyright')}</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
          <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
          <Link to="/accessibility" className="hover:text-white transition-colors">{t('footer.accessibility_statement')}</Link>
        </div>
      </div>
    </div>
  </footer>
  );
};

export default Footer;
