"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Calendar, 
  TrendingDown, 
  BookOpen, 
  BrainCircuit, 
  CheckCircle, 
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Coffee,
  Coins
} from "lucide-react";

export default function FeaturesPage() {
  const sections = [
    {
      id: "planner",
      title: "AI Daily Planner",
      badge: "Focus Optimization",
      icon: Calendar,
      tagline: "Your daily schedule, mathematically prioritized.",
      desc: "Stop manually arranging calendars. The Daily Planner evaluates tasks by urgency and effort, distributing them into realistic hour blocks. It accounts for transit times and embeds micro-breaks dynamically.",
      bulletPoints: [
        "Dynamic timeboxing starting at your chosen hour",
        "Calculates work durations and flags overloaded days",
        "Auto-injects wellness blocks (lunch breaks, evening stretches, chai times)",
        "Calculates daily focus scores based on completed milestones"
      ],
      color: "from-indigo-500/20 to-purple-500/10",
      iconColor: "text-indigo-400"
    },
    {
      id: "expenses",
      title: "Smart Expense Insights",
      badge: "Financial Auditor",
      icon: TrendingDown,
      tagline: "Track leakages from simple UPI logs.",
      desc: "Paste raw logs or type quick entries like '₹250 spent on Swiggy dinner'. The AI agent parses values, classifies categories, audits wastefulness, and recommends budget-friendly local swaps.",
      bulletPoints: [
        "Natural language text parsing (rupees, dates, descriptions)",
        "UPI & online markups auditor (identifies Swiggy, Zomato, Uber premiums)",
        "Specific local advice (e.g. Metro pass savings, cooking vs ordering)",
        "Live budget gauges to track month-to-date allocations"
      ],
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-400"
    },
    {
      id: "study",
      title: "AI Study Coach",
      badge: "Spaced Repetition",
      icon: BookOpen,
      tagline: "Learn systematically. Retain forever.",
      desc: "Designed for students and working professionals. Create custom study roadmaps, log chapters completed, and let the coach automatically calculate spaced review intervals to seal topics in long-term memory.",
      bulletPoints: [
        "Subject tracker with progressive percentage completion bars",
        "Calculates 1-day, 3-day, and 7-day spaced review deadlines",
        "Tracks focus study hours and builds consistent routines",
        "Great for UPSC, JEE, CAT, GATE, and tech certifications"
      ],
      color: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-400"
    },
    {
      id: "decision",
      title: "Daily Decision Engine",
      badge: "Verdict Machine",
      icon: BrainCircuit,
      tagline: "Clear verdicts for everyday forks-in-the-road.",
      desc: "Is it worth buying that gadget on EMI? Should you commute via cab or metro today? Enter your scenario, and get an immediate pros/cons breakdown, emergency warnings, and a definitive recommendation.",
      bulletPoints: [
        "Structured pros, cons, and bottom-line verdict output",
        "Calibrated against your monthly budget and location metrics",
        "Bypasses impulse purchases using analytical reflection logic",
        "Quick prompt templates for transportation, finance, and career paths"
      ],
      color: "from-violet-500/20 to-fuchsia-500/10",
      iconColor: "text-violet-400"
    }
  ];

  return (
    <div className="min-h-full flex flex-col grid-bg">
      <Navbar />

      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          How LifePilot <span className="text-primary">Optimizes</span> Your Life
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore the engine specifications. From semantic parsing to logical scheduling, discover what makes LifePilot the ultimate everyday planner.
        </p>
      </header>

      {/* Detailed Features List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        {sections.map((section, idx) => (
          <div 
            key={section.id} 
            className={`flex flex-col lg:flex-row items-center gap-12 py-12 border-b border-border/40 last:border-none ${
              idx % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Text description */}
            <div className="flex-1 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-border bg-secondary text-xs font-semibold">
                <Sparkles size={12} className={section.iconColor} />
                <span>{section.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {section.title}
              </h2>
              <p className="text-sm font-mono text-primary/80 uppercase tracking-wider">{section.tagline}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{section.desc}</p>
              
              <ul className="space-y-3 pt-2">
                {section.bulletPoints.map((bp, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle className="text-primary w-4 h-4 mt-0.5 shrink-0" />
                    <span>{bp}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  <span>Get Started with {section.title}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Visual Panel Card */}
            <div className="flex-1 w-full max-w-lg">
              <div className={`p-6 rounded-2xl bg-gradient-to-br ${section.color} border border-border shadow-xl space-y-4 relative overflow-hidden group`}>
                <div className="absolute top-2 right-2 p-3 rounded-xl bg-background/60 border border-border text-muted-foreground">
                  <section.icon className={`w-8 h-8 ${section.iconColor}`} />
                </div>
                
                {/* Simulated Widget UI */}
                {section.id === "planner" && (
                  <div className="rounded-xl bg-background/90 p-4 border border-border space-y-3 font-mono text-[11px] text-left">
                    <div className="text-xs font-bold text-foreground border-b border-border/60 pb-2">AI Generated Timeline</div>
                    <div className="space-y-2">
                      <div className="p-2 rounded bg-indigo-500/5 border-l-2 border-indigo-500 flex justify-between">
                        <div>
                          <p className="text-foreground font-semibold">High Focus Code Review</p>
                          <span className="text-muted-foreground text-[10px]">9:00 AM - 10:30 AM (90m)</span>
                        </div>
                        <span className="text-indigo-400 font-bold">Urgent</span>
                      </div>
                      <div className="p-2 rounded bg-secondary/40 border-l-2 border-muted flex justify-between">
                        <div>
                          <p className="text-muted-foreground">Chai & Stretch Break</p>
                          <span className="text-muted-foreground text-[10px]">10:30 AM - 10:45 AM (15m)</span>
                        </div>
                        <Coffee size={14} className="text-muted-foreground" />
                      </div>
                      <div className="p-2 rounded bg-emerald-500/5 border-l-2 border-emerald-500 flex justify-between">
                        <div>
                          <p className="text-foreground font-semibold">Verify PostgreSQL Migrations</p>
                          <span className="text-muted-foreground text-[10px]">10:45 AM - 11:45 AM (60m)</span>
                        </div>
                        <span className="text-emerald-400">Medium</span>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === "expenses" && (
                  <div className="rounded-xl bg-background/90 p-4 border border-border space-y-3 text-[11px] text-left font-mono">
                    <div className="text-xs font-bold text-foreground border-b border-border/60 pb-2 flex justify-between">
                      <span>UPI Parser Input</span>
                      <span className="text-rupee-saffron text-[10px] uppercase font-bold">Wasteful Flagged</span>
                    </div>
                    <div className="p-2 rounded bg-secondary/50 text-muted-foreground mb-2">
                      "Paid Rs. 480 to Swiggy dinner on Zomato delivery"
                    </div>
                    <div className="p-3 rounded-lg border border-rupee-saffron/20 bg-rupee-saffron/5 text-rupee-saffron leading-relaxed">
                      💡 **AI Financial Tip:** This transaction carries a delivery markup of ~₹220. Swapping to local tiffin services or cooking saves over ₹4,000 monthly.
                    </div>
                  </div>
                )}

                {section.id === "study" && (
                  <div className="rounded-xl bg-background/90 p-4 border border-border space-y-3 text-[11px] text-left">
                    <div className="text-xs font-bold text-foreground border-b border-border/60 pb-2 font-mono flex justify-between">
                      <span>Active Syllabus Tracker</span>
                      <span className="text-primary font-bold">40% done</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1 font-mono">
                          <span>UPSC Polity Syllabus</span>
                          <span className="font-semibold">2 of 5 completed</span>
                        </div>
                        <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: "40%" }} />
                        </div>
                      </div>
                      <div className="border border-border/60 rounded p-2 bg-secondary/20 font-mono text-[10px] space-y-1">
                        <p className="font-bold text-foreground flex items-center gap-1">
                          <Clock size={10} className="text-amber-400" /> Auto Revision Scheduled:
                        </p>
                        <p className="text-muted-foreground">Topic: Indian Constitutional Amendments</p>
                        <p className="text-primary">Next Review Date: June 11 (in 3 days)</p>
                      </div>
                    </div>
                  </div>
                )}

                {section.id === "decision" && (
                  <div className="rounded-xl bg-background/90 p-4 border border-border space-y-3 text-[11px] text-left">
                    <div className="text-xs font-bold text-foreground border-b border-border/60 pb-2 font-mono">
                      Query: "Should I buy iPhone on EMI?"
                    </div>
                    <div className="space-y-1 font-mono text-[10px] leading-relaxed">
                      <p className="text-rupee-saffron font-bold">Verdict: Avoid EMI.</p>
                      <p className="text-muted-foreground mt-1">**Rationale:** Credit purchasing of consumer durables traps future liquidity. With a ₹35k budget, a ₹5k monthly EMI locks 14% of your income.</p>
                      <p className="text-emerald-400 font-semibold mt-1">**Action:** Invest ₹3k monthly in Index fund SIP. Buy in cash in 12 months.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Try It CTA */}
      <section className="bg-secondary/40 border-t border-border py-16 text-center space-y-6">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to automate your lifestyle?</h2>
          <p className="text-sm text-muted-foreground">
            Spin up the free client dashboard. No database or API key required to start tracking.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
            >
              <span>Create Free Account</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
