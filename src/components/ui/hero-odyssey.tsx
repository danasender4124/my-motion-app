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

      {/* ── Feature items (floating) ── */}
      <motion.div
        variants={stagger(1.4, 0.15)}
        initial="hidden"
        animate="visible"
        className="absolute inset-x-0 z-20 pointer-events-none hidden md:block"
        style={{ top: '38%' }}
      >
        <FeatureItem name="12 קבוצות" value="בליגת העל" side="right" top="" />
        <FeatureItem name="עונת 2024/25" value="מחזור 18" side="right" top="top-12" />
        <FeatureItem name="אלופת ישראל" value="מ. רמת גן" side="left" top="" />
        <FeatureItem name="הגמר · מאי 2025" value="הצטרפי לחגיגה" side="left" top="top-12" />
      </motion.div>

      {/* ── Hero content ── */}
      <motion.div
        style={{ y: textY }}
        className="relative z-20 flex flex-col items-center text-center px-5 md:px-8 pt-20 md:pt-28 pb-32"
      >
        {/* Live ticker */}
        <motion.div
          variants={fadeIn(0.5)}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <MatchTicker />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          variants={fadeUp(0.65)}
          initial="hidden"
          animate="visible"
          className="text-xs font-semibold tracking-[0.25em] uppercase mb-4"
          style={{ color: '#FF4D00' }}
        >
          ליגת הנשים המקצועית · ישראל
        </motion.p>

        {/* Main headline */}
        <motion.h1
          variants={stagger(0.75, 0.12)}
          initial="hidden"
          animate="visible"
          className="text-[clamp(3rem,10vw,7.5rem)] font-black leading-none tracking-tight mb-4"
          style={{ color: '#F2EDE6' }}
        >
          <HeadlineWord delay={0}>ליגת</HeadlineWord>
          {' '}
          <HeadlineWord delay={0.12}>
            <span style={{
              background: 'linear-gradient(to left, #87CEEB 0%, #87CEEB 38%, #8A4F9E 40%, #8A4F9E 43%, #CC2200 45%, #CC2200 57%, #E84B1F 59%, #E84B1F 62%, #F5A623 64%, #F5A623 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>אתנה</span>
          </HeadlineWord>
          {' '}
          <HeadlineWord delay={0.24}>
            <img
              src="/winner-logo.png"
              alt="וינר"
              style={{
                height: 'clamp(2.5rem, 8vw, 6rem)',
                width: 'auto',
                display: 'inline-block',
                verticalAlign: 'middle',
                objectFit: 'contain',
              }}
            />
          </HeadlineWord>
          <br />
          <HeadlineWord delay={0.36}>בכדורסל לנשים</HeadlineWord>
        </motion.h1>

        {/* Subheadline */}
        <motion.h2
          variants={fadeUp(1.0)}
          initial="hidden"
          animate="visible"
          className="text-[clamp(1.1rem,3vw,1.6rem)] font-light mb-6 max-w-xl"
          style={{ color: 'rgba(242,237,230,0.6)', letterSpacing: '-0.01em' }}
        >
          התרגשות, כישרון, ואהבה לכדורסל.
          <br />
          עקבי אחרי כל מחזור בליגה.
        </motion.h2>

        {/* CTAs */}
        <motion.div
          variants={fadeUp(1.15)}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-3 justify-center mb-16"
        >
          <motion.a
            href="#"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm"
            style={{ background: '#FF4D00', color: '#07080C' }}
            whileHover={{ scale: 1.04, backgroundColor: '#FF6A30' } as any}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            לוח המשחקים
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 13L3 8L8 3M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.a>
          <motion.a
            href="#"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm"
            style={{
              background: 'rgba(242,237,230,0.07)',
              color: '#F2EDE6',
              border: '1px solid rgba(242,237,230,0.12)',
              backdropFilter: 'blur(8px)',
            }}
            whileHover={{ backgroundColor: 'rgba(242,237,230,0.12)' } as any}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            הקבוצות
          </motion.a>
        </motion.div>

        {/* Season stats bar */}
        <motion.div
          variants={fadeUp(1.3)}
          initial="hidden"
          animate="visible"
          className="flex items-stretch rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(242,237,230,0.04)',
            border: '1px solid rgba(242,237,230,0.08)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <StatPill value="18" label="מחזורים" />
          <StatPill value="72" label="משחקים" />
          <StatPill value="12" label="קבוצות" />
          <StatPill value="4" label="לגמר" />
        </motion.div>
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
