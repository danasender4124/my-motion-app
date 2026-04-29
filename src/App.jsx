// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import Header          from '@/components/ui/Header'
import { HeroSection } from '@/components/ui/hero-odyssey'
import HomeNewsFeed    from '@/components/ui/HomeNewsFeed'
import Results         from '@/components/ui/Results'
import Standings       from '@/components/ui/Standings'
import Stats           from '@/components/ui/Stats'
import News            from '@/components/ui/News'
import Footer          from '@/components/ui/Footer'
import PageBanner      from '@/components/ui/PageBanner'

const AnimatedRoutes = () => {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<><HeroSection /><HomeNewsFeed /></>} />
          <Route path="/results"   element={<><PageBanner title="משחקים ותוצאות" /><Results /></>} />
          <Route path="/standings" element={<><PageBanner title="טבלת הליגה" /><Standings /></>} />
          <Route path="/stats"     element={<><PageBanner title="סטטיסטיקה" /><Stats /></>} />
          <Route path="/news"      element={<><PageBanner title="חדשות וכתבות" /><News /></>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#07080C', minHeight: '100svh' }}>
        <Header />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
