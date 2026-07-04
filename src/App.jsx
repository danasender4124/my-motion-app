// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import './index.css'
import Header          from '@/components/ui/Header'
import { HeroSection } from '@/components/ui/hero-odyssey'
import Results         from '@/components/ui/Results'
import Standings       from '@/components/ui/Standings'
import Stats           from '@/components/ui/Stats'
import News            from '@/components/ui/News'
import Footer          from '@/components/ui/Footer'
import PageBanner      from '@/components/ui/PageBanner'
import MatchPage       from './pages/MatchPage'
import PlayerPage from './pages/PlayerPage'
import TeamPage from './pages/TeamPage'
import VodPage from './pages/VodPage'
import PostDetailPage from './pages/PostDetailPage'
import AccessibilityStatementPage from './pages/AccessibilityStatementPage'
import AccessibilityWidget from '@/components/a11y/AccessibilityWidget'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

const AnimatedRoutes = () => {
  const location = useLocation()
  const { t } = useTranslation()
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
          <Route path="/" element={<HeroSection />} />
          <Route path="/results"   element={<><PageBanner title={t('results.title')} /><Results /></>} />
          <Route path="/standings" element={<><PageBanner title={t('standings.title')} /><Standings /></>} />
          <Route path="/stats"     element={<><PageBanner title={t('stats.title')} /><Stats /></>} />
          <Route path="/news"      element={<><PageBanner title={t('news.title')} /><News /></>} />
          <Route path="/news/:id" element={<PostDetailPage />} />
          <Route path="/match/:id" element={<MatchPage />} />
          <Route path="/player/:id" element={<PlayerPage />} />
          <Route path="/team/:id" element={<TeamPage />} />
          <Route path="/vod" element={<VodPage />} />
          <Route path="/accessibility" element={<AccessibilityStatementPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ background: '#07080C', minHeight: '100svh' }}>
          <a href="#main-content" className="skip-to-content">דלג לתוכן הראשי</a>
          <Header />
          <main id="main-content">
            <AnimatedRoutes />
          </main>
          <Footer />
          <AccessibilityWidget />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
