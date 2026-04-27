import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import ScoreTicker  from '@/components/ui/ScoreTicker'
import Header       from '@/components/ui/Header'
import { HeroSection } from '@/components/ui/hero-odyssey'
import Results      from '@/components/ui/Results'
import Standings    from '@/components/ui/Standings'
import News         from '@/components/ui/News'
import Stats        from '@/components/ui/Stats'
import Footer       from '@/components/ui/Footer'

const TABS = [
  { id: 'results',   label: 'תוצאות' },
  { id: 'standings', label: 'טבלה' },
  { id: 'stats',     label: 'סטטיסטיקה' },
  { id: 'news',      label: 'חדשות' },
]

const TabNav = ({ active, onChange }) => (
  <div
    className="sticky top-0 z-30 px-4 md:px-8"
    dir="rtl"
    style={{
      background: 'rgba(7,8,12,0.92)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
    }}
  >
    <div className="max-w-7xl mx-auto flex gap-1">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="relative px-5 py-4 text-sm font-bold transition-colors duration-150"
          style={{ color: active === tab.id ? '#FF4D00' : 'rgba(242,237,230,0.45)' }}
        >
          {tab.label}
          {active === tab.id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 right-0 left-0 h-0.5"
              style={{ background: '#FF4D00' }}
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
        </button>
      ))}
    </div>
  </div>
)

function App() {
  const [activeTab, setActiveTab] = useState('results')

  return (
    <div style={{ background: '#07080C', minHeight: '100svh' }}>
      <ScoreTicker />
      <Header />
      <main>
        <HeroSection />
        <TabNav active={activeTab} onChange={setActiveTab} />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          >
            {activeTab === 'results'   && <Results />}
            {activeTab === 'standings' && <Standings />}
            {activeTab === 'stats'     && <Stats />}
            {activeTab === 'news'      && <News />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default App
