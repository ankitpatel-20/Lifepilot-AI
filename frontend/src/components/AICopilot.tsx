"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  X, 
  Compass, 
  Calendar, 
  TrendingDown, 
  BrainCircuit, 
  Info,
  Loader2
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "pilot"; text: string; formatted?: boolean }>>([
    { sender: "pilot", text: "Ready for launch. Type a command or press the Mic to dictate." }
  ]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const activeText = textToSend || query;
    if (!activeText.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: activeText }]);
    setQuery("");
    setLoading(true);

    try {
      const textLower = activeText.toLowerCase();

      // Route commands semantic parser
      if (textLower.includes("optimize") || textLower.includes("schedule") || textLower.includes("plan")) {
        const today = new Date().toISOString().split("T")[0];
        const res = await ApiService.optimizeSchedule(today);
        setMessages(prev => [...prev, { 
          sender: "pilot", 
          text: `🎯 planner schedule optimized successfully! focus score: ${res.productivityScore}%. AI Insights: ${res.insights}` 
        }]);
        // Trigger window reload or state refresh if dashboard is active
        window.dispatchEvent(new Event("lp_data_update"));
      } 
      else if (textLower.includes("spent") || textLower.includes("rs") || textLower.includes("₹") || textLower.includes("swiggy") || textLower.includes("zomato") || textLower.includes("expense")) {
        const res = await ApiService.createExpense({ rawText: activeText });
        setMessages(prev => [...prev, { 
          sender: "pilot", 
          text: `💸 transaction logged! Description: ${res.expense.description}. Category: ${res.expense.category}. Audit: ${res.expense.savings_insight}` 
        }]);
        window.dispatchEvent(new Event("lp_data_update"));
      } 
      else {
        // Default to decision tree queries
        const res = await ApiService.createDecision(activeText);
        setMessages(prev => [...prev, { 
          sender: "pilot", 
          text: res.decision.recommendation,
          formatted: true
        }]);
        window.dispatchEvent(new Event("lp_data_update"));
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { sender: "pilot", text: `⚠️ Error parsing command: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Mock voice control trigger
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Auto populate a mock query to simulate voice recognition
      const voicePrompts = [
        "Optimize my daily planner schedule",
        "Spent ₹450 on Swiggy delivery dinner",
        "Should I buy a new phone on EMI?"
      ];
      const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
      setQuery(randomPrompt);
    } else {
      setIsRecording(true);
      setQuery("Listening to voice query...");
      setTimeout(() => {
        // Auto trigger input fill
        setIsRecording(false);
        const voicePrompts = [
          "Optimize my daily planner schedule",
          "Spent ₹450 on Swiggy delivery dinner",
          "Should I buy a new phone on EMI?"
        ];
        const randomPrompt = voicePrompts[Math.floor(Math.random() * voicePrompts.length)];
        setQuery(randomPrompt);
      }, 2500);
    }
  };

  const quickShortcuts = [
    { text: "Optimize schedule", icon: Calendar },
    { text: "Log ₹250 Swiggy coffee", icon: TrendingDown },
    { text: "Auto vs Metro commute?", icon: BrainCircuit }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating launcher trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/25 cursor-pointer relative overflow-hidden group flex items-center gap-2"
          id="copilot-launcher-btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-primary to-fuchsia-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Sparkles size={20} className="relative z-10 animate-float" />
          <span className="relative z-10 text-xs font-bold font-mono tracking-wide hidden md:block">Ask Copilot</span>
        </button>
      )}

      {/* Spotlight command box overlay */}
      {isOpen && (
        <div className="w-[360px] sm:w-[420px] rounded-2xl glass-card shadow-2xl border border-border flex flex-col max-h-[500px] overflow-hidden text-xs">
          
          {/* Header */}
          <div className="p-4 border-b border-border/60 flex items-center justify-between bg-card/40">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse-slow" />
              <span className="font-bold text-foreground font-mono">LifePilot AI Copilot</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Conversation stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`p-3 rounded-xl leading-relaxed text-left ${
                  msg.sender === "user" 
                    ? "bg-primary text-primary-foreground font-semibold" 
                    : "bg-secondary text-foreground border border-border/80"
                }`}>
                  {msg.formatted ? (
                    // Simple formatter for decision markdown
                    <div className="space-y-1 text-[11px] font-mono">
                      {msg.text.split("\n").map((line, idx) => {
                        if (line.startsWith("### ")) return <h5 key={idx} className="font-bold text-foreground mt-1 border-b border-border/40 pb-0.5">{line.replace("### ", "")}</h5>;
                        if (line.startsWith("* ")) return <p key={idx} className="pl-2">• {line.substring(2)}</p>;
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-muted-foreground italic pl-1">
                <Loader2 className="animate-spin w-3.5 h-3.5" />
                <span>AI Pilot is auditing...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Shortcut Chips */}
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient select-none">
            {quickShortcuts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.text)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/80 bg-secondary/30 hover:border-primary/45 transition-colors text-[10px] text-muted-foreground hover:text-foreground font-mono shrink-0 cursor-pointer"
              >
                <chip.icon size={10} />
                <span>{chip.text}</span>
              </button>
            ))}
          </div>

          {/* Command input form */}
          <div className="p-3 border-t border-border/60 bg-card/25 flex gap-2 items-center">
            {/* Mock Voice Input Trigger */}
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                isRecording 
                  ? "bg-red-500/10 border-red-500 text-red-500 shadow shadow-red-500/25" 
                  : "bg-secondary border-border text-muted-foreground hover:text-foreground"
              }`}
              aria-label={isRecording ? "Stop listening" : "Start voice commands"}
            >
              {isRecording && (
                <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping" />
              )}
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            </button>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isRecording ? "Listening closely..." : "Ask transit, EMI, or type 'optimize'..."}
              disabled={isRecording}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none"
            />
            
            <button
              onClick={() => handleSend()}
              disabled={!query.trim() || isRecording || loading}
              className="p-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl cursor-pointer disabled:opacity-50"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
