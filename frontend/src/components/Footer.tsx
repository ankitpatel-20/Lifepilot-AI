import Link from "next/link";
import { Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-foreground font-bold text-lg">
              <Compass className="text-primary w-5 h-5" />
              <span>LifePilot AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Everyday AI optimizations for productivity, money, learning, and daily planning. Built for the modern Indian lifestyle.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">AI Daily Planner</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Smart Expense Insights</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">User Manual</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Developer API</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Indian Tax Guide</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Study Hacks</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LifePilot AI. All rights reserved. Made in India.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
            <a href="#" className="hover:text-foreground transition-colors">Status</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
