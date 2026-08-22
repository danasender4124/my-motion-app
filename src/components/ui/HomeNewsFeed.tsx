// src/components/ui/HomeNewsFeed.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { NEWS } from '../../data/league';

const EASE = [0.25, 1, 0.5, 1] as const;

const HomeNewsFeed: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  const [activeId, setActiveId] = useState(NEWS[0].id);
  const featured = NEWS.find(n => n.id === activeId) ?? NEWS[0];

  return (
    <section
      dir={dir}
      className="w-full"
      style={{ background: '#07080C', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row" style={{ minHeight: '420px' }}>

        {/* ── Featured article (left ~75%) ── */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: '320px' }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={featured.id}
              src={featured.image}
              alt={featured.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            />
          </AnimatePresence>

          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to top, rgba(7,8,12,0.95) 0%, rgba(7,8,12,0.4) 45%, transparent 100%)',
            }}
          />

          {/* Text over image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={featured.id}
              className="absolute bottom-0 right-0 left-0 p-6 md:p-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: '#FF4D00', color: '#fff' }}
              >
                {featured.tag}
              </span>
              <h2
                className="text-xl md:text-2xl lg:text-3xl font-black leading-tight mb-2"
                style={{ color: '#F2EDE6' }}
              >
                {featured.title}
              </h2>
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'rgba(242,237,230,0.6)' }}>
                {featured.excerpt}
              </p>
              <span className="text-xs mt-2 block" style={{ color: 'rgba(242,237,230,0.35)' }}>
                {featured.date}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sidebar list (right ~25%) ── */}
        <div
          className="lg:w-72 xl:w-80 flex flex-col divide-y"
          style={{
            background: '#0D1020',
            borderRight: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-black" style={{ color: '#F2EDE6' }}>{t('news.sidebar_title')}</span>
            <a
              href="/news"
              className="text-xs font-medium transition-colors"
              style={{ color: 'rgba(242,237,230,0.4)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FF4D00')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(242,237,230,0.4)')}
            >
              {t('news.more_posts')}
            </a>
          </div>

          {/* News items */}
          {NEWS.map(article => {
            const isActive = article.id === activeId;
            return (
              <button
                key={article.id}
                onClick={() => setActiveId(article.id)}
                className="text-right px-5 py-4 transition-colors duration-150 cursor-pointer w-full"
                style={{
                  background: isActive ? 'rgba(255,77,0,0.08)' : 'transparent',
                  borderRight: isActive ? '3px solid #FF4D00' : '3px solid transparent',
                }}
              >
                <p
                  className="text-sm font-bold leading-snug line-clamp-2"
                  style={{ color: isActive ? '#FF4D00' : '#F2EDE6' }}
                >
                  {article.title}
                </p>
                <span className="text-xs mt-1 block" style={{ color: 'rgba(242,237,230,0.35)' }}>
                  {article.date}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HomeNewsFeed;
