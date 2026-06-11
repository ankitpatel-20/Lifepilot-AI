"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { ApiService } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ApiService.login(email, password);
      // Success: redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center grid-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center space-x-2 text-foreground font-bold hover:opacity-90">
          <Compass className="text-primary w-5 h-5" />
          <span className="text-sm">LifePilot AI</span>
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl bg-card border border-border/80 shadow-2xl backdrop-blur-sm relative">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary mb-2">
            <Compass size={24} className="animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">Sign in to access your personalized cockpit</p>
        </div>

        {/* Demo Credentials Tip */}
        <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-2.5 text-xs text-left">
          <AlertCircle className="text-primary w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-primary">Instant Demo Login</p>
            <p className="text-muted-foreground mt-0.5">Use email <strong className="text-foreground">ankit@lifepilot.ai</strong> and password <strong className="text-foreground">admin123</strong> to log in with seed data.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 text-left font-mono">
            ⚠️ {error}
          </div>
        )}

        <form className="mt-8 space-y-6 text-left" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary bg-background border-border rounded focus:ring-primary cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-muted-foreground cursor-pointer">Remember me</label>
            </div>
            <a href="#" className="font-medium text-primary hover:text-primary/80 transition-colors">Forgot password?</a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-primary-foreground bg-primary hover:bg-primary/95 focus:outline-none transition-all shadow-md shadow-primary/10 disabled:opacity-75 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin w-5 h-5 text-primary-foreground" />
              ) : (
                <span className="flex items-center gap-1.5">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
