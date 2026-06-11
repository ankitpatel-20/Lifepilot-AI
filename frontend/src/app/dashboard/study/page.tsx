"use client";

import { useEffect, useState } from "react";
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  Minus, 
  CheckCircle, 
  Clock, 
  Loader2, 
  AlertCircle, 
  TrendingUp,
  FileText,
  Info,
  CalendarCheck,
  Flame,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function StudyCoachPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New plan form state
  const [subject, setSubject] = useState("");
  const [totalTopics, setTotalTopics] = useState(5);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // 2 weeks default
    return d.toISOString().split("T")[0];
  });

  const fetchStudyData = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getStudyDashboard();
      setPlans(res.plans);
      setRevisions(res.revisions);
    } catch (err) {
      console.error("Load study data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyData();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await ApiService.createStudyPlan({
        subject,
        totalTopics,
        targetDate
      });
      setPlans([res.plan, ...plans]);
      setSubject("");
      setTotalTopics(5);
    } catch (err: any) {
      setError(err.message || "Failed to create study path.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncrementProgress = async (id: string, currentVal: number, total: number) => {
    if (currentVal >= total) return;
    const nextVal = currentVal + 1;
    try {
      const res = await ApiService.updateStudyProgress(id, nextVal, total);
      setPlans(plans.map(p => p.id === id ? res.plan : p));
      
      // If we finished a milestone, fetch dashboard again to load the new auto-generated revision
      if (nextVal > currentVal) {
        const freshData = await ApiService.getStudyDashboard();
        setRevisions(freshData.revisions);
      }
    } catch (err) {
      setError("Failed to update study progress.");
    }
  };

  const handleDecrementProgress = async (id: string, currentVal: number, total: number) => {
    if (currentVal <= 0) return;
    const nextVal = currentVal - 1;
    try {
      const res = await ApiService.updateStudyProgress(id, nextVal, total);
      setPlans(plans.map(p => p.id === id ? res.plan : p));
    } catch (err) {
      setError("Failed to update study progress.");
    }
  };

  const handleCompleteRevision = async (id: string) => {
    try {
      const res = await ApiService.completeRevision(id);
      setRevisions(revisions.map(r => r.id === id ? res.revision : r));
    } catch (err) {
      setError("Failed to complete revision milestone.");
    }
  };

  // Compute overall study efficiency
  const totalCompletedTopics = plans.reduce((acc, curr) => acc + curr.topics_completed, 0);
  const totalSyllabusTopics = plans.reduce((acc, curr) => acc + curr.total_topics, 0);
  const aggregateProgress = totalSyllabusTopics > 0 ? Math.round((totalCompletedTopics / totalSyllabusTopics) * 100) : 0;

  const activeRevisionsCount = revisions.filter(r => r.status === "pending").length;

  // Study Streak Helper
  const streakDays = ["M", "T", "W", "T", "F", "S", "S"];

  // Weekly study consistency data (M-S hours spent/milestones)
  const studyConsistencyData = [
    { label: "M", value: 3.5 },
    { label: "T", value: 4.8 },
    { label: "W", value: 2.0 },
    { label: "T", value: 5.5 },
    { label: "F", value: 4.0 },
    { label: "S", value: 6.2 },
    { label: "S", value: totalCompletedTopics > 0 ? totalCompletedTopics * 1.5 : 4.5 }
  ];

  // Learning Progress SVG Area Chart
  const learningProgressPoints = [
    { label: "Mon", score: 35 },
    { label: "Tue", score: 48 },
    { label: "Wed", score: 40 },
    { label: "Thu", score: 65 },
    { label: "Fri", score: 58 },
    { label: "Sat", score: 80 },
    { label: "Sun", score: aggregateProgress > 0 ? aggregateProgress : 70 }
  ];
  const maxProgressScore = 100;
  const progressSvgPoints = learningProgressPoints.map((pt, idx) => {
    const x = 40 + idx * 60;
    const y = 140 - ((pt.score / maxProgressScore) * 100);
    return { x, y, label: pt.label, score: pt.score };
  });

  const lineD = progressSvgPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${lineD} L ${progressSvgPoints[progressSvgPoints.length - 1].x} 140 L ${progressSvgPoints[0].x} 140 Z`;

  // Dynamic predicted completion date
  const getPredictedCompletion = () => {
    if (plans.length === 0) {
      return {
        date: "No active tracks",
        status: "N/A",
        isAhead: true
      };
    }
    const target = new Date(plans[0].target_date);
    // Simulate study velocity (1.2x target speed)
    const daysRemaining = Math.max(2, Math.round((plans[0].total_topics - plans[0].topics_completed) * 2.5));
    const predicted = new Date();
    predicted.setDate(predicted.getDate() + daysRemaining);
    
    const isAhead = predicted.getTime() < target.getTime();
    const diffDays = Math.round(Math.abs(target.getTime() - predicted.getTime()) / (1000 * 60 * 60 * 24));

    return {
      date: predicted.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
      status: isAhead ? `${diffDays} days ahead of target!` : `${diffDays} days behind target`,
      isAhead
    };
  };

  const prediction = getPredictedCompletion();

  return (
    <div className="space-y-8 text-left pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">AI Study Coach</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Structure your subject syllabus, log focus completion, and utilize automated spaced repetition.</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 space-y-3 group hover:border-primary/40 transition-colors">
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Overall Syllabus Progress</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{aggregateProgress}%</h2>
          <div className="w-full bg-[#1f1f23] h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${aggregateProgress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono font-bold">
            {totalCompletedTopics} of {totalSyllabusTopics} sub-topics completed
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 space-y-3 group hover:border-primary/40 transition-colors">
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Active Learning Tracks</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{plans.length} Subjects</h2>
          <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-[10px] text-primary leading-relaxed font-mono text-left font-bold flex items-center justify-between">
            <span>Continuous learning modules active</span>
            <BookOpen size={12} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 space-y-3 group hover:border-primary/40 transition-colors">
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Pending Spaced Reviews</p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">{activeRevisionsCount} Topics Due</h2>
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[10px] text-amber-400 leading-relaxed font-mono text-left font-bold flex items-center justify-between">
            <span>Review cycles active to prevent memory decay</span>
            <Flame size={12} className="animate-float" />
          </div>
        </div>
      </div>

      {/* SVG Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Learning Progress area chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-border/40 pb-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                <span>Learning Progress Graph</span>
              </h3>
              <p className="text-xs text-muted-foreground">Cumulative retention score mapping over the week</p>
            </div>
            <span className="text-[10px] text-primary font-mono font-bold">MON - SUN</span>
          </div>

          <div className="relative h-44 w-full select-none pt-2">
            <svg className="w-full h-full" viewBox="0 0 440 140" preserveAspectRatio="none">
              <line x1="40" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="40" y1="139" x2="400" y2="139" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              
              {/* Fill Area */}
              <path d={areaD} fill="url(#study-area-grad)" className="opacity-20" />
              
              {/* Line path */}
              <path d={lineD} fill="none" stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" />

              <defs>
                <linearGradient id="study-area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Dot nodes */}
              {progressSvgPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#0c0c0e"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:r-6 transition-all"
                />
              ))}
            </svg>
            <div className="flex justify-between text-[11px] text-muted-foreground font-mono px-8 pt-1.5">
              {learningProgressPoints.map((pt, idx) => <span key={idx} className="font-semibold">{pt.label}</span>)}
            </div>
          </div>
        </div>

        {/* Weekly Study Consistency Chart (Hours per Day) */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <span>Study Consistency Chart</span>
            </h3>
            <p className="text-xs text-muted-foreground">Study focus hours tracked daily</p>
          </div>

          <div className="relative h-44 w-full select-none pt-2">
            <svg className="w-full h-full" viewBox="0 0 240 140" preserveAspectRatio="none">
              <line x1="20" y1="20" x2="220" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="70" x2="220" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="20" y1="120" x2="220" y2="120" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

              {studyConsistencyData.map((d, idx) => {
                const x = 30 + idx * 27;
                const barH = Math.min(100, Math.round((d.value / 8) * 100));
                return (
                  <rect
                    key={idx}
                    x={x}
                    y={120 - barH}
                    width="11"
                    height={barH}
                    rx="3.5"
                    fill="#8b5cf6"
                    className="hover:fill-fuchsia-500 transition-colors cursor-pointer"
                  />
                );
              })}
            </svg>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono px-4 pt-1.5">
              {studyConsistencyData.map((d, idx) => <span key={idx} className="font-semibold">{d.label}</span>)}
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create Subject Track */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-1.5">
              <Plus size={16} className="text-primary" />
              <span>Create Learning Path</span>
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="space-y-1 text-left">
                <label className="text-muted-foreground font-semibold">Subject / Course Name</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. UPSC Indian Polity, Machine Learning Neural Nets"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Total Sub-topics</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={totalTopics}
                    onChange={(e) => setTotalTopics(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none cursor-pointer font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-xs font-bold"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <BookOpen size={14} />}
                <span>Start Study Path</span>
              </button>
            </form>
          </div>

          {/* AI Completion Date Predictor badge */}
          {plans.length > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 space-y-3 text-left relative overflow-hidden glow-purple">
              <span className="text-[10px] text-primary font-mono font-bold uppercase tracking-wider">AI Forecast Engine</span>
              <h4 className="text-sm font-bold text-white">Syllabus Completion Date</h4>
              <div className="space-y-1">
                <p className="text-lg font-extrabold text-white font-mono">{prediction.date}</p>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border inline-block ${
                  prediction.isAhead 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {prediction.status}
                </span>
              </div>
            </div>
          )}

          {/* Study Streak Visualization Calendar */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4 text-left">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <Flame size={18} className="text-rupee-saffron animate-float" />
              <span>Syllabus Streak Visualizer</span>
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Active Streak Count:</span>
                <span className="text-white font-mono font-extrabold flex items-center gap-0.5">🔥 6 Days</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono">
                {streakDays.map((d, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border ${
                      idx < 6
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "bg-secondary/40 border-border text-muted-foreground"
                    }`}>
                      {idx < 6 ? "✓" : ""}
                    </div>
                    <span className="text-muted-foreground font-bold">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Center & Right Column: Tracks & Revisions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Syllabus Progress Tracker */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <span>Active Syllabus Cockpit</span>
            </h3>

            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>
            ) : plans.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No active study courses registered. Start one on the left.</p>
            ) : (
              <div className="space-y-6">
                {plans.map((p) => (
                  <div key={p.id} className="p-4.5 rounded-xl border border-border bg-background/50 space-y-4 text-left">
                    <div className="flex justify-between items-start text-xs">
                      <div className="text-left space-y-1">
                        <p className="font-extrabold text-white text-sm leading-normal">{p.subject}</p>
                        <p className="text-[10px] text-muted-foreground font-mono font-semibold">Target: {p.target_date}</p>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1 border border-border">
                        <button
                          onClick={() => handleDecrementProgress(p.id, p.topics_completed, p.total_topics)}
                          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          aria-label="Decrement progress"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-semibold px-2 font-mono">{p.topics_completed} / {p.total_topics}</span>
                        <button
                          onClick={() => handleIncrementProgress(p.id, p.topics_completed, p.total_topics)}
                          className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                          aria-label="Increment progress"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="space-y-2">
                      <div className="w-full bg-[#1f1f23] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${p.progress}%` }} />
                      </div>
                      
                      {/* Subject completion analytics visual matrix */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[...Array(p.total_topics)].map((_, topicIdx) => {
                          const isDone = topicIdx < p.topics_completed;
                          return (
                            <div 
                              key={topicIdx}
                              className={`w-4 h-4 rounded-md border text-[9px] font-mono font-extrabold flex items-center justify-center ${
                                isDone 
                                  ? "bg-primary border-primary text-primary-foreground" 
                                  : "bg-secondary/40 border-border/80 text-muted-foreground"
                              }`}
                            >
                              {topicIdx + 1}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono font-bold pt-1.5">
                        <span>{p.progress}% Complete</span>
                        {p.progress === 100 && (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle size={10} /> Certified Complete
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spaced Repetition Checklist */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <CalendarCheck size={18} className="text-amber-400" />
              <span>Spaced Repetition Review Deck</span>
            </h3>

            <div className="p-4 bg-secondary/20 border border-border/60 rounded-xl text-left flex items-start gap-2.5 text-xs">
              <Info className="text-primary w-4.5 h-4.5 shrink-0 mt-0.5" />
              <p className="text-muted-foreground leading-relaxed leading-normal">
                LifePilot's Spaced Repetition engine schedules target reviews at **3-day** and **7-day** intervals when you log progress. Mark them reviewed when you run active revisions to lock facts in memory.
              </p>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-primary w-5 h-5" /></div>
            ) : revisions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No active revision cards scheduled. They will auto-generate as you check off syllabus sub-topics.</p>
            ) : (
              <div className="space-y-3">
                {revisions.map((rev) => {
                  const isPending = rev.status === "pending";
                  
                  return (
                    <div 
                      key={rev.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isPending
                          ? "bg-background border-border text-white"
                          : "bg-secondary/20 border-border/60 text-muted-foreground"
                      }`}
                    >
                      <div className="text-left space-y-1">
                        <p className={`font-semibold ${!isPending ? "line-through text-muted-foreground font-bold" : ""}`}>{rev.topic}</p>
                        <div className="flex gap-4 text-[10px] text-muted-foreground font-mono font-bold">
                          <span>Last checked: {rev.last_reviewed}</span>
                          <span>•</span>
                          <span className={isPending ? "text-primary font-bold" : ""}>Next due: {rev.next_review}</span>
                        </div>
                      </div>

                      {isPending ? (
                        <button
                          onClick={() => handleCompleteRevision(rev.id)}
                          className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-[10px] font-bold transition-all cursor-pointer text-white"
                        >
                          Mark Reviewed
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={12} /> Re-established</span>
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
