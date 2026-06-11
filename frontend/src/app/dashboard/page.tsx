"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Calendar, 
  TrendingDown, 
  BookOpen, 
  BrainCircuit, 
  IndianRupee,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Flame,
  Plus,
  Zap,
  Info,
  DollarSign,
  ShieldCheck,
  TrendingUpIcon
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [hoveredLineIndex, setHoveredLineIndex] = useState<number | null>(null);
  
  // Custom update hook for syncing when AI Copilot does actions
  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener("lp_data_update", handleUpdate);
    return () => window.removeEventListener("lp_data_update", handleUpdate);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        
        const [profileData, tasksData, expensesData, studyData, decisionsData] = await Promise.all([
          ApiService.getProfile(),
          ApiService.getTasks(today),
          ApiService.getExpenses(),
          ApiService.getStudyDashboard(),
          ApiService.getDecisions()
        ]);

        setProfile(profileData.profile);
        setTasks(tasksData.tasks);
        setExpenses(expensesData.expenses);
        setStudyPlans(studyData.plans);
        setRevisions(studyData.revisions);
        setDecisions(decisionsData.decisions);

        // Dynamic context-aware insights
        const activeInsights: string[] = [];
        const wastefulList = expensesData.expenses.filter((e: any) => e.is_wasteful);
        if (wastefulList.length > 0) {
          const totalWaste = wastefulList.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
          activeInsights.push(`Financial Leak: Spotted ₹${totalWaste.toFixed(0)} on online markups. Cooking dinner or ordering local tiffin saves ₹3,500 monthly.`);
        } else {
          activeInsights.push("Finance Clear: No leakage detected. Excellent budget discipline maintained.");
        }

        const pendingTasks = tasksData.tasks.filter((t: any) => t.status === "pending");
        if (pendingTasks.length > 0) {
          activeInsights.push(`Focus Alert: You have ${pendingTasks.length} pending objectives. Run AI scheduling for optimized focus breaks.`);
        }

        const pendingRevisions = studyData.revisions.filter((r: any) => r.status === "pending");
        if (pendingRevisions.length > 0) {
          activeInsights.push(`Retention Trigger: ${pendingRevisions.length} spaced repetition cards due. Complete revisions to secure knowledge.`);
        }

        setInsights(activeInsights);

      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [updateTrigger]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Compute metrics
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;
  const totalTasksCount = tasks.length;
  const taskProgress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const budgetLimit = profile?.monthly_budget || 35000;
  const budgetProgress = Math.min(100, Math.round((totalExpenseAmount / budgetLimit) * 100));

  const activeStudyName = studyPlans.length > 0 ? studyPlans[0].subject : "No active course";
  const activeStudyProgress = studyPlans.length > 0 ? studyPlans[0].progress : 0;

  // AI lifestyle health score
  const healthScore = profile?.productivity_score || 82;

  // Spaced repetition metrics
  const pendingReviewsCount = revisions.filter(r => r.status === "pending").length;

  // Category Colors
  const categoryMeta: Record<string, { color: string; border: string; bg: string }> = {
    Food: { color: "#f97316", border: "border-orange-500/20", bg: "bg-orange-500" },
    Transport: { color: "#3b82f6", border: "border-blue-500/20", bg: "bg-blue-500" },
    Rent: { color: "#ef4444", border: "border-red-500/20", bg: "bg-red-500" },
    Subscriptions: { color: "#6366f1", border: "border-indigo-500/20", bg: "bg-indigo-500" },
    Utilities: { color: "#eab308", border: "border-yellow-500/20", bg: "bg-yellow-500" },
    Shopping: { color: "#ec4899", border: "border-pink-500/20", bg: "bg-pink-500" },
    Healthcare: { color: "#10b981", border: "border-emerald-500/20", bg: "bg-emerald-500" }
  };

  // Category aggregations for Pie Chart
  const categoryTotals = expenses.reduce((acc: Record<string, number>, curr: any) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryTotals).map(([name, amount]) => ({
    label: name,
    value: amount,
    color: categoryMeta[name]?.color || "#a855f7"
  })).sort((a, b) => b.value - a.value);

  // Fallback pie data if empty
  const activePieData = pieChartData.length > 0 ? pieChartData : [
    { label: "Rent", value: 12000, color: "#ef4444" },
    { label: "Food", value: 4500, color: "#f97316" },
    { label: "Transport", value: 2400, color: "#3b82f6" },
    { label: "Subscriptions", value: 1200, color: "#6366f1" }
  ];

  // Helper to generate donut slices
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
      const dPath = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      return {
        d: dPath,
        label: d.label,
        value: d.value,
        color: d.color,
        percentage: Math.round(percentage * 100)
      };
    });
  };

  const slices = makeDonutSlices(activePieData);

  // Line Chart Points for Monthly Spend Trend
  const trendPoints = [
    { week: "Week 1", amount: 6200 },
    { week: "Week 2", amount: 9800 },
    { week: "Week 3", amount: 8400 },
    { week: "Week 4", amount: totalExpenseAmount > 0 ? totalExpenseAmount : 14500 }
  ];
  const maxTrendAmount = Math.max(...trendPoints.map(p => p.amount)) || 20000;
  const trendSvgWidth = 460;
  const trendSvgHeight = 160;

  const trendSvgPoints = trendPoints.map((p, idx) => {
    const x = 50 + idx * 120;
    const y = trendSvgHeight - 30 - ((p.amount / maxTrendAmount) * 100);
    return { x, y, week: p.week, amount: p.amount };
  });

  const linePathD = trendSvgPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPathD = `${linePathD} L ${trendSvgPoints[trendSvgPoints.length - 1].x} ${trendSvgHeight - 25} L ${trendSvgPoints[0].x} ${trendSvgHeight - 25} Z`;

  // Budget vs Actual Double Bar Chart data
  const budgetVsActualData = [
    { category: "Food", budget: 6000, actual: categoryTotals["Food"] || 450 },
    { category: "Transport", budget: 3000, actual: categoryTotals["Transport"] || 80 },
    { category: "Rent", budget: 15000, actual: categoryTotals["Rent"] || 12000 },
    { category: "Subs", budget: 2000, actual: categoryTotals["Subscriptions"] || 0 }
  ];

  // Goals list
  const goals = [
    { name: "Sem Tuition Fee", target: 50000, current: 35000, color: "stroke-primary" },
    { name: "Emergency Fund", target: 20000, current: 8000, color: "stroke-emerald-500" }
  ];

  // Predicted upcoming bills
  const upcomingPredictions = [
    { title: "PG Accommodation Rent", due: "In 4 Days", amount: "₹12,000", action: "Rent Budget Safe" },
    { title: "Spotify Premium Plan", due: "In 9 Days", amount: "₹179", action: "Leak Detection flagged" }
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse text-left">
        <div className="h-28 bg-[#0c0c0e] rounded-3xl w-full border border-border" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-[#0c0c0e] rounded-2xl border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-[#0c0c0e] rounded-2xl border border-border" />
          <div className="h-96 bg-[#0c0c0e] rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left pb-16 font-sans">
      
      {/* 🚀 Premium Hackathon Mode Pitch Banner (10-Second Judge Hook) */}
      <section className="relative rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-[#0c0c0e] to-purple-500/5 p-6 md:p-8 overflow-hidden glow-purple">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/20 text-primary-foreground border border-primary/30 text-xs font-bold font-mono uppercase tracking-wider">
              <Zap size={13} className="text-yellow-400 animate-float" />
              <span>JUDGE PITCH MODE ACTIVE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              LifePilot AI: <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Student Copilot Cockpit</span>
            </h1>
            <p className="text-sm text-foreground leading-relaxed max-w-2xl font-medium">
              Indian students bleed cash on delivery markup loops, premium ride-hailing cabs, and lose track of syllabus study milestones. LifePilot AI combines an **AI Auditor** with a **Spaced Repetition Engine** to save money and boost learning outcomes.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:w-1/2">
            <div className="p-3 bg-black/40 rounded-2xl border border-border/80 text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">1. PROBLEM</span>
              <p className="text-xs font-bold text-red-400 mt-1">₹5K/mo Cash Leaks & Study Decay</p>
            </div>
            <div className="p-3 bg-black/40 rounded-2xl border border-border/80 text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">2. AI SOLUTION</span>
              <p className="text-xs font-bold text-primary-foreground mt-1">Audit-Parser & Auto-Planner</p>
            </div>
            <div className="p-3 bg-black/40 rounded-2xl border border-border/80 text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">3. MONEY SAVED</span>
              <p className="text-xs font-extrabold text-emerald-400 mt-1">₹4,850/mo Projected Savings</p>
            </div>
            <div className="p-3 bg-black/40 rounded-2xl border border-border/80 text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">4. BENEFIT</span>
              <p className="text-xs font-bold text-amber-400 mt-1">Zero Debt & 3x Concept Retention</p>
            </div>
          </div>
        </div>
      </section>

      {/* Greeting & Quick Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            {getGreeting()}, <span className="text-primary">{profile?.user?.fullName || "Ankit"}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Your financial status and study streak are fully calibrated.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/planner" className="btn-secondary text-xs">
            <Calendar size={14} />
            <span>Manage Daily Roadmap</span>
          </Link>
          <Link href="/dashboard/decision" className="btn-primary text-xs">
            <BrainCircuit size={14} />
            <span>Ask Decision Engine</span>
          </Link>
        </div>
      </div>

      {/* Premium KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Financial Health Score */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 flex items-center justify-between group hover:border-primary/40 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Financial Health</span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{healthScore}/100</h3>
            <span className="text-[11px] font-bold text-emerald-400 font-mono">Rank: Optimal 🚀</span>
          </div>
          <div className="w-14 h-14 relative shrink-0">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-neutral-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-primary" strokeWidth="3.5" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-extrabold text-white">{healthScore}</div>
          </div>
        </div>

        {/* KPI 2: Total Spent Outflow */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 space-y-1 group hover:border-emerald-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Active Outflow</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
              <IndianRupee size={14} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">₹{totalExpenseAmount.toLocaleString("en-IN")}</h3>
          <p className="text-[11px] text-muted-foreground font-mono font-semibold">
            {budgetProgress}% of ₹{budgetLimit.toLocaleString("en-IN")} limit
          </p>
        </div>

        {/* KPI 3: Study Roadmap completion */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 space-y-1 group hover:border-indigo-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Syllabus Mastered</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
              <BookOpen size={14} />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">{activeStudyProgress}%</h3>
          <p className="text-[11px] text-muted-foreground font-mono font-semibold truncate">
            Subject: {activeStudyName}
          </p>
        </div>

        {/* KPI 4: Pending Spaced Revisions */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 space-y-1 group hover:border-amber-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Memory Revision Due</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/15">
              <Flame size={14} className="animate-float" />
            </div>
          </div>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">{pendingReviewsCount} Due</h3>
          <p className="text-[11px] text-muted-foreground font-mono font-semibold">
            Spaced repetition logs pending
          </p>
        </div>

      </div>

      {/* Charts section: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Trend Line Chart (Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <span>Monthly Spending Trend Chart</span>
              </h3>
              <p className="text-xs text-muted-foreground">Historical weekly flow of expenditures inside the active month</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Spent Trend
              </span>
            </div>
          </div>

          {/* SVG Trend Line Chart */}
          <div className="relative h-48 w-full select-none pt-2">
            <svg className="w-full h-full" viewBox="0 0 460 160" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="410" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="50" y1="50" x2="410" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="50" y1="90" x2="410" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="50" y1="130" x2="410" y2="130" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              
              {/* Fill Gradient path */}
              <path
                d={areaPathD}
                fill="url(#trend-area-grad)"
                className="opacity-25"
              />

              {/* Glowing Line Path */}
              <path
                d={linePathD}
                fill="none"
                stroke="url(#trend-line-grad)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="trend-line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="trend-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Circle Nodes & tooltips */}
              {trendSvgPoints.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredLineIndex === idx ? "7" : "5"}
                    fill="#09090b"
                    stroke={idx % 2 === 0 ? "#8b5cf6" : "#ec4899"}
                    strokeWidth="3.5"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredLineIndex(idx)}
                    onMouseLeave={() => setHoveredLineIndex(null)}
                  />
                  {hoveredLineIndex === idx && (
                    <g>
                      <rect
                        x={pt.x - 45}
                        y={pt.y - 35}
                        width="90"
                        height="24"
                        rx="6"
                        fill="#1f1f23"
                        stroke="#8b5cf6"
                        strokeWidth="1"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 19}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        ₹{pt.amount}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>
            
            {/* Week Labels */}
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono px-12 pt-1.5">
              {trendPoints.map((pt, idx) => (
                <span key={idx} className="font-semibold">{pt.week}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Distribution Pie Chart */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingDown size={16} className="text-primary" />
              <span>Expense Distribution</span>
            </h3>
            <p className="text-xs text-muted-foreground">Categorized slice breakdown of logged expenses</p>
          </div>

          <div className="flex items-center justify-around gap-2 my-2">
            {/* Interactive SVG Pie */}
            <div className="relative w-32 h-32 shrink-0">
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
                {/* Donut Center Mask */}
                <circle cx="50" cy="50" r="24" fill="#0c0c0e" />
              </svg>
              {/* Tooltip Overlay inside donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {hoveredSlice !== null ? (
                  <>
                    <span className="text-[10px] text-white font-extrabold uppercase tracking-wider font-mono">
                      {slices[hoveredSlice]?.label}
                    </span>
                    <span className="text-xs text-primary font-bold font-mono">
                      {slices[hoveredSlice]?.percentage}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Total</span>
                    <span className="text-xs text-foreground font-extrabold font-mono">₹{totalExpenseAmount}</span>
                  </>
                )}
              </div>
            </div>

            {/* Vertical Legends */}
            <div className="flex flex-col gap-1.5 text-[10px] font-mono text-left max-h-[140px] overflow-y-auto pr-1">
              {activePieData.map((d, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    hoveredSlice === idx ? "bg-white/5" : ""
                  }`}
                  onMouseEnter={() => setHoveredSlice(idx)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-white font-bold max-w-[70px] truncate">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Budget vs Actual & Additional Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Budget vs Actual Comparison Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap size={16} className="text-emerald-400" />
              <span>Budget vs Actual Spending</span>
            </h3>
            <p className="text-xs text-muted-foreground">Target limits set in profile settings vs actual logs per category</p>
          </div>

          {/* SVG Grouped Double Bar Graph */}
          <div className="relative h-44 w-full select-none pt-2">
            <svg className="w-full h-full" viewBox="0 0 460 120" preserveAspectRatio="none">
              <line x1="40" y1="20" x2="440" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="60" x2="440" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="100" x2="440" y2="100" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {budgetVsActualData.map((d, idx) => {
                const x = 50 + idx * 105;
                const maxVal = 16000;
                
                // Heights
                const budgetH = Math.min(80, Math.round((d.budget / maxVal) * 80));
                const actualH = Math.min(80, Math.round((d.actual / maxVal) * 80));

                return (
                  <g key={idx}>
                    {/* Budget limit Bar (Grey) */}
                    <rect
                      x={x}
                      y={100 - budgetH}
                      width="14"
                      height={budgetH}
                      rx="3"
                      fill="#1f1f23"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                    {/* Actual spent Bar (Purple / Red if over budget) */}
                    <rect
                      x={x + 18}
                      y={100 - actualH}
                      width="14"
                      height={actualH}
                      rx="3"
                      fill={d.actual > d.budget ? "#ef4444" : "#8b5cf6"}
                    />
                    {/* Numeric Tooltips on hover */}
                    <text x={x + 7} y={100 - budgetH - 5} fill="rgba(255,255,255,0.6)" fontSize="7" fontFamily="monospace" textAnchor="middle">₹{d.budget}</text>
                    <text x={x + 25} y={100 - actualH - 5} fill={d.actual > d.budget ? "#ef4444" : "#a855f7"} fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">₹{d.actual}</text>
                  </g>
                );
              })}
            </svg>
            
            {/* Labels */}
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono px-12 pt-1.5">
              {budgetVsActualData.map((d, idx) => (
                <span key={idx} className="font-semibold">{d.category}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Spending Heatmap */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              <span>Weekly Spending Heatmap</span>
            </h3>
            <p className="text-xs text-muted-foreground">Spending frequency map across the days of the week</p>
          </div>

          <div className="grid grid-cols-7 gap-2.5 pt-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, idx) => (
              <div key={idx} className="text-center font-mono text-[10px] font-bold text-muted-foreground">{d}</div>
            ))}
            {/* Draw 4 weeks of grid blocks */}
            {[...Array(28)].map((_, i) => {
              // Generate mock heatmap coloration based on index
              const level = i % 7 === 0 ? "bg-primary" : i % 5 === 0 ? "bg-purple-700" : i % 9 === 0 ? "bg-purple-900" : "bg-neutral-800/40";
              return (
                <div 
                  key={i} 
                  className={`w-full aspect-square rounded-md border border-white/5 transition-all duration-300 hover:scale-105 cursor-pointer ${level}`}
                  title={`Day ${i + 1} activity log`} 
                />
              );
            })}
          </div>
          <div className="flex justify-end gap-1.5 items-center text-[9px] font-mono text-muted-foreground">
            <span>Low</span>
            <span className="w-2.5 h-2.5 rounded bg-neutral-800/40 border border-white/5" />
            <span className="w-2.5 h-2.5 rounded bg-purple-900 border border-white/5" />
            <span className="w-2.5 h-2.5 rounded bg-purple-700 border border-white/5" />
            <span className="w-2.5 h-2.5 rounded bg-primary border border-white/5" />
            <span>High Outflow</span>
          </div>
        </div>

      </div>

      {/* Row 3: Insights & Side Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Savings Forecast Card */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse-slow" />
              <span>AI Savings Forecast & Goals</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-black/40 border border-border rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">1-Month Forecast</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">₹4,850 Saved</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">By swapping Swiggy & Cabs</p>
              </div>
              <div className="p-4 bg-black/40 border border-border rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">3-Month Forecast</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">₹14,550 Saved</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Compound investment ready</p>
              </div>
              <div className="p-4 bg-black/40 border border-border rounded-xl">
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">6-Month Forecast</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">₹29,100 Saved</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Emergency cushion ready</p>
              </div>
            </div>

            {/* Goal progress list */}
            <div className="pt-2 space-y-4">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold">Goal-Based Savings Tracker</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((g, idx) => {
                  const percent = Math.round((g.current / g.target) * 100);
                  return (
                    <div key={idx} className="p-4 rounded-xl border border-border/80 bg-background flex items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <p className="text-xs font-bold text-white">{g.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          ₹{g.current.toLocaleString()} / ₹{g.target.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-12 h-12 relative shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" className="stroke-neutral-800" strokeWidth="2.5" />
                          <circle cx="18" cy="18" r="16" fill="none" className={`${g.color} transition-all duration-500`} strokeWidth="3" strokeDasharray={`${percent}, 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-white">{percent}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Recommendations Panel */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lightbulb size={18} className="text-amber-400 animate-pulse-slow" />
              <span>Top 3 AI Recommendations</span>
            </h3>

            {insights.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No insights generated yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.slice(0, 3).map((insight, idx) => {
                  const isLeak = insight.includes("Leak");
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border flex flex-col justify-between text-xs leading-relaxed text-left relative overflow-hidden ${
                        isLeak 
                          ? "border-red-500/20 bg-red-500/[0.01]" 
                          : "border-border bg-black/40"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={13} className="text-primary shrink-0" />
                          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Actionable Suggestion</span>
                        </div>
                        <p className="text-foreground/90 font-medium leading-relaxed">{insight}</p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-border/40 flex justify-between items-center text-[10px] font-mono">
                        <span className={isLeak ? "text-red-400" : "text-emerald-400"}>{isLeak ? "Leakage audit" : "Insight clear"}</span>
                        <span className="text-emerald-400 font-bold">{isLeak ? "Save ₹3,500/mo" : "Safe"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Sidebar Widgets) */}
        <div className="space-y-8">
          
          {/* Upcoming Expense Prediction */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4 text-left">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>Upcoming Expense Predictions</span>
            </h3>

            <div className="space-y-3">
              {upcomingPredictions.map((pred, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border/80 bg-background/50 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-bold text-white leading-normal">{pred.title}</p>
                      <span className="text-[10px] text-primary font-bold font-mono">{pred.due}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white">{pred.amount}</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground flex justify-between items-center pt-1 border-t border-border/40">
                    <span>Audit Status:</span>
                    <span className="text-emerald-400 font-bold">{pred.action}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily planner task previews */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarCheckIcon size={16} className="text-primary" />
                <span>Today's Roadmap Preview</span>
              </h3>
              <Link href="/dashboard/planner" className="text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 font-mono">
                <span>Timeline</span>
                <ChevronRight size={10} />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No active tasks scheduled for today.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 3).map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      task.status === "completed"
                        ? "bg-secondary/15 border-border/40 text-muted-foreground"
                        : "bg-background border-border text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-primary font-bold text-[10px]">
                        {task.start_time 
                          ? new Date(task.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "Immediate"
                        }
                      </span>
                      <p className={`font-semibold ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border font-mono uppercase ${
                      task.priority === "high"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : task.priority === "medium"
                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    }`}>
                      {task.priority}
                    </span>
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

// Subcomponent stub
function CalendarCheckIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 16} 
      height={size || 16} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}
