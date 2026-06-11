"use client";

import { useEffect, useState } from "react";
import { 
  BrainCircuit, 
  Send, 
  Sparkles, 
  HelpCircle, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Clock,
  Compass,
  ArrowUpRight,
  ShieldAlert,
  PiggyBank,
  CheckCircle2
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function DecisionEnginePage() {
  const [query, setQuery] = useState("");
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active answer output
  const [activeRecommendation, setActiveRecommendation] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getDecisions();
      setDecisions(res.decisions);
    } catch (err) {
      console.error("Load decisions page error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const handleEvaluate = async (customQuery?: string) => {
    const targetQuery = customQuery || query;
    if (!targetQuery.trim()) return;

    setSubmitting(true);
    setError(null);
    setActiveRecommendation(null);

    try {
      const res = await ApiService.createDecision(targetQuery);
      setActiveRecommendation(res.decision.recommendation);
      setActiveTags(res.decision.context_tags);
      setDecisions([res.decision, ...decisions]);
      if (!customQuery) setQuery("");
    } catch (err: any) {
      setError(err.message || "Failed to process decision request.");
    } finally {
      setSubmitting(false);
    }
  };

  const quickPrompts = [
    { text: "Auto vs Metro to Indiranagar office?", category: "transport" },
    { text: "Should I buy the new iPhone on EMI?", category: "money" },
    { text: "Start ₹2,500 monthly Mutual Fund SIP?", category: "money" },
    { text: "How can I reduce sugared canteen chai?", category: "lifestyle" }
  ];

  // Advanced Parser to map unstructured AI text to structured UI Components
  const parseAIRecommendation = (text: string, tags: string[]) => {
    const lowerText = text.toLowerCase();
    
    // 1. Resolve Confidence Score
    let confidence = 92;
    if (lowerText.includes("metro") || lowerText.includes("transit")) confidence = 96;
    else if (lowerText.includes("emi") || lowerText.includes("iphone")) confidence = 94;
    else if (lowerText.includes("sip") || lowerText.includes("invest")) confidence = 95;
    else if (lowerText.includes("chai") || lowerText.includes("snack")) confidence = 88;

    // 2. Resolve Expected Savings
    let savings = "₹1,200/mo";
    if (lowerText.includes("metro")) savings = "₹4,500/mo";
    else if (lowerText.includes("emi")) savings = "₹5,000/mo";
    else if (lowerText.includes("sip")) savings = "₹3,40,000 (10 yrs)";
    else if (lowerText.includes("chai")) savings = "₹1,800/mo";
    else if (lowerText.includes("travel") || lowerText.includes("event")) savings = "₹5,500/trip";

    // 3. Resolve Risk Level
    let risk: "Low" | "Medium" | "High" = "Low";
    if (lowerText.includes("emi") || lowerText.includes("credit")) risk = "Medium";
    else if (lowerText.includes("shares") || lowerText.includes("stock")) risk = "High";

    // 4. Resolve Alternative Option
    let alternative = "Wait 7 days before deciding.";
    if (lowerText.includes("metro")) alternative = "Book Uber Moto/Rapido for last-mile connections.";
    else if (lowerText.includes("emi")) alternative = "Save ₹5,000 monthly in a recurring deposit first.";
    else if (lowerText.includes("sip")) alternative = "Start with a smaller ₹1,000 index fund deposit.";
    else if (lowerText.includes("chai")) alternative = "Replace afternoon canteen trips with almonds/chana.";
    else if (lowerText.includes("travel") || lowerText.includes("event")) alternative = "Use IRCTC Train bookings 3 weeks in advance.";

    // 5. Split bullet points
    const lines = text.split("\n");
    const recommendationBullets: string[] = [];
    const reasoningBullets: string[] = [];
    let verdict = "Apply 10/10/10 rule.";

    let section: "core" | "pros" | "verdict" | "none" = "none";

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### Core Recommendation") || trimmed.startsWith("### Recommendation")) {
        section = "core";
        return;
      }
      if (trimmed.startsWith("### Pros & Cons") || trimmed.startsWith("### Reasoning")) {
        section = "pros";
        return;
      }
      if (trimmed.startsWith("### Final Verdict") || trimmed.startsWith("### Verdict")) {
        section = "verdict";
        return;
      }

      if (section === "core" && (trimmed.startsWith("* ") || trimmed.startsWith("- "))) {
        recommendationBullets.push(trimmed.substring(2).replaceAll("**", ""));
      } else if (section === "pros" && (trimmed.startsWith("* ") || trimmed.startsWith("- "))) {
        reasoningBullets.push(trimmed.substring(2).replaceAll("**", ""));
      } else if (section === "verdict" && trimmed.length > 0) {
        verdict = trimmed.replaceAll("**", "");
      }
    });

    // Fallbacks if split fails
    if (recommendationBullets.length === 0) {
      recommendationBullets.push("Review immediate cash costs and timeline commitments.");
      recommendationBullets.push("Evaluate worst-case outcome before making final choices.");
    }

    return {
      confidence,
      savings,
      risk,
      alternative,
      recommendations: recommendationBullets,
      reasoning: reasoningBullets,
      verdict
    };
  };

  const renderStructuredCard = (text: string, tags: string[], compact: boolean = false) => {
    const data = parseAIRecommendation(text, tags);
    
    const renderSavingsValue = (savings: string) => {
      if (savings.includes(" (")) {
        const [amount, duration] = savings.split(" (");
        return (
          <div className="flex flex-col xl:flex-row xl:items-baseline xl:gap-1.5 leading-none">
            <span className="text-base font-extrabold text-emerald-400 font-mono leading-none">{amount}</span>
            <span className="text-[10px] text-emerald-500/70 font-mono leading-none">({duration}</span>
          </div>
        );
      }
      return <span className="text-base font-extrabold text-emerald-400 font-mono leading-none">{savings}</span>;
    };

    return (
      <div className="space-y-6 text-left font-sans">
        
        {/* KPI highlights */}
        <div className={`grid gap-4 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
          
          {/* Confidence Score Circular gauge */}
          <div className="p-4 rounded-xl border border-border bg-black/40 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">Confidence</span>
              <div className="w-8 h-8 relative shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-neutral-800" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary" strokeWidth="3.5" strokeDasharray={`${data.confidence}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-bold text-white">{data.confidence}</div>
              </div>
            </div>
            <div className="mt-1">
              <p className="text-xl font-extrabold text-white font-mono leading-none">{data.confidence}%</p>
            </div>
          </div>

          {/* Expected Savings */}
          <div className="p-4 rounded-xl border border-border bg-black/40 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">Expected Savings</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 shrink-0">
                <PiggyBank size={14} />
              </div>
            </div>
            <div className="mt-1">
              {renderSavingsValue(data.savings)}
            </div>
          </div>

          {/* Risk Level */}
          <div className="p-4 rounded-xl border border-border bg-black/40 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">Risk Level</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-bold border font-mono uppercase shrink-0 ${
                data.risk === "High"
                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : data.risk === "Medium"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {data.risk}
              </span>
            </div>
            <div className="mt-1">
              <p className="text-xl font-extrabold text-white font-mono leading-none">{data.risk}</p>
            </div>
          </div>

        </div>

        {/* Verdict Banner */}
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center gap-2.5 text-xs">
          <CheckCircle2 size={16} className="text-primary shrink-0" />
          <p className="text-white font-bold leading-normal">
            Verdict: <span className="text-primary-foreground font-semibold">{data.verdict}</span>
          </p>
        </div>

        {/* Bullet sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Core Recommendations */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-white font-mono text-[10px] uppercase tracking-wider border-b border-border pb-1">Core Actions</h4>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <div key={i} className="flex gap-2 text-left">
                  <span className="text-primary font-bold">•</span>
                  <p className="text-muted-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reasoning / Pros & Cons */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-white font-mono text-[10px] uppercase tracking-wider border-b border-border pb-1">AI Reasoning</h4>
            <div className="space-y-2">
              {data.reasoning.map((reason, i) => (
                <div key={i} className="flex gap-2 text-left">
                  <span className="text-primary font-bold">•</span>
                  <p className="text-muted-foreground leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alternative Option */}
        <div className="p-4 rounded-xl border border-border bg-secondary/20 text-xs text-left space-y-1">
          <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold">Alternative Route</span>
          <p className="text-white leading-relaxed">{data.alternative}</p>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-8 text-left pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Daily Decision Engine</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Consult the AI Pilot on everyday financial commitments, transit modes, and habit audits.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Prompts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleEvaluate(p.text)}
            disabled={submitting}
            className="p-4 rounded-xl border border-border bg-[#0c0c0e]/60 hover:border-primary/45 transition-all cursor-pointer text-left space-y-2 group disabled:opacity-50 hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-center text-[10px] text-primary font-mono font-bold uppercase tracking-wider">
              <span>{p.category}</span>
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-bold text-white leading-snug">{p.text}</p>
          </button>
        ))}
      </div>

      {/* Main chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Ask Box and Response */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              <span>AI Decision Coach</span>
            </h3>

            {/* Input area */}
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEvaluate()}
                placeholder="Ask e.g. Should I commute via cab today? Should I buy this laptop on EMI?"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-xs text-white placeholder-muted-foreground focus:outline-none"
              />
              <button
                onClick={() => handleEvaluate()}
                disabled={submitting || !query.trim()}
                className="p-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl cursor-pointer disabled:opacity-50"
                aria-label="Send evaluation request"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={14} />}
              </button>
            </div>

            {/* Live audit response output */}
            {activeRecommendation && (
              <div className="p-6 rounded-2xl border border-primary/20 bg-primary/[0.01] space-y-4 relative overflow-hidden animate-float">
                <div className="absolute top-4 right-4 flex gap-1.5">
                  {activeTags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary border border-primary/20 font-mono uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 items-center text-xs font-bold text-white">
                  <Sparkles size={14} className="text-primary" />
                  <span>AI Evaluation Blueprint</span>
                </div>
                <hr className="border-border/40" />
                {renderStructuredCard(activeRecommendation, activeTags, false)}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Past Decision History Logs */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <BrainCircuit size={18} className="text-primary" />
              <span>Historical Evaluator Logs</span>
            </h3>

            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>
            ) : decisions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No decisions logged. Enter a query to evaluate.</p>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {decisions.map((dec) => (
                  <div key={dec.id} className="p-4.5 rounded-xl border border-border bg-background/40 hover:bg-background transition-all space-y-4 text-left">
                    <div className="flex justify-between items-start text-xs font-mono">
                      <p className="font-bold text-white text-left line-clamp-2">{dec.query}</p>
                    </div>
                    <div className="border-t border-border/40 pt-3.5">
                      {renderStructuredCard(dec.recommendation, dec.context_tags, true)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
