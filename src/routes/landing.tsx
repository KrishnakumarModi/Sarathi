import { ArrowRight, BookOpen, Check, Compass, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/components/shared/document-title'
import { ThemeToggle } from '@/components/shared/theme-toggle'

const pillars = [
  {
    icon: Compass,
    title: 'Know what matters next',
    copy: 'Turn a broad career goal into a focused roadmap built around your skills and time.',
  },
  {
    icon: BookOpen,
    title: 'Build evidence as you go',
    copy: 'Keep learning, projects, applications, and interview prep in one calm workspace.',
  },
]

const primaryButtonColor = 'bg-primary hover:bg-primary/90 text-primary-foreground'

export default function LandingPage() {
  useDocumentTitle('Your learning companion')

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Sarathi home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-[0.12em]">SARATHI</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Link to="/login" className="px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Button asChild className={`rounded-full ${primaryButtonColor} px-5 shadow-[0_8px_20px_rgba(109,40,217,0.2)]`}>
            <Link to="/signup">Get started <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 pb-16 pt-8 sm:px-8 md:pb-24 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pt-12">
        <div className="relative z-10 max-w-2xl page-enter">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> A clearer way forward
          </p>
          <h1 className="max-w-xl text-5xl font-bold leading-[1.04] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Your career path, <span className="text-primary">made visible.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Sarathi brings your learning plan, practice, projects, and progress together so every session has a purpose.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg" className={`h-12 rounded-full ${primaryButtonColor} px-7 text-base shadow-[0_12px_24px_rgba(109,40,217,0.2)]`}>
              <Link to="/signup">Start your journey <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <span className="text-sm text-muted-foreground">A thoughtful workspace for ambitious learners.</span>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
            {['Personal roadmap', 'Focused practice', 'Real evidence'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {item}</span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[530px] lg:justify-self-end">
          <div className="absolute -inset-8 rounded-full bg-primary/20 opacity-70 blur-3xl" aria-hidden />
          <img src="/images/sarathi-logo.svg" alt="Sarathi owl learning companion" className="relative w-full drop-shadow-[0_24px_32px_rgba(30,27,75,0.12)]" />
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-2 lg:px-10">
          {pillars.map(({ icon: Icon, title, copy }, index) => (
            <article key={title} className={`flex gap-4 py-8 md:px-8 ${index === 1 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden /></span>
              <div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{copy}</p></div>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <span>Built for the next chapter.</span>
        <span>© {new Date().getFullYear()} Sarathi</span>
      </footer>
    </main>
  )
}