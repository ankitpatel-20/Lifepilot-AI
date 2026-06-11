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
  AlertTriangle
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError("Failed to delete transaction.");
    }
  };

  // Compute metrics
  const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const budget = profile?.monthly_budget || 30000;
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
    { name: "Food", color: "bg-orange-500" },
    { name: "Transport", color: "bg-blue-500" },
    { name: "Rent", color: "bg-red-500" },
    { name: "Subscriptions", color: "bg-indigo-500" },
    { name: "Utilities", color: "bg-yellow-500" },
    { name: "Shopping", color: "bg-pink-500" },
    { name: "Healthcare", color: "bg-emerald-500" }
  ];

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Expense Auditor</h1>
          <p className="text-xs text-muted-foreground mt-1">Audit expenditures, detect wasteful online markup loops, and save smarter.</p>
        </div>
        <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl border border-border">
          <button
            onClick={() => { setMethod("text"); setError(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              method === "text"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            AI Semantic Parser
          </button>
          <button
            onClick={() => { setMethod("manual"); setError(null); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
              method === "manual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Spent Meter */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono uppercase tracking-wider">
            <span>Total Spent</span>
            <IndianRupee size={14} className="text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-foreground">₹{totalSpent.toLocaleString("en-IN")}</h2>
            <p className="text-[10px] text-muted-foreground font-mono">
              of ₹{budget.toLocaleString("en-IN")} Monthly Target
            </p>
          </div>
          <div className="space-y-1 pt-1">
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  budgetPercentage > 85 ? "bg-red-500" : budgetPercentage > 60 ? "bg-yellow-500" : "bg-emerald-500"
                }`}
                style={{ width: `${budgetPercentage}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{budgetPercentage}% Consumed</span>
              <span>₹{(budget - totalSpent).toLocaleString("en-IN")} Left</span>
            </div>
          </div>
        </div>

        {/* Wasteful leakage details */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-mono uppercase tracking-wider">
            <span>AI Leakage Auditor</span>
            <AlertTriangle size={14} className="text-rupee-saffron animate-float" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold text-foreground">₹{totalWastefulAmount.toLocaleString("en-IN")}</h2>
            <p className="text-[10px] text-muted-foreground font-mono">
              Bleeding across {wastefulCount} parsed items
            </p>
          </div>
          <div className="p-2.5 bg-rupee-saffron/10 border border-rupee-saffron/20 rounded-xl text-[10px] text-rupee-saffron leading-relaxed font-mono">
            {wastefulCount > 0 
              ? `🚫 Online food deliveries & app cabs are compounding! Cooking at home or swapping for Metro saves ₹200+ per order.`
              : `✅ Outstanding! No wasteful expenditures flagged. Keep up the high financial discipline.`
            }
          </div>
        </div>

        {/* Categorized Progress bar list */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Category Split</p>
          <div className="space-y-2.5 max-h-[120px] overflow-y-auto pr-1">
            {categoryList.map((cat) => {
              const spent = categoryTotals[cat.name] || 0;
              const percent = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
              if (spent === 0) return null;
              
              return (
                <div key={cat.name} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                      {cat.name}
                    </span>
                    <span className="text-muted-foreground font-mono">₹{spent.toLocaleString("en-IN")} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
            {expenses.length === 0 && (
              <p className="text-[10px] text-muted-foreground text-center py-6">No expenditures recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main interaction panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Log Expense Box */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse-slow" />
              <span>Log Transaction</span>
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
              {method === "text" ? (
                // AI Text box
                <div className="space-y-2">
                  <label className="text-muted-foreground">Type raw transaction details</label>
                  <textarea
                    required
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="e.g., spent ₹480 on Swiggy delivery lunch, or ₹80 Metro ticket recharge"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none h-24 resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-muted-foreground leading-relaxed leading-normal">
                    Tip: State the amount (in numbers or ₹ symbols) and description clearly. Our parser handles the categorization and analyzes cash waste metrics.
                  </p>
                </div>
              ) : (
                // Manual input fields
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-muted-foreground">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="250"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-muted-foreground">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none cursor-pointer"
                      >
                        {categoryList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground">Description</label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Paneer Biryani lunch"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-muted-foreground">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 font-medium text-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={14} />}
                <span>Log Transaction</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Transaction Logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span>Expenditure Audit Stream</span>
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-primary w-6 h-6" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No logged expenses yet. Use the semantic box to parse your first transaction.
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {expenses.map((expense) => {
                  const categoryColor = categoryList.find(c => c.name === expense.category)?.color || "bg-secondary";
                  
                  return (
                    <div 
                      key={expense.id}
                      className={`p-4 rounded-xl border bg-background/50 hover:bg-background transition-all flex flex-col gap-3 relative group ${
                        expense.is_wasteful ? "border-rupee-saffron/30 bg-rupee-saffron/[0.01]" : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-start text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${categoryColor}`} />
                          <div className="text-left">
                            <p className="font-semibold text-foreground leading-normal">{expense.description}</p>
                            <div className="flex gap-3 text-[10px] text-muted-foreground font-mono mt-0.5">
                              <span>{expense.category}</span>
                              <span>•</span>
                              <span>{expense.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-extrabold text-foreground">₹{(Number(expense.amount) || 0).toFixed(0)}</span>
                          
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
                        <div className="p-3 bg-rupee-saffron/10 border border-rupee-saffron/20 rounded-xl text-[10px] text-rupee-saffron text-left leading-relaxed font-mono">
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
