"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckSquare, 
  Square, 
  Loader2, 
  AlertCircle,
  Lightbulb,
  Info,
  CalendarDays,
  Target
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function PlannerPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [durationMins, setDurationMins] = useState(30);

  // AI insights output
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  const fetchTasks = async (targetDate: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.getTasks(targetDate);
      setTasks(res.tasks);
    } catch (err: any) {
      setError(err.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(date);
  }, [date]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await ApiService.createTask({
        title,
        description,
        priority,
        durationMins,
        date
      });
      setTasks([...tasks, res.task]);
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDurationMins(30);
    } catch (err: any) {
      setError(err.message || "Failed to add task.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await ApiService.updateTask(id, { status: nextStatus });
      setTasks(tasks.map(t => t.id === id ? res.task : t));
    } catch (err: any) {
      setError("Failed to update task status.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await ApiService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError("Failed to delete task.");
    }
  };

  const handleOptimize = async () => {
    if (tasks.length === 0) {
      setError("Please add some tasks before optimizing.");
      return;
    }

    setOptimizing(true);
    setError(null);
    try {
      const res = await ApiService.optimizeSchedule(date);
      setTasks(res.tasks);
      setAiInsight(res.insights);
    } catch (err: any) {
      setError(err.message || "Failed to optimize schedule.");
    } finally {
      setOptimizing(false);
    }
  };

  // Compute stats
  const completedTasks = tasks.filter(t => t.status === "completed" && !t.isBreak).length;
  const totalTasks = tasks.filter(t => !t.isBreak).length;
  const ratio = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calendar days helper (generating past 3 and next 3 days)
  const getCalendarDays = () => {
    const arr = [];
    const base = new Date(date);
    for (let i = -3; i <= 3; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      arr.push({
        iso,
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString([], { weekday: "narrow" })
      });
    }
    return arr;
  };
  const calendarDays = getCalendarDays();

  // Focus time analytics calculations (in mins)
  const deepWorkMins = tasks.filter(t => !t.isBreak && t.priority === "high").reduce((acc, curr) => acc + Number(curr.duration_mins), 0);
  const coreStudyMins = tasks.filter(t => !t.isBreak && t.priority === "medium").reduce((acc, curr) => acc + Number(curr.duration_mins), 0);
  const adminMins = tasks.filter(t => !t.isBreak && t.priority === "low").reduce((acc, curr) => acc + Number(curr.duration_mins), 0);
  const breakMins = tasks.filter(t => t.isBreak).reduce((acc, curr) => acc + Number(curr.duration_mins), 0);

  const totalMins = deepWorkMins + coreStudyMins + adminMins + breakMins || 1;
  const deepPercent = Math.round((deepWorkMins / totalMins) * 100);
  const studyPercent = Math.round((coreStudyMins / totalMins) * 100);
  const adminPercent = Math.round((adminMins / totalMins) * 100);
  const breakPercent = Math.round((breakMins / totalMins) * 100);

  return (
    <div className="space-y-8 text-left pb-16 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">AI Daily Planner</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Organize your goals, schedule tasks, and optimize focus blocks.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl text-white font-mono focus:outline-none cursor-pointer"
          />
          <button
            onClick={handleOptimize}
            disabled={optimizing || tasks.length === 0}
            className="btn-primary text-xs font-bold"
          >
            {optimizing ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Sparkles size={14} />}
            <span>Optimize Schedule</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {aiInsight && (
        <div className="p-4 rounded-2xl border border-primary/20 bg-primary/[0.01] flex gap-3 text-xs leading-relaxed">
          <Lightbulb size={18} className="text-primary shrink-0 mt-0.5 animate-float" />
          <div className="space-y-1">
            <p className="font-bold text-white">AI Planner Insights</p>
            <p className="text-muted-foreground">{aiInsight}</p>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* KPI 1: Productivity Score Circular Progress Ring */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 flex items-center justify-between group hover:border-primary/40 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold">Productivity Score</span>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{ratio}%</h3>
            <span className="text-[10px] text-muted-foreground font-mono">Based on completed tasks</span>
          </div>
          <div className="w-14 h-14 relative shrink-0">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-neutral-800" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-primary transition-all duration-500" strokeWidth="3" strokeDasharray={`${ratio}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-extrabold text-white">{ratio}</div>
          </div>
        </div>

        {/* KPI 2: Focus Time allocation bar chart */}
        <div className="rounded-2xl border border-border bg-[#0c0c0e] p-5 space-y-3 group hover:border-primary/40 transition-colors col-span-2 flex flex-col justify-between">
          <p className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider font-bold text-left">Focus Time Allocation</p>
          
          {/* Segmented bar */}
          <div className="w-full bg-[#1f1f23] h-3 rounded-full overflow-hidden flex">
            {deepWorkMins > 0 && <div className="bg-red-500 h-full" style={{ width: `${deepPercent}%` }} title={`Deep work: ${deepPercent}%`} />}
            {coreStudyMins > 0 && <div className="bg-primary h-full" style={{ width: `${studyPercent}%` }} title={`Core study: ${studyPercent}%`} />}
            {adminMins > 0 && <div className="bg-blue-500 h-full" style={{ width: `${adminPercent}%` }} title={`Admin: ${adminPercent}%`} />}
            {breakMins > 0 && <div className="bg-secondary h-full border-l border-white/5" style={{ width: `${breakPercent}%` }} title={`Breaks: ${breakPercent}%`} />}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] font-mono text-muted-foreground font-bold">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Deep Work ({deepWorkMins}m)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Core Study ({coreStudyMins}m)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Admin tasks ({adminMins}m)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary" /> Focus Breaks ({breakMins}m)</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Add Task Form & Calendar View */}
        <div className="space-y-6">
          
          {/* Calendar View grid */}
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4 text-left">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <CalendarDays size={18} className="text-primary" />
              <span>Calendar Navigation</span>
            </h3>

            <div className="grid grid-cols-7 gap-2 text-center text-xs select-none">
              {calendarDays.map((d) => {
                const isActive = d.iso === date;
                return (
                  <button
                    key={d.iso}
                    onClick={() => setDate(d.iso)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary font-bold scale-105"
                        : "bg-background border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-mono">{d.dayName}</span>
                    <span className="text-xs font-mono">{d.dayNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-1.5">
              <Plus size={16} className="text-primary" />
              <span>New Objective</span>
            </h3>
            
            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div className="space-y-1 text-left">
                <label className="text-muted-foreground font-semibold">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Review team architecture"
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none text-xs"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-muted-foreground font-semibold">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add specific sub-goals or notes..."
                  className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none h-18 resize-none text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    step="5"
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-white focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full text-xs font-bold"
              >
                {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus size={14} />}
                <span>Add Task</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Task list & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-[#0c0c0e] p-6 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>Timeline for {new Date(date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="animate-spin text-primary w-6 h-6" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Info size={24} className="text-muted-foreground/60" />
                <p className="font-bold">No tasks configured for this day.</p>
                <p className="text-[10px] font-mono">Add tasks using the form, then click "Optimize" to arrange your AI roadmap.</p>
              </div>
            ) : (
              <div className="relative border-l border-border/60 pl-6 ml-2 space-y-6">
                {tasks.map((task) => {
                  const hasTime = task.start_time && task.end_time;
                  
                  return (
                    <div key={task.id} className="relative group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full border ${
                        task.isBreak
                          ? "bg-secondary border-muted-foreground"
                          : task.status === "completed"
                          ? "bg-primary border-primary"
                          : "bg-background border-border group-hover:border-primary"
                      } transition-colors`} />

                      {/* Timeline Content */}
                      <div className={`p-4 rounded-xl border bg-background/50 hover:bg-background transition-colors flex items-center justify-between text-xs gap-4 ${
                        task.status === "completed" ? "border-border/45 opacity-80" : "border-border"
                      }`}>
                        <div className="flex items-start gap-3 text-left">
                          {!task.isBreak && (
                            <button
                              onClick={() => handleToggleStatus(task.id, task.status)}
                              className="mt-0.5 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                            >
                              {task.status === "completed" ? (
                                <CheckSquare size={16} className="text-primary" />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          )}
                          <div>
                            <p className={`font-bold text-white ${
                              task.status === "completed" && !task.isBreak ? "line-through text-muted-foreground font-semibold" : ""
                            }`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed font-semibold">{task.description}</p>
                            )}
                            
                            <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-muted-foreground font-bold">
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                <span>{task.duration_mins}m</span>
                              </span>
                              
                              {hasTime && (
                                <span className="text-primary font-bold">
                                  {new Date(task.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {" - "}
                                  {new Date(task.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {!task.isBreak && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono ${
                              task.priority === "high"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : task.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            }`}>
                              {task.priority}
                            </span>
                          )}

                          {!task.isBreak && (
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-secondary cursor-pointer transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Delete objective"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
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
