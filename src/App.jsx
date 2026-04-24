import './index.css'
import ScoreTicker  from '@/components/ui/ScoreTicker'
import Header       from '@/components/ui/Header'
import { HeroSection } from '@/components/ui/hero-odyssey'
import Results      from '@/components/ui/Results'
import Standings    from '@/components/ui/Standings'
import News         from '@/components/ui/News'
import Stats        from '@/components/ui/Stats'
import Footer       from '@/components/ui/Footer'

const Divider = () => (
  <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: 0 }} />
);

function App() {
  return (
    <div style={{ background: '#07080C', minHeight: '100svh' }}>
      <ScoreTicker />
      <Header />
      <main>
        <HeroSection />
        <Divider />
        <Results />
        <Divider />
        <Standings />
        <Divider />
        <Stats />
        <Divider />
        <News />
      </main>
      <Footer />
    </div>
  )
}

export default App
