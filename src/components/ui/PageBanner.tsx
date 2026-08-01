// src/components/ui/PageBanner.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface PageBannerProps {
  title: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ title }) => {
  const { i18n } = useTranslation();
  const dir: 'rtl' | 'ltr' = i18n.language === 'en' ? 'ltr' : 'rtl';
  return (
  <div
    className="relative w-full flex items-center justify-center overflow-hidden"
    style={{
      height: 'clamp(96px, 13vw, 150px)',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)',
    }}
  >
    {/* Real game photo (wide optimized crop) */}
    <div
      className="absolute inset-0 bg-cover"
      style={{ backgroundImage: 'url(/header-arena.jpg)', backgroundPosition: 'center 22%' }}
    />
    {/* Navy wash + side vignettes so the title owns the frame */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(to bottom, rgba(7,8,12,0.55) 0%, rgba(7,8,12,0.72) 100%),' +
          'radial-gradient(ellipse 90% 130% at 50% 50%, transparent 30%, rgba(7,8,12,0.55) 100%)',
      }}
    />

    {/* Title */}
    <motion.h1
      className="relative z-10 font-black text-center"
      style={{
        color: '#F2EDE6',
        fontSize: 'clamp(1.5rem, 3.2vw, 2.4rem)',
        letterSpacing: '-0.02em',
        lineHeight: 1,
        direction: dir,
        textShadow: '0 2px 18px rgba(3,6,18,0.8)',
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
    >
      {title}
    </motion.h1>

    {/* Thin gradient base line — softer than a thick flat border */}
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 right-0"
      style={{ height: 3, background: 'var(--grad-orange-line)' }}
    />
  </div>
  );
};

export default PageBanner;
