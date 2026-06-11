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
  CalendarCheck
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

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Study Coach</h1>
          <p className="text-xs text-muted-foreground mt-1">Structure your subject syllabus, log focus completion, and utilize automated spaced repetition.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Overall Syllabus Progress</p>
          <h2 className="text-3xl font-bold text-foreground">{aggregateProgress}%</h2>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${aggregateProgress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            {totalCompletedTopics} of {totalSyllabusTopics} topics checked off
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Active Study Tracks</p>
          <h2 className="text-3xl font-bold text-foreground">{plans.length} Subjects</h2>
          <p className="text-[10px] text-muted-foreground font-mono">Continuous learning modules registered</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">Pending Spaced Reviews</p>
          <h2 className="text-3xl font-bold text-foreground">{activeRevisionsCount} Topics Due</h2>
          <p className="text-[10px] text-muted-foreground font-mono">Review cycles active to prevent memory decay</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Create Subject Track */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-1.5">
              <Plus size={16} className="text-primary" />
              <span>Create Learning Path</span>
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground">Subject / Course Name</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. UPSC Indian Polity, Machine Learning Neural Nets"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-muted-foreground">Total Sub-topics</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={totalTopics}
                    onChange={(e) => setTotalTopics(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-secondary border border-border hover:bg-secondary/80 font-medium text-foreground transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <BookOpen size={14} />}
                <span>Start Study Path</span>
              </button>
            </form>
          </div>
        </div>

        {/* Center & Right Column: Tracks & Revisions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Syllabus Progress Tracker */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
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
                  <div key={p.id} className="p-4 rounded-xl border border-border bg-background/50 space-y-3">
                    <div className="flex justify-between items-start text-xs">
                      <div className="text-left space-y-1">
                        <p className="font-bold text-foreground">{p.subject}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">Target: {p.target_date}</p>
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

                    <div className="space-y-1">
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${p.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{p.progress}% Complete</span>
                        {p.progress === 100 && <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle size={10} /> Certified</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Spaced Repetition Checklist */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
              <CalendarCheck size={18} className="text-amber-400" />
              <span>Spaced Repetition Review Deck</span>
            </h3>

            <div className="p-3 bg-secondary/20 border border-border/60 rounded-xl text-left flex items-start gap-2.5 text-xs">
              <Info className="text-primary w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-muted-foreground leading-relaxed">
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
                          ? "bg-background border-border text-foreground"
                          : "bg-secondary/20 border-border/60 text-muted-foreground"
                      }`}
                    >
                      <div className="text-left space-y-1">
                        <p className={`font-semibold ${!isPending ? "line-through" : ""}`}>{rev.topic}</p>
                        <div className="flex gap-4 text-[10px] text-muted-foreground font-mono">
                          <span>Last checked: {rev.last_reviewed}</span>
                          <span>•</span>
                          <span className={isPending ? "text-primary font-semibold" : ""}>Next due: {rev.next_review}</span>
                        </div>
                      </div>

                      {isPending ? (
                        <button
                          onClick={() => handleCompleteRevision(rev.id)}
                          className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          Mark Reviewed
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><CheckCircle size={12} /> Kept</span>
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
