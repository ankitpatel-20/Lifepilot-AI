"use client";

import { useEffect, useState } from "react";
import { 
  Settings, 
  MapPin, 
  IndianRupee, 
  BookOpen, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  User
} from "lucide-react";
import { ApiService } from "@/lib/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  
  // Settings fields
  const [location, setLocation] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [monthlyBudget, setMonthlyBudget] = useState(30000);
  const [learningGoals, setLearningGoals] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await ApiService.getProfile();
        setUser(data.user);
        
        if (data.profile) {
          setLocation(data.profile.location || "Mumbai, India");
          setCurrency(data.profile.currency || "INR");
          setMonthlyBudget(Number(data.profile.monthly_budget) || 30000);
          setLearningGoals(data.profile.learning_goals || "");
        }
      } catch (err) {
        console.error("Load settings error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await ApiService.updateProfile({
        location,
        currency,
        monthlyBudget,
        learningGoals
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="animate-spin text-primary w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-3xl">
      {/* Header */}
      <div className="border-b border-border/40 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Configure your location metrics, budgets, and educational targets.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 flex items-start gap-2 font-mono">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 flex items-start gap-2 font-mono">
          <CheckCircle size={16} className="shrink-0 mt-0.5" />
          <span>Profile configuration saved successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        
        {/* User Identity Info */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
            <User size={16} className="text-primary" />
            <span>Account Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1">
              <span className="text-muted-foreground">Registered Name:</span>
              <p className="text-foreground font-semibold">{user?.fullName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Email Address:</span>
              <p className="text-foreground font-semibold">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Configurations Form */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h3 className="font-semibold text-foreground border-b border-border/40 pb-3 flex items-center gap-2">
            <Settings size={16} className="text-primary" />
            <span>AI Calibration Variables</span>
          </h3>

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground flex items-center gap-1">
                  <MapPin size={12} className="text-primary" />
                  <span>City / Location</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Helps AI contextualize transit paths, traffic gridlocks, and local timing options.
                </p>
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground flex items-center gap-1">
                  <IndianRupee size={12} className="text-primary" />
                  <span>Monthly Budget Goal (₹)</span>
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="500"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  placeholder="30000"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Calibrates wasteful alerts on food deliveries or cab rides.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Currency */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground">Currency Symbol</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="INR">Rupees (₹)</option>
                  <option value="USD">Dollars ($)</option>
                </select>
              </div>

              {/* Study Goals */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground flex items-center gap-1">
                  <BookOpen size={12} className="text-primary" />
                  <span>Study Target / Learning Goals</span>
                </label>
                <input
                  type="text"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  placeholder="e.g. Master Advanced SQL, Prepare for UPSC"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Provides context for AI Study Coach insights and spaced repetitions.
                </p>
              </div>

            </div>

            <div className="border-t border-border/40 pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl text-primary-foreground bg-primary hover:bg-primary/95 transition-all font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <CheckCircle size={14} />
                )}
                <span>Save Configurations</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
