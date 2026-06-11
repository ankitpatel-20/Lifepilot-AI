"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Compass, 
  LayoutDashboard, 
  Calendar, 
  TrendingDown, 
  BookOpen, 
  BrainCircuit, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Loader2, 
  User,
  Sun,
  Moon
} from "lucide-react";
import { ApiService } from "@/lib/api";
import AICopilot from "@/components/AICopilot";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    const html = document.documentElement;
    if (next === "light") {
      html.className = "light";
    } else {
      html.className = "dark";
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!ApiService.isAuthenticated()) {
        router.push("/login");
        return;
      }

      try {
        const data = await ApiService.getProfile();
        setUser(data.user);
        setLoading(false);
      } catch (err) {
        console.error("Auth layout fetch profile error:", err);
        ApiService.logout();
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    ApiService.logout();
    router.push("/");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Planner", href: "/dashboard/planner", icon: Calendar },
    { name: "Expense Auditor", href: "/dashboard/expenses", icon: TrendingDown },
    { name: "Study Coach", href: "/dashboard/study", icon: BookOpen },
    { name: "Decision Engine", href: "/dashboard/decision", icon: BrainCircuit },
    { name: "Profile Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b]">
        <Loader2 className="animate-spin text-primary w-8 h-8 mb-3" />
        <p className="text-xs text-muted-foreground font-mono">Verifying flight coordinates...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#09090b] grid-bg">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between h-14 border-b border-border bg-[#0c0c0e] px-4 sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center space-x-2 text-foreground font-bold">
          <Compass className="text-primary w-5 h-5" />
          <span className="text-sm">LifePilot AI</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop (Linear / Raycast themed) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-[#0c0c0e]/80 backdrop-blur-md text-left p-6 shrink-0 justify-between h-screen sticky top-0">
        <div className="space-y-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 text-foreground font-bold text-lg hover:opacity-95 transition-opacity">
            <Compass className="text-primary w-6 h-6 animate-pulse-slow" />
            <span className="tracking-tight">LifePilot <span className="text-primary font-medium">AI</span></span>
          </Link>

          {/* Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                      : "text-muted-foreground hover:text-foreground hover:bg-[#1f1f23]/60 hover:scale-[1.01]"
                  }`}
                >
                  <item.icon size={16} className={`${active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="space-y-4 pt-6 border-t border-border/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate">{user?.fullName}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-[#1f1f23]/60 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer font-medium"
            >
              {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/5 hover:text-red-300 text-[11px] flex items-center justify-center gap-1.5 cursor-pointer font-medium"
            >
              <LogOut size={12} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-45 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#0c0c0e] border-r border-border p-6 justify-between h-full z-50 text-left">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2 text-foreground font-bold">
                  <Compass className="text-primary w-5 h-5" />
                  <span className="text-sm">LifePilot AI</span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg border border-border text-muted-foreground"
                >
                  <X size={14} />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{user?.fullName}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toggleTheme();
                    setMobileOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg border border-border text-muted-foreground text-xs flex items-center justify-center gap-1.5"
                >
                  {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 rounded-lg border border-red-500/20 text-red-400 text-xs flex items-center justify-center gap-1.5"
                >
                  <LogOut size={12} />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Dashboard Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* Floating AI Copilot Widget */}
      <AICopilot />
    </div>
  );
}
