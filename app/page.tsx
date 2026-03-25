export const dynamic = 'force-static'

import Link from 'next/link'
import {
  Flame, Shield, Zap, Code2, Star, CheckCircle2,
  ArrowRight, Wand2, Bug, Lock, TrendingUp,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">RoastMyCode</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#pricing" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              href="/login"
              className="rounded-lg gradient-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
          <Flame className="h-4 w-4 text-brand-500" />
          AI-Powered Code Review — No Sugar-Coating
        </div>
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
          Get Your Code{' '}
          <span className="text-gradient-fire">Roasted 🔥</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste your code. Get brutally honest, senior-engineer-level feedback in seconds.
          Security audits, performance analysis, refactored output, and more.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl gradient-fire px-8 py-4 text-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
          >
            <Flame className="h-5 w-5" />
            Roast My Code Free
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border px-8 py-4 text-lg font-semibold hover:bg-accent transition-colors"
          >
            See How It Works
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Free forever · No credit card required · 3 reviews/month free</p>
      </section>

      {/* Social proof */}
      <section className="border-y bg-muted/30 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              ['10,000+', 'Code reviews'],
              ['50+', 'Languages supported'],
              ['4.9/5', 'Average rating'],
              ['<3s', 'Average review time'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-3xl font-black text-gradient-brand">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24 space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black">Everything a Senior Engineer Would Catch</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Not just linting. Deep semantic analysis across 4 dimensions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Bug,
              color: 'text-red-500',
              bg: 'bg-red-50 dark:bg-red-950/30',
              title: 'Bug Detection',
              desc: 'Logic errors, null pointers, off-by-ones, race conditions, and more — caught before they hit production.',
            },
            {
              icon: Shield,
              color: 'text-orange-500',
              bg: 'bg-orange-50 dark:bg-orange-950/30',
              title: 'Security Audit',
              desc: 'SQL injection, XSS, insecure deserialization, hardcoded secrets — with CWE IDs and exact remediations.',
            },
            {
              icon: Zap,
              color: 'text-yellow-500',
              bg: 'bg-yellow-50 dark:bg-yellow-950/30',
              title: 'Performance',
              desc: 'N+1 queries, inefficient algorithms, memory leaks, unnecessary re-renders — all flagged with impact levels.',
            },
            {
              icon: Wand2,
              color: 'text-purple-500',
              bg: 'bg-purple-50 dark:bg-purple-950/30',
              title: 'Refactored Code',
              desc: 'Get a complete, production-ready refactored version with every fix applied — ready to copy-paste.',
            },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6 space-y-3">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-muted/30 border-y py-24">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-black">Works in 3 Steps</h2>
            <p className="text-muted-foreground">From paste to production-quality feedback in seconds</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Code2,
                title: 'Paste Your Code',
                desc: 'Supports 14+ languages. No sign-in required for your first review.',
              },
              {
                step: '02',
                icon: Flame,
                title: 'AI Roasts It',
                desc: 'GPT-4o or Claude 3.5 Sonnet tears your code apart — in the best way possible.',
              },
              {
                step: '03',
                icon: CheckCircle2,
                title: 'Ship Better Code',
                desc: 'Get refactored output, fix every issue, and never repeat the same mistakes.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-black">
                      {step.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-black">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground">Start free. Upgrade when you need more roasting power.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: 'Free',
              price: '0',
              reviews: '3',
              features: ['3 reviews / month', '150 lines of code', 'GPT-4o Mini', 'Basic issue detection', '7-day history'],
              cta: 'Get Started Free',
              popular: false,
            },
            {
              name: 'Pro',
              price: '15',
              reviews: '100',
              features: ['100 reviews / month', '1,000 lines of code', 'GPT-4o + Claude 3.5', 'Security CWE audit', 'Refactored code output', 'Unlimited history'],
              cta: 'Start Pro — $15/mo',
              popular: true,
            },
            {
              name: 'Team',
              price: '49',
              reviews: '∞',
              features: ['Unlimited reviews', '5,000 lines of code', 'All models incl. Claude Opus', 'Team analytics', 'API access', 'Priority support'],
              cta: 'Start Team — $49/mo',
              popular: false,
            },
          ].map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-xl border bg-card p-6 space-y-5 ${plan.popular ? 'border-brand-400 ring-2 ring-brand-400 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full gradient-brand px-4 py-1 text-xs font-bold text-white whitespace-nowrap">
                    🔥 Most Popular
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  {Number(plan.price) > 0 && <span className="text-muted-foreground mb-1">/mo</span>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.reviews} reviews / month</p>
              </div>
              <ul className="space-y-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                  plan.popular
                    ? 'gradient-brand text-white hover:opacity-90'
                    : 'border border-input hover:bg-accent'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 border-y py-24">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-black">Developers Love the Roast</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah K.',
                role: 'Senior Engineer',
                avatar: 'SK',
                text: 'Found a SQL injection vulnerability in 30-year-old legacy code on my first use. This thing is brutal and I love it.',
              },
              {
                name: 'Marcus L.',
                role: 'Indie Hacker',
                avatar: 'ML',
                text: 'Shaved 2 hours off my code review process every sprint. The refactored output alone is worth the $15/month.',
              },
              {
                name: 'Priya R.',
                role: 'Bootcamp Graduate',
                avatar: 'PR',
                text: 'As a junior dev, this is like having a senior mentor 24/7. The feedback is specific, not vague nonsense.',
              },
            ].map(({ name, role, avatar, text }) => (
              <div key={name} className="rounded-xl border bg-card p-6 space-y-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">{text}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center space-y-6">
        <h2 className="text-5xl font-black">
          Ready to Get <span className="text-gradient-fire">Roasted?</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto">
          Join thousands of developers shipping better code. Start free, no credit card required.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl gradient-fire px-10 py-5 text-xl font-bold text-white shadow-xl hover:opacity-90 transition-opacity"
        >
          <Flame className="h-6 w-6" />
          Get My Code Roasted 🔥
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-brand">
              <Flame className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold">RoastMyCode</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <a href="mailto:hello@roastmycode.dev" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Aurora Rayes LLC</p>
        </div>
      </footer>
    </div>
  )
}