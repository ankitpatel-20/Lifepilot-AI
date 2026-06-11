"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  ArrowRight, 
  Calendar, 
  TrendingDown, 
  BookOpen, 
  BrainCircuit, 
  Shield, 
  Zap, 
  Users, 
  Plus, 
  Minus,
  Sparkles
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { value: "4.8/5", label: "App Store Rating", icon: Sparkles },
    { value: "22%", label: "Average Monthly Savings", icon: TrendingDown },
    { value: "14 hrs", label: "Weekly Study Time Restructured", icon: Calendar },
    { value: "94%", label: "Decision Confidence Score", icon: BrainCircuit }
  ];

  const features = [
    {
      title: "AI Daily Planner",
      desc: "Optimized daily schedules, focus routines, and auto-spaced breaks. Adapts around commuting times.",
      icon: Calendar,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      title: "Smart Expense Insights",
      desc: "Categorize expenditures instantly. Spot wasteful online markups and discover local savings alternatives.",
      icon: TrendingDown,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "AI Study Coach",
      desc: "Spaced repetition trackers and custom subject roadmap builders. Master competitive exams systematically.",
      icon: BookOpen,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "Daily Decision Engine",
      desc: "Practical verdict models for transit choices, credit purchases, and habit swaps in the Indian context.",
      icon: BrainCircuit,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20"
    }
  ];

  const testimonials = [
    {
      quote: "Using LifePilot's planner helped me fit UPSC prep alongside my IT job. The spaced repetition tool is outstanding.",
      author: "Priya Sharma",
      role: "System Engineer & UPSC Aspirant",
      location: "Bengaluru"
    },
    {
      quote: "The expense auditor categorized my Zomato orders and showed me I was losing ₹4,000/month just on delivery markups!",
      author: "Rohan Verma",
      role: "Product Designer",
      location: "Mumbai"
    },
    {
      quote: "Asking the Decision Engine 'Auto vs Metro' resolved my fatigue. The breakdown of costs and commute times was spot on.",
      author: "Aditya Sen",
      role: "Marketing Specialist",
      location: "Delhi NCR"
    }
  ];

  const faqs = [
    {
      q: "What is LifePilot AI?",
      a: "LifePilot AI is an all-in-one personal cockpit designed to help you optimize productivity, track money, structure study tracks, and evaluate daily choices using context-aware AI."
    },
    {
      q: "Does it support Indian payment apps and transit?",
      a: "Yes! The expense parser is specifically optimized to categorize UPI logs, Zomato, Swiggy, Ola, Uber, and local Namma Metro/Auto transactions."
    },
    {
      q: "Can I use it for free?",
      a: "Absolutely! The free tier includes full client-side storage mode. Pro features include cloud syncing, database backups, and direct OpenAI API keys setup."
    },
    {
      q: "Where is my data stored?",
      a: "By default, when server connection is offline, all data resides locally in your browser's localStorage. When connected to our backend, it is secured in a PostgreSQL database."
    }
  ];

  return (
    <div className="min-h-full flex flex-col grid-bg">
      <Navbar />

      {/* Hero Section */}
      <header className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center space-y-8 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
          <Sparkles size={12} />
          <span>The Everyday AI Innovator: Life, Made Better</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Navigate your day with <br />
          <span className="bg-gradient-to-r from-violet-400 via-primary to-fuchsia-400 bg-clip-text text-transparent">
            AI-powered precision
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          LifePilot AI integrates daily scheduling, financial auditing, competitive exam coaching, and lifestyle decision trees into a unified Notion-style cockpit.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 hover:scale-[1.02]"
          >
            <span>Start Planning Free</span>
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/features"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-foreground bg-secondary border border-border rounded-xl hover:bg-secondary/80 transition-all flex items-center justify-center"
          >
            Explore Features
          </Link>
        </div>

        {/* Dashboard Mockup Preview */}
        <div className="pt-12 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 shadow-2xl backdrop-blur-sm relative">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="text-xs text-muted-foreground font-mono">dashboard.lifepilot.ai</div>
              <div className="w-12" />
            </div>

            {/* Content Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="md:col-span-2 space-y-4">
                <div className="rounded-xl border border-border/40 bg-background/40 p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> Today's Optimized Roadmap
                    </h3>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">AI Scheduled</span>
                  </div>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-3 border-l-2 border-primary pl-3 py-1 bg-primary/5">
                      <span className="text-primary font-bold">09:30 AM</span>
                      <span className="text-foreground">Draft architecture contracts (High Focus block)</span>
                    </div>
                    <div className="flex items-center gap-3 border-l-2 border-muted pl-3 py-1">
                      <span className="text-muted-foreground">11:00 AM</span>
                      <span className="text-muted-foreground">Short Chai Break ☕</span>
                    </div>
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500 pl-3 py-1 bg-emerald-500/5">
                      <span className="text-emerald-400 font-bold">11:15 AM</span>
                      <span className="text-foreground">Refactor API database schema</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-border/40 bg-background/40 p-5 space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-500" /> Expense Leakage
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Swiggy delivery</span>
                      <span className="text-rupee-saffron font-bold">₹480.00</span>
                    </div>
                    <div className="bg-rupee-saffron/10 border border-rupee-saffron/20 rounded-lg p-2.5 text-[11px] text-rupee-saffron leading-relaxed font-mono">
                      🚫 Food delivery markups are high. Local tiffin saves up to ₹250.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section className="bg-secondary/40 py-20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Modern life is cluttered. AI can declutter it.
            </h2>
            <p className="text-muted-foreground">
              Between tracking daily targets, navigating gridlock commutes, scanning UPI transactions, and studying for certifications, you're constantly swapping apps. LifePilot brings context-aware focus to your daily workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 text-left">
            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <Zap className="text-indigo-400 w-6 h-6" />
              <h3 className="text-lg font-semibold">Decision Paralysis</h3>
              <p className="text-sm text-muted-foreground">
                Spending hours debating transport options, subscriptions, or budgets. The Decision Engine provides immediate verdict blueprints.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <TrendingDown className="text-emerald-400 w-6 h-6" />
              <h3 className="text-lg font-semibold">silently Bleeding Cash</h3>
              <p className="text-sm text-muted-foreground">
                Small UPI bills and delivery subscriptions stack up. The insights feed monitors leakages and recommends local alternatives.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card space-y-3">
              <BookOpen className="text-amber-400 w-6 h-6" />
              <h3 className="text-lg font-semibold">Fragmented Learning</h3>
              <p className="text-sm text-muted-foreground">
                No follow-through on study tracks. Spaced repetition automatically schedules revision intervals when you check off topics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight">The Core AI Toolkit</h2>
          <p className="text-muted-foreground">
            A premium full-stack platform built with custom prompts matching the Indian cost-of-living index and lifestyle routines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-border/80 bg-card/40 text-left space-y-4 hover:border-primary/45 transition-colors">
              <div className={`p-3 rounded-lg border w-fit ${f.color}`}>
                <f.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-secondary/20 border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => (
              <div key={idx} className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-2 rounded-lg bg-primary/5 text-primary mb-2">
                  <s.icon size={18} />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground font-mono">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Trusted by Builders & Learners</h2>
          <p className="text-muted-foreground">See how professional innovators and students utilize LifePilot AI every day.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-6 rounded-xl border border-border bg-card/60 text-left flex flex-col justify-between">
              <p className="text-muted-foreground italic text-sm leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 border-t border-border/40 pt-4">
                <div className="font-semibold text-sm text-foreground">{t.author}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.role}</div>
                <div className="text-xs text-primary/70 font-mono mt-1">{t.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Got questions about LifePilot? We've got answers.</p>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-border/60 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left py-3 text-base font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <Minus size={16} /> : <Plus size={16} />}
              </button>
              {openFaq === idx && (
                <div className="text-sm text-muted-foreground mt-2 pl-1 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative bg-primary/5 border-t border-border py-20 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-3xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Take Control of Your Day?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Sign up now and join thousands of active users who optimize schedules, trace leakages, and make smarter daily decisions.
          </p>
          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 px-8 py-3.5 text-base font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
            >
              <span>Get Started for Free</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
