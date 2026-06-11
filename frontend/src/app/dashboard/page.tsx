"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Calendar, 
  TrendingDown, 
  BookOpen, 
  BrainCircuit, 
  MapPin, 
  IndianRupee,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Flame,
  Plus
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
  const budgetLimit = profile?.monthly_budget || 30000;
  const budgetProgress = Math.min(100, Math.round((totalExpenseAmount / budgetLimit) * 100));

  const activeStudyName = studyPlans.length > 0 ? studyPlans[0].subject : "No active course";
  const activeStudyProgress = studyPlans.length > 0 ? studyPlans[0].progress : 0;

  // AI lifestyle score helper
  const healthScore = profile?.productivity_score || 82;

  // Mock static values for SVGs (Stripe / Linear styled charts)
  const lineChartPoints = "10,90 60,75 110,80 160,55 210,40 260,35 310,20";
  const linePointsArr = [
    { cx: 10, cy: 90, val: 55, label: "M" },
    { cx: 60, cy: 75, val: 65, label: "T" },
    { cx: 110, cy: 80, val: 60, label: "W" },
    { cx: 160, cy: 55, val: 75, label: "T" },
    { cx: 210, cy: 40, val: 85, label: "F" },
    { cx: 260, cy: 35, val: 90, label: "S" },
    { cx: 310, cy: 20, val: 98, label: "S" }
  ];

  const barChartData = [
    { label: "Wk 1", spent: 4800, budget: 7500 },
    { label: "Wk 2", spent: 6200, budget: 7500 },
    { label: "Wk 3", spent: 3900, budget: 7500 },
    { label: "Wk 4", spent: 8500, budget: 7500 }
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse text-left">
        <div className="h-16 bg-secondary rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary rounded-2xl border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-secondary rounded-2xl border border-border" />
          <div className="h-96 bg-secondary rounded-2xl border border-border" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Premium AI Welcome Panel */}
      <section className="relative rounded-3xl border border-border bg-[#0c0c0e] p-6 sm:p-8 overflow-hidden glow-purple">
        <div className="absolute -top-1/4 -right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold font-mono uppercase tracking-wider">
              <Flame size={12} className="animate-float" />
              <span>🔥 7-Day Target Streak</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{profile?.user?.fullName || "Ankit"}</span>
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Your Daily Cockpit is calibrated. Optimize your timelines, check off study goals, and monitor leakages to improve your lifestyle score.
            </p>
          </div>

          {/* Health Score Circular SVG Meter */}
          <div className="flex items-center gap-4 bg-background/50 border border-border/80 p-4 rounded-2xl w-fit">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-[#1c1c22]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary"
                  strokeWidth="3.5"
                  strokeDasharray={`${healthScore}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-extrabold text-foreground">
                {healthScore}
              </div>
            </div>
            <div className="text-left font-mono">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Lifestyle</p>
              <p className="text-xs font-bold text-foreground">Health Score</p>
              <span className="text-[9px] text-primary font-bold">Optimal Rank 🚀</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main KPI Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Planner Summary */}
        <Link href="/dashboard/planner" className="rounded-2xl border border-border bg-card p-5 card-hover relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Daily Roadmap</span>
              <h3 className="text-xl font-bold text-foreground">{completedTasksCount} / {totalTasksCount} Completed</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
              <Calendar size={16} />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="w-full bg-[#1c1c22] h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${taskProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
              <span>{taskProgress}% Targets Mastered</span>
              <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Expense Gauge */}
        <Link href="/dashboard/expenses" className="rounded-2xl border border-border bg-card p-5 card-hover relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Active Outflow</span>
              <h3 className="text-xl font-bold text-foreground">₹{totalExpenseAmount.toLocaleString("en-IN")}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="w-full bg-[#1c1c22] h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${budgetProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
              <span>{budgetProgress}% of ₹{budgetLimit.toLocaleString("en-IN")} Limit</span>
              <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </Link>

        {/* Study Analytics */}
        <Link href="/dashboard/study" className="rounded-2xl border border-border bg-card p-5 card-hover relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wider">Learning Curve</span>
              <h3 className="text-xl font-bold text-foreground truncate max-w-[140px]">{activeStudyName}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/15">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="w-full bg-[#1c1c22] h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${activeStudyProgress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
              <span>{activeStudyProgress}% Mastered</span>
              <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </Link>

      </div>

      {/* Modern Data Visualization Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Charts Panel) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Weekly Productivity Graph (SVG Line Graph) */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-primary" />
                  <span>Productivity Vector</span>
                </span>
                <span className="text-[9px] text-primary font-mono font-bold">MON - SUN</span>
              </div>

              {/* SVG Line Graph */}
              <div className="relative h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 320 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  
                  {/* Glowing line paths */}
                  <path
                    d={`M ${lineChartPoints}`}
                    fill="none"
                    stroke="url(#line-glow)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="line-glow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>

                  {/* Dot points */}
                  {linePointsArr.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.cx}
                      cy={pt.cy}
                      r="3.5"
                      className="fill-background stroke-primary hover:r-5 transition-all cursor-pointer"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-1">
                {linePointsArr.map((pt, i) => <span key={i}>{pt.label}</span>)}
              </div>
            </div>

            {/* Expense Weekly comparison (SVG Bar Graph) */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-border/40 pb-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <TrendingDown size={14} className="text-emerald-500" />
                  <span>Outflow Milestones</span>
                </span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">Wk 1 - Wk 4</span>
              </div>

              {/* SVG Bar Chart */}
              <div className="relative h-44 w-full">
                <svg className="w-full h-full" viewBox="0 0 320 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="30" x2="320" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                  {/* Draw bars */}
                  {barChartData.map((data, idx) => {
                    const x = 35 + idx * 75;
                    const limitH = 50; // Target
                    const spentH = Math.min(80, Math.round((data.spent / 10000) * 80));
                    
                    return (
                      <g key={idx} className="cursor-pointer">
                        {/* Target Line boundary */}
                        <line x1={x - 20} y1={100 - limitH} x2={x + 20} y2={100 - limitH} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3" />
                        {/* Spent Bar */}
                        <rect
                          x={x - 8}
                          y={100 - spentH}
                          width="16"
                          height={spentH}
                          rx="3.5"
                          ry="3.5"
                          className={`${
                            data.spent > data.budget 
                              ? "fill-red-500/80 hover:fill-red-500" 
                              : "fill-emerald-500/70 hover:fill-emerald-500"
                          } transition-all`}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-4">
                {barChartData.map((d, i) => <span key={i}>{d.label}</span>)}
              </div>
            </div>

          </div>

          {/* Today's Roadmap Dashboard Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border/40 pb-3">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <Calendar size={18} className="text-primary" />
                <span>Today's Roadmap Schedule</span>
              </h3>
              <Link href="/dashboard/planner" className="text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-mono">
                <span>View Full Timeline</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No objectives tracked for today. Go to the AI Planner to schedule.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.slice(0, 4).map((task) => (
                  <div 
                    key={task.id} 
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      task.status === "completed"
                        ? "bg-secondary/20 border-border/50 text-muted-foreground"
                        : "bg-background border-border text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-primary font-bold">
                        {task.start_time 
                          ? new Date(task.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "Immediate"
                        }
                      </span>
                      <div className="text-left">
                        <p className={`font-semibold ${task.status === "completed" ? "line-through" : ""}`}>{task.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{task.duration_mins} mins</p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono uppercase ${
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

        {/* Right Column (Insights & Side Actions Panel) */}
        <div className="space-y-8">
          
          {/* Streak system panel */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2 text-sm">
              <Flame size={18} className="text-rupee-saffron animate-float" />
              <span>Target Streak Engine</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Daily Target Streak:</span>
                <span className="text-foreground font-mono font-bold flex items-center gap-0.5">🔥 7 Days</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono select-none">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${
                      i < 5 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : i === 5 
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/40 border-border text-muted-foreground"
                    }`}>
                      {i < 6 ? "✓" : ""}
                    </div>
                    <span className="text-muted-foreground">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights panel */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 text-left">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2 text-sm">
              <Lightbulb size={18} className="text-amber-400 animate-pulse-slow" />
              <span>AI Recommendations Feed</span>
            </h3>

            {insights.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No insights generated yet.</p>
            ) : (
              <div className="space-y-3.5">
                {insights.map((insight, idx) => {
                  const isLeak = insight.includes("Leak");
                  return (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed text-left relative overflow-hidden ${
                        isLeak 
                          ? "border-rupee-saffron/20 bg-rupee-saffron/[0.01]" 
                          : "border-border bg-secondary/35"
                      }`}
                    >
                      <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{insight}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Decision Engine promo box */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 space-y-4 text-left relative overflow-hidden glow-purple">
            <div className="space-y-2">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <BrainCircuit size={16} className="text-primary" />
                <span>AI Decision Engine</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Facing an everyday choice? Let the AI Pilot calculate costs, evaluate budget trade-offs, and recommend the best roadmap.
              </p>
            </div>
            <Link
              href="/dashboard/decision"
              className="inline-flex w-full items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/95 transition-all shadow shadow-primary/10 cursor-pointer"
            >
              <span>Ask Decision Engine</span>
              <ChevronRight size={12} />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
