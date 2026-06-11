import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifePilot AI | The Everyday AI Innovator",
  description: "AI-powered lifestyle assistant for daily planning, automated financial budgeting, study coach scheduling, and everyday decision trees. Built for modern Indian life.",
  keywords: ["LifePilot AI", "AI Planner", "Indian Budget Tracker", "Spaced Repetition Coach", "Daily Decision Assistant"],
  authors: [{ name: "LifePilot Team" }],
  openGraph: {
    title: "LifePilot AI | Life, Made Better",
    description: "Optimize productivity, money, learning, and daily decisions in one slick workspace.",
    type: "website",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.className = theme + ' ' + '${geistSans.variable}' + ' ' + '${geistMono.variable}' + ' h-full antialiased';
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
