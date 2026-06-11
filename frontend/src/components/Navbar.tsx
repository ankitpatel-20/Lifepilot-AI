"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { ApiService } from "@/lib/api";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(ApiService.isAuthenticated());
  }, []);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-foreground font-bold text-lg tracking-tight hover:opacity-90">
              <Compass className="text-primary w-6 h-6 animate-pulse-slow" />
              <span>LifePilot <span className="text-primary font-medium">AI</span></span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            ) : null}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/95 transition-colors cursor-pointer shadow-sm shadow-primary/10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-sm shadow-primary/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu panel */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Features
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            Pricing
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary"
            >
              Dashboard
            </Link>
          )}
          <hr className="border-border my-2" />
          <div className="flex flex-col space-y-2 pt-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-2.5 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/95"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-base text-foreground bg-secondary border border-border rounded-lg hover:bg-secondary/80"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2.5 text-base font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
