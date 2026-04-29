import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

// ─── Easing curves (natural deceleration, not bounce) ────────────────────────
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_OUT_QUART = [0.25, 1, 0.5, 1] as const;

// ─── Stagger helpers ──────────────────────────────────────────────────────────
const stagger = (delayBase: number, staggerAmount = 0.1) => ({
  hidden: {},
  visible: { transition: { staggerChildren: staggerAmount, delayChildren: delayBase } },
});

const fadeUp = (delay = 0, duration = 0.7) => ({
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration, delay, ease: EASE_OUT_EXPO } },
});

const fadeIn = (delay = 0, duration = 0.6) => ({
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration, delay, ease: EASE_OUT_QUART } },
});

// ─── Live match ticker ────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { home: 'מ. רמת גן', homeScore: 78, away: 'א. תל אביב', awayScore: 65, status: 'גמר סיים' },
  { home: 'ה. ירושלים', homeScore: 71, away: 'מ. חיפה', awayScore: 74, status: 'חי • ר׳ 3' },
  { home: 'א. נתניה', homeScore: 58, away: 'מ. אשדוד', awayScore: 63, status: 'חי • ר׳ 2' },
  { home: 'ב. ת״א', homeScore: 82, away: 'ה. ב״ש', awayScore: 79, status: 'גמר סיים' },
];

const MatchTicker: React.FC = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % TICKER_ITEMS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const match = TICKER_ITEMS[idx];
  const isLive = match.status.startsWith('חי');

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-sm overflow-hidden min-w-[260px]" dir="rtl">
      {isLive && (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-widest shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
          LIVE
        </span>
      )}
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: EASE_OUT_QUART }}
          className="flex items-center gap-2 font-medium whitespace-nowrap"
          style={{ color: '#F2EDE6' }}
        >
          <span>{match.home}</span>
          <span className="font-black text-base tabular-nums" style={{ color: '#FFB300' }}>
            {match.homeScore}–{match.awayScore}
          </span>
          <span>{match.away}</span>
          {!isLive && <span className="text-white/40 text-xs">{'· ' + match.status}</span>}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

// ─── Season stat pill ─────────────────────────────────────────────────────────
const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col items-center px-5 py-2 border-r border-white/10 last:border-0">
    <span className="text-xl font-black tabular-nums" style={{ color: '#FF4D00' }}>{value}</span>
    <span className="text-[11px] font-medium tracking-wide uppercase" style={{ color: 'rgba(242,237,230,0.45)' }}>{label}</span>
  </div>
);

// ─── Feature item ─────────────────────────────────────────────────────────────
interface FeatureItemProps {
  name: string;
  value: string;
  side: 'right' | 'left';
  top: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ name, value, side, top }) => {
  const positionClass = side === 'right'
    ? 'right-0 md:right-8 flex-row-reverse'
    : 'left-0 md:left-8 flex-row';

  return (
    <motion.div
      variants={fadeUp(0)}
      className={`absolute ${top} ${positionClass} z-20 flex items-center gap-3 group cursor-default select-none`}
    >
      <motion.div
        className="flex flex-col items-end text-right"
        style={{ textAlign: side === 'right' ? 'right' : 'left' }}
        whileHover={{ x: side === 'right' ? -4 : 4 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-sm font-bold leading-tight" style={{ color: '#F2EDE6' }}>{name}</span>
        <span className="text-xs" style={{ color: 'rgba(242,237,230,0.45)' }}>{value}</span>
      </motion.div>
      <div className="relative flex-shrink-0">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: '#FF4D00' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: '#FF4D00' }}
          animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
};

// ─── Flame video ──────────────────────────────────────────────────────────────
const FlameVideo: React.FC = () => (
  <video
    autoPlay loop muted playsInline
    className="absolute inset-0 w-full h-full object-cover"
    style={{ filter: 'brightness(0.75) contrast(1.1) saturate(1.2)' }}
  >
    <source src="/flame.mp4" type="video/mp4" />
  </video>
);

// ─── Headline word reveal ─────────────────────────────────────────────────────
const HeadlineWord: React.FC<{ children: React.ReactNode; delay: number }> = ({ children, delay }) => (
  <motion.span
    variants={fadeUp(delay, 0.65)}
    className="inline-block"
  >
    {children}
  </motion.span>
);

// ─── Main Hero ────────────────────────────────────────────────────────────────
export const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const videoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <div ref={heroRef} className="relative w-full min-h-svh overflow-hidden" style={{ background: '#07080C' }} dir="rtl">

      {/* ── Video layer ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ opacity: videoOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease: EASE_OUT_QUART }}
      >
        <FlameVideo />
        {/* Layered gradients for depth */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(7,8,12,0.55) 0%, rgba(7,8,12,0.15) 40%, rgba(7,8,12,0.7) 80%, #07080C 100%)',
        }} />
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 55%, transparent 0%, rgba(7,8,12,0.6) 100%)',
        }} />
      </motion.div>

      {/* ── Ambient glow ── */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2.5, delay: 0.5 }}
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 62%, rgba(255,77,0,0.18) 0%, transparent 70%)',
        }}
      />

      {/* ── Hero content ── */}
      <motion.div
        style={{ y: textY, paddingTop: '1.75rem', paddingBottom: '8rem' }}
        className="relative z-20 flex flex-col items-center text-center px-5 md:px-8"
      >
        {/* Main headline */}
        <motion.h1
          variants={stagger(0.75, 0.12)}
          initial="hidden"
          animate="visible"
          className="text-[clamp(2.16rem,7.2vw,5.4rem)] font-black leading-none tracking-tight mb-4"
          style={{ color: '#F2EDE6' }}
        >
          <HeadlineWord delay={0}>ליגת</HeadlineWord>
          {' '}
          <HeadlineWord delay={0.12}>
            <img
              src="/athena-logo.png"
              alt="אתנה"
              style={{
                height: 'clamp(2.16rem, 6.48vw, 5.04rem)',
                width: 'clamp(5.76rem, 12.96vw, 10.08rem)',
                display: 'inline-block',
                verticalAlign: 'bottom',
                objectFit: 'contain',
                objectPosition: 'bottom',
                transform: 'translateY(-8%)',
              }}
            />
          </HeadlineWord>
          {' '}
          <HeadlineWord delay={0.24}>
            <img
              src="/winner-logo.png"
              alt="וינר"
              style={{
                height: 'clamp(2.16rem, 6.48vw, 5.04rem)',
                width: 'clamp(5.76rem, 12.96vw, 10.08rem)',
                display: 'inline-block',
                verticalAlign: 'middle',
                objectFit: 'contain',
              }}
            />
          </HeadlineWord>
          <br />
          <HeadlineWord delay={0.36}>בכדורסל לנשים</HeadlineWord>
        </motion.h1>


      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(242,237,230,0.3)' }}>גלול</span>
        <motion.div
          className="w-px h-10"
          style={{ background: 'linear-gradient(to bottom, rgba(255,77,0,0.7), transparent)' }}
          animate={{ scaleY: [0, 1, 0], originY: 0 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
};
