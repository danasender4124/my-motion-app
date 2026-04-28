// src/components/ui/PageBanner.tsx
import React from 'react';
import { motion } from 'framer-motion';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface PageBannerProps {
  title: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ title }) => (
  <div className="px-4 md:px-8 py-6">
    <div
      className="relative max-w-4xl mx-auto flex items-center justify-center overflow-hidden rounded-2xl border-b-4"
      style={{
        height: 'clamp(140px, 18vw, 220px)',
        borderColor: '#FF4D00',
        background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 50%, #0f1117 100%)',
      }}
    >
      {/* Arena background image (optional — gradient fallback if absent) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/arena.jpg)' }}
      />
      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(7,8,12,0.70)' }}
      />

      {/* Title */}
      <motion.h1
        className="relative z-10 font-black text-center"
        style={{
          color: '#F2EDE6',
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
          direction: 'rtl',
        }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      >
        {title}
      </motion.h1>
    </div>
  </div>
);

export default PageBanner;
