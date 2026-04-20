import './index.css'
import ScoreTicker  from '@/components/ui/ScoreTicker'
import Header       from '@/components/ui/Header'
import { HeroSection } from '@/components/ui/hero-odyssey'
import Results      from '@/components/ui/Results'
import Standings    from '@/components/ui/Standings'
import News         from '@/components/ui/News'
import Stats        from '@/components/ui/Stats'
import Footer       from '@/components/ui/Footer'

function App() {
  return (
    <div style={{ background: '#07080C', minHeight: '100svh' }}>
      <ScoreTicker />
      <Header />
      <main>
        <HeroSection />
        <Results />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-0 max-w-7xl mx-auto">
          <div className="xl:col-span-2">
            <Standings />
          </div>
          <div className="xl:col-span-1">
            <Stats />
          </div>
        </div>
        <News />
      </main>
      <Footer />
    </div>
  )
}

export default App
