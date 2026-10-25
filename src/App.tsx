import { Header } from './components/Header'
import { useReveal } from './lib/useReveal'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Work } from './sections/Work'
import { Projects } from './sections/Projects'
import { Stack } from './sections/Stack'
import { Contact } from './sections/Contact'

export default function App() {
  useReveal()

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Projects />
        <Stack />
        <Contact />
      </main>
    </>
  )
}
