"use client";

import { useEffect, useState } from "react";
import { 
  TrendingDown, 
  IndianRupee, 
  Trash2, 
  Sparkles, 
  Plus, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  FileText,
  AlertTriangle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom tooltips
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  // Parse method state
  const [method, setMethod] = useState<"text" | "manual">("text");

  // Semantic parse form
  const [rawText, setRawText] = useState("");

  // Manual inputs
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const [expData, profData] = await Promise.all([
        ApiService.getExpenses(),
        ApiService.getProfile()
      ]);
      setExpenses(expData.expenses);
      setProfile(profData.profile);
    } catch (err) {
      console.error("Load expenses page error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let payload: any = {};
      if (method === "text") {
        if (!rawText.trim()) return;
        payload = { rawText };
      } else {
        if (!amount || !description) {
          setError("Please fill out amount and description.");
          setSubmitting(false);
          return;
        }
        payload = { amount: Number(amount), category, description, date };
      }

      const res = await ApiService.createExpense(payload);
      
      // Update state
      setExpenses([res.expense, ...expenses]);
      
      // Reset inputs
      setRawText("");
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      
      // Refresh database profile metrics
      const profData = await ApiService.getProfile();
      setProfile(profData.profile);
    } catch (err: any) {
      setError(err.message || "Failed to log expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await ApiService.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
      
      const profData = await ApiService.getProfile();
      setProfile(profData.profile);
    } catch (err) {
      setError("Failed to delete transaction.");
    }
  };

  // Compute metrics
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const budget = profile?.monthly_budget || 35000;
  const budgetPercentage = Math.min(100, Math.round((totalSpent / budget) * 100));

  const wastefulList = expenses.filter(e => e.is_wasteful);
  const totalWastefulAmount = wastefulList.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const wastefulCount = wastefulList.length;

  // Category aggregations
  const categoryTotals = expenses.reduce((acc: any, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const categoryList = [
    { name: "Food", color: "bg-orange-500", hex: "#f97316" },
    { name: "Transport", color: "bg-blue-500", hex: "#3b82f6" },
    { name: "Rent", color: "bg-red-500", hex: "#ef4444" },
    { name: "Subscriptions", color: "bg-indigo-500", hex: "#6366f1" },
    { name: "Utilities", color: "bg-yellow-500", hex: "#eab308" },
    { name: "Shopping", color: "bg-pink-500", hex: "#ec4899" },
    { name: "Healthcare", color: "bg-emerald-500", hex: "#10b981" }
  ];

  const pieChartData = Object.entries(categoryTotals).map(([name, val]) => ({
    label: name,
    value: Number(val),
    color: categoryList.find(c => c.name === name)?.hex || "#a855f7"
  })).sort((a, b) => b.value - a.value);

  // Fallback pie data if empty
  const activePieData = pieChartData.length > 0 ? pieChartData : [
    { label: "Rent", value: 12000, color: "#ef4444" },
    { label: "Food", value: 4500, color: "#f97316" },
    { label: "Transport", value: 2400, color: "#3b82f6" }
  ];

  const makeDonutSlices = (data: typeof activePieData) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let accumulatedAngle = 0;
    return data.map((d) => {
      const percentage = d.value / (total || 1);
      const angle = percentage * 360;
      
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + angle;
      accumulatedAngle += angle;

      const rad = Math.PI / 180;
      const x1 = 50 + 40 * Math.cos((startAngle - 90) * rad);
      const y1 = 50 + 40 * Math.sin((startAngle - 90) * rad);
      const x2 = 50 + 40 * Math.cos((endAngle - 90) * rad);
      const y2 = 50 + 40 * Math.sin((endAngle - 90) * rad);
      
      const largeArc = angle > 180 ? 1 : 0;
      return {
        d: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
        label: d.label,
        value: d.value,
        color: d.color,
        percentage: Math.round(percentage * 100)
      };
    });
  };

  const slices = makeDonutSlices(activePieData);

  // Speedometer Gauge configuration (0 to 180 deg)
  const gaugeAngle = (budgetPercentage / 100) * 180;
  const needleRad = (gaugeAngle - 180) * (Math.PI / 180);
  const needleX = 50 + 32 * Math.cos(needleRad);
  const needleY = 80 + 32 * Math.sin(needleRad);

  return (
    <div className="space-y-8 text-left pb-16 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Expense Auditor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Audit expenditures, detect wasteful online markup loops, and save smarter.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary/80 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => { setMethod("text"); setError(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              method === "text"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AI Semantic Parser
          </button>
          <button
            onClick={() => { setMethod("manual"); setError(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer transition-all ${
              method === "manual"
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards & Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* KPI 1: Budget Utilization Speedometer Gauge */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 flex flex-col justify-between h-56">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono uppercase tracking-wider font-bold">
            <span>Budget Utilization Meter</span>
            <IndianRupee size={14} className="text-primary" />
          </div>
          
          <div className="flex flex-col items-center justify-center my-auto">
            <div className="relative w-44 h-20 overflow-hidden shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 85">
                {/* Scale Background */}
                <path d="M 10 80 A 40 40 0 0 1 90 80" fill="none" stroke="#1f1f23" strokeWidth="8" strokeLinecap="round" />
                {/* Progress Arc */}
                <path 
                  d="M 10 80 A 40 40 0 0 1 90 80" 
                  fill="none" 
                  stroke={budgetPercentage > 85 ? "#ef4444" : budgetPercentage > 60 ? "#eab308" : "#8b5cf6"} 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray={`${(budgetPercentage / 100) * 126}, 126`}
                />
                {/* Needle */}
                <line x1="50" y1="80" x2={needleX} y2={needleY} stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                {/* Needle center pin */}
                <circle cx="50" cy="80" r="4.5" fill="#ffffff" />
                {/* Background outline for percentage text to mask the needle */}
                <text 
                  x="50" 
                  y="71" 
                  textAnchor="middle" 
                  className="text-[13px] font-mono font-extrabold"
                  fill="none"
                  stroke="#0c0c0e"
                  strokeWidth="3.5"
                >
                  {budgetPercentage}%
                </text>
                {/* Main Percentage Text */}
                <text 
                  x="50" 
                  y="71" 
                  textAnchor="middle" 
                  className="text-[13px] font-mono font-extrabold fill-white"
                >
                  {budgetPercentage}%
                </text>
              </svg>
            </div>
            
            <div className="text-center mt-1">
              {budget - totalSpent >= 0 ? (
                <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  ₹{(budget - totalSpent).toLocaleString("en-IN")} Remaining
                </span>
              ) : (
                <span className="text-[11px] text-red-400 font-mono font-bold bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                  ₹{Math.abs(budget - totalSpent).toLocaleString("en-IN")} Over Budget
                </span>
              )}
            </div>
          </div>
          
          <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
            <span>Spent: ₹{totalSpent}</span>
            <span>Limit: ₹{budget}</span>
          </div>
        </div>

        {/* KPI 2: AI Waste Detection Card */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 flex flex-col justify-between h-56">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono uppercase tracking-wider font-bold">
            <span>AI Waste Detection</span>
            <AlertTriangle size={14} className="text-rupee-saffron animate-pulse-slow" />
          </div>
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-muted-foreground font-mono uppercase font-bold">Identified Leaks</span>
            <h3 className="text-3xl font-extrabold text-red-400 tracking-tight">₹{totalWastefulAmount.toLocaleString("en-IN")}</h3>
            <span className="text-[10px] text-muted-foreground font-mono">Across {wastefulCount} parsed markup logs</span>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 leading-relaxed font-mono text-left">
            {wastefulCount > 0 
              ? `🚫 Swiggy & Uber Moto loops found. Ordering local meals instead of apps saves ₹300 per day.`
              : `✅ High fiscal score. Zero wasteful leakages flagged in your stream.`
            }
          </div>
        </div>

        {/* KPI 3: Savings Opportunity Card */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 flex flex-col justify-between h-56">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono uppercase tracking-wider font-bold">
            <span>Savings Opportunity</span>
            <Lightbulb size={14} className="text-emerald-400 animate-float" />
          </div>
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-muted-foreground font-mono uppercase font-bold">Weekly Target Swaps</span>
            <h3 className="text-3xl font-extrabold text-emerald-400 tracking-tight">₹1,200/wk</h3>
            <span className="text-[10px] text-muted-foreground font-mono">Immediate active alternatives</span>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 leading-relaxed font-mono text-left">
            💡 **Swap Suggestion**:
            <div className="flex items-center gap-1.5 mt-1 font-bold">
              <span>App Cab (₹380)</span>
              <ArrowRight size={10} />
              <span>Namma Metro (₹50)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Interactive Charts Panel & Logging Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Transaction Logging */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse-slow" />
              <span>Log Transaction</span>
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              {method === "text" ? (
                <div className="space-y-2 text-left">
                  <label className="text-muted-foreground font-semibold">Type raw transaction details</label>
                  <textarea
                    required
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="e.g., spent ₹480 on Swiggy delivery lunch, or ₹80 Metro ticket recharge"
                    className="w-full px-3.5 py-3 bg-background border border-border rounded-xl text-white placeholder-muted-foreground focus:outline-none h-28 resize-none leading-relaxed text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground leading-normal font-mono">
                    Type a description and cash amount. Our AI-helper automatically parses the category and wasteful leakage index.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="250"
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-muted-foreground font-semibold">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none cursor-pointer text-xs"
                      >
                        {categoryList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Description</label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Paneer Biryani lunch"
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground font-semibold">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none cursor-pointer font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-xs font-bold"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={14} />}
                <span>Log Transaction</span>
              </button>
            </form>
          </div>

          {/* Interactive Donut Breakdown */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <TrendingDown size={16} className="text-primary" />
              <span>Expense Breakdown</span>
            </h3>

            <div className="flex items-center justify-around gap-2 my-2">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {slices.map((slice, idx) => {
                    if (!slice) return null;
                    const isHovered = hoveredSlice === idx;
                    return (
                      <path
                        key={idx}
                        d={slice.d}
                        fill={slice.color}
                        className="transition-all duration-300 cursor-pointer"
                        style={{
                          transform: isHovered ? "scale(1.05) translate(-2px, -2px)" : "scale(1)",
                          transformOrigin: "50px 50px"
                        }}
                        onMouseEnter={() => setHoveredSlice(idx)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                  <circle cx="50" cy="50" r="25" fill="#0c0c0e" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-white font-mono font-extrabold">
                    {hoveredSlice !== null ? slices[hoveredSlice]?.label : "Total"}
                  </span>
                  <span className="text-[10px] text-primary font-mono font-bold">
                    {hoveredSlice !== null ? `${slices[hoveredSlice]?.percentage}%` : `₹${totalSpent}`}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 text-[9px] font-mono text-left max-h-[120px] overflow-y-auto">
                {activePieData.map((d, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-white font-bold">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Transaction Logs & Category comparison */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Category Comparison horizontal bars */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span>Category Allocation Comparison</span>
            </h3>

            <div className="space-y-3">
              {categoryList.map((cat) => {
                const spent = categoryTotals[cat.name] || 0;
                const percent = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
                if (spent === 0) return null;
                
                return (
                  <div key={cat.name} className="space-y-1.5 text-xs text-left">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="font-bold text-white flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                        {cat.name}
                      </span>
                      <span className="text-muted-foreground font-semibold">₹{spent.toLocaleString("en-IN")} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-[#1f1f23] h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction Logs Stream */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span>Expenditure Audit Stream</span>
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-primary w-6 h-6" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No logged expenses yet. Use the parser on the left to add your first transaction.
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {expenses.map((expense) => {
                  const catMeta = categoryList.find(c => c.name === expense.category);
                  const categoryColor = catMeta?.color || "bg-secondary";
                  
                  return (
                    <div 
                      key={expense.id}
                      className={`p-4 rounded-xl border bg-background/50 hover:bg-background transition-all flex flex-col gap-3 relative group ${
                        expense.is_wasteful ? "border-red-500/20 bg-red-500/[0.01]" : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-start text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${categoryColor}`} />
                          <div className="text-left">
                            <p className="font-bold text-white leading-normal">{expense.description}</p>
                            <div className="flex gap-3 text-[10px] text-muted-foreground font-mono mt-0.5 font-bold">
                              <span>{expense.category}</span>
                              <span>•</span>
                              <span>{expense.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-extrabold text-white">₹{(Number(expense.amount) || 0).toFixed(0)}</span>
                          
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-secondary cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Delete log"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Wasteful Audit Tips */}
                      {expense.is_wasteful && expense.savings_insight && (
                        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 text-left leading-relaxed font-mono font-semibold">
                          ⚠️ **Audit Alert:** {expense.savings_insight}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
