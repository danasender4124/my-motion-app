import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const NotFoundPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';

  return (
    <div
      dir={dir}
      className="flex flex-col items-center justify-center text-center px-6"
      style={{ minHeight: '60svh' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="flex flex-col items-center gap-5"
      >
        <span
          className="font-black tabular-nums leading-none select-none"
          style={{
            fontSize: 'clamp(6rem, 18vw, 11rem)',
            color: 'transparent',
            WebkitTextStroke: '2px rgba(255,77,0,0.85)',
            letterSpacing: '-0.04em',
          }}
        >
          404
        </span>
        <h1 className="text-2xl md:text-3xl font-black" style={{ color: '#F2EDE6' }}>
          {t('notfound.title')}
        </h1>
        <p className="text-sm max-w-md" style={{ color: 'rgba(242,237,230,0.55)' }}>
          {t('notfound.subtitle')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <Link
            to="/"
            className="px-6 py-2.5 font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: 'var(--grad-orange)', boxShadow: 'var(--sheen-top), var(--shadow-orange)' }}
          >
            {t('notfound.home')}
          </Link>
          <Link
            to="/results"
            className="px-6 py-2.5 font-bold transition-colors hover:bg-white/10"
            style={{ color: '#F2EDE6', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {t('notfound.games')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
