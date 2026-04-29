// src/components/ui/PageBanner.tsx
import React from 'react';
import { motion } from 'framer-motion';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface PageBannerProps {
  title: string;
}

const PageBanner: React.FC<PageBannerProps> = ({ title }) => (
  <div
    className="relative w-full flex items-center justify-center overflow-hidden border-b-4"
    style={{
      height: 'clamp(56px, 7vw, 80px)',
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
        fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
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
);

export default PageBanner;
