"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, ArrowRight, Zap, Sparkles } from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free Pilot",
      desc: "Perfect for testing the dashboard locally.",
      price: {
        monthly: "₹0",
        yearly: "₹0"
      },
      period: "forever",
      features: [
        "Local browser storage (No cloud database required)",
        "AI daily schedule (Up to 5 tasks/day)",
        "Manual expense logging & local categories",
        "1 Active study course tracking",
        "Standard decision tree recommendations",
        "Light & Dark mode support"
      ],
      cta: "Start Free",
      href: "/register",
      popular: false
    },
    {
      name: "Pro Co-Pilot",
      desc: "Unlocks fully cloud-synced productivity.",
      price: {
        monthly: "₹249",
        yearly: "₹1,990" // ~20% off
      },
      period: billingCycle === "monthly" ? "mo" : "yr",
      features: [
        "Everything in Free Pilot",
        "Secure cloud sync & database backups (PostgreSQL)",
        "Unlimited tasks daily prioritization",
        "Natural language expense parsing (paste logs/UPI texts)",
        "Unlimited study tracks & Spaced repetition revisions",
        "Dynamic OpenAI integrations (Custom system prompts)",
        "Contextual Indian lifestyle audits",
        "Priority AI processing queues"
      ],
      cta: "Go Pro Co-Pilot",
      href: "/register",
      popular: true
    },
    {
      name: "Life Captain",
      desc: "For advanced power builders and teams.",
      price: {
        monthly: "₹799",
        yearly: "₹6,390"
      },
      period: billingCycle === "monthly" ? "mo" : "yr",
      features: [
        "Everything in Pro Co-Pilot",
        "Collaborative shared calendars & schedules",
        "Exportable PDF financial audit reports",
        "Custom API access endpoints",
        "1-on-1 monthly productivity review calls",
        "Beta access to experimental AI pilots",
        "Dedicated support desk"
      ],
      cta: "Become Captain",
      href: "/register",
      popular: false
    }
  ];

  return (
    <div className="min-h-full flex flex-col grid-bg">
      <Navbar />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
          <Zap size={12} />
          <span>Flexible SaaS pricing plans</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Slick Plans for Any <span className="text-primary">Workflow</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
          Start with local client mode. Upgrade when you need persistent cloud access and deep OpenAI semantic auditing.
        </p>

        {/* Toggle billing cycle */}
        <div className="flex items-center justify-center pt-8">
          <div className="bg-secondary p-1 rounded-xl border border-border flex space-x-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                billingCycle === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly billing <span className="text-primary font-bold text-[10px] ml-1">Save 20%</span>
            </button>
          </div>
        </div>
      </header>

      {/* Pricing Cards Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl border bg-card p-8 flex flex-col justify-between ${
                plan.popular 
                  ? "border-primary shadow-xl shadow-primary/5 md:-translate-y-2" 
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground tracking-wide flex items-center gap-1">
                  <Sparkles size={10} />
                  <span>MOST POPULAR</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 min-h-[32px]">{plan.desc}</p>
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                    {billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    /{plan.period}
                  </span>
                </div>

                <hr className="border-border/60" />

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-foreground text-left">
                      <Check className="text-primary w-4 h-4 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  href={plan.href}
                  className={`w-full py-3.5 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Trust elements */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center text-xs text-muted-foreground space-y-2">
        <p>Prices shown in Indian Rupees (INR) and inclusive of GST where applicable.</p>
        <p>You can transition back to local storage browser mode at any time without losing historical data files.</p>
      </section>

      <Footer />
    </div>
  );
}
