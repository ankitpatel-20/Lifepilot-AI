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
  ArrowUpRight
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

  // Helper to convert simple markdown headers & bullets to HTML style divs
  const renderFormattedRecommendation = (text: string) => {
    const lines = text.split("\n");
    return (
      <div className="space-y-4 font-sans text-xs leading-relaxed text-left">
        {lines.map((line, idx) => {
          if (line.startsWith("### ")) {
            return (
              <h4 key={idx} className="font-extrabold text-sm text-foreground pt-3 border-b border-border/40 pb-1 font-mono uppercase tracking-wide">
                {line.replace("### ", "")}
              </h4>
            );
          }
          if (line.startsWith("* **") || line.startsWith("- **")) {
            // Bullet with bold text
            const parts = line.replace(/^[\*\-]\s*\*\*/, "").split("**");
            const boldPart = parts[0];
            const regularPart = parts.slice(1).join("**");
            return (
              <div key={idx} className="pl-4 relative flex items-start gap-1">
                <span className="absolute left-0 text-primary font-bold">•</span>
                <span>
                  <strong className="text-foreground font-semibold">{boldPart}</strong>
                  {regularPart}
                </span>
              </div>
            );
          }
          if (line.startsWith("**") && line.endsWith("**")) {
            return (
              <p key={idx} className="font-bold text-primary text-xs font-mono py-1">
                {line.replaceAll("**", "")}
              </p>
            );
          }
          if (line.startsWith("* ") || line.startsWith("- ")) {
            return (
              <div key={idx} className="pl-4 relative">
                <span className="absolute left-0 text-primary">•</span>
                <span>{line.substring(2)}</span>
              </div>
            );
          }
          if (line.trim() === "") return null;
          
          // Regular line, support bold text within
          return <p key={idx} className="text-muted-foreground">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Daily Decision Engine</h1>
          <p className="text-xs text-muted-foreground mt-1">Consult the AI Pilot on everyday financial commitments, transit modes, and habit audits.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
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
            className="p-4 rounded-xl border border-border bg-card/60 hover:border-primary/45 transition-colors cursor-pointer text-left space-y-2 group disabled:opacity-50"
          >
            <div className="flex justify-between items-center text-[10px] text-primary font-mono font-bold uppercase tracking-wider">
              <span>{p.category}</span>
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs font-semibold text-foreground leading-snug">{p.text}</p>
          </button>
        ))}
      </div>

      {/* Main chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Ask Box and Response */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
              <Compass size={18} className="text-primary animate-spin-slow" />
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
                className="flex-1 px-3.5 py-2.5 bg-background border border-border rounded-xl text-xs text-foreground placeholder-muted-foreground focus:outline-none"
              />
              <button
                onClick={() => handleEvaluate()}
                disabled={submitting || !query.trim()}
                className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Send evaluation request"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send size={14} />}
              </button>
            </div>

            {/* Live audit response output */}
            {activeRecommendation && (
              <div className="p-6 rounded-2xl border border-primary/20 bg-primary/[0.01] space-y-4 relative overflow-hidden animate-float">
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {activeTags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary border border-primary/20 font-mono uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 items-center text-xs font-bold text-foreground">
                  <Sparkles size={14} className="text-primary" />
                  <span>AI Evaluation Blueprint</span>
                </div>
                <hr className="border-border/40" />
                {renderFormattedRecommendation(activeRecommendation)}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Past Decision History Logs */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
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
                  <div key={dec.id} className="p-4 rounded-xl border border-border bg-background/40 hover:bg-background transition-all space-y-3">
                    <div className="flex justify-between items-start text-xs font-mono">
                      <p className="font-bold text-foreground text-left line-clamp-2">{dec.query}</p>
                    </div>
                    <div className="border-t border-border/40 pt-2.5">
                      {renderFormattedRecommendation(dec.recommendation)}
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
