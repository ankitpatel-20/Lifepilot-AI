# LifePilot AI 🚀

> A premium, venture-grade SaaS lifestyle optimization suite designed to elevate your daily productivity, financial health, and learning outcomes.

LifePilot AI combines a sleek, high-fidelity dark dashboard (inspired by Linear and Stripe aesthetics) with an intelligent AI Copilot. It helps users manage their schedules, audit wasteful expenses, optimize study routines using spaced repetition, and make smarter daily lifestyle choices.

---

## 🎨 Premium Visual Aesthetics
* **Linear-Inspired Dark Theme**: Calibrated `#09090b` canvas backgrounds, `#0c0c0e` glassmorphic cards, and purple/pink neon glowing accents.
* **Spotlight AI Copilot Widget**: A globally mounted, floating command-bar console with interactive shortcut chips and mic recording voice animations.
* **Native SVG Visualizations**: High-fidelity, animated inline SVG charts showing weekly productivity scores, expense audits, calendar streaks, and health gauges.

---

## ⚡ Tech Stack & Architecture

### **Frontend**
* **Framework**: Next.js 15 (React 19, App Router)
* **Styling**: Tailwind CSS v4 (Global CSS variable design system)
* **Icons**: Lucide React

### **Backend**
* **Runtime**: Node.js, Express, TypeScript (`ts-node-dev`)
* **AI Engine**: OpenAI API (`gpt-4o-mini`) with a highly resilient Local Keyword-based Decision Tree fallback.
* **Database**: PostgreSQL connection pool with an automatic In-Memory database fallback mode for instant local testing.

---

## 🛠️ Feature Modules

1. **AI Spotlight Copilot**: A command-bar widget to parse scheduling commands (e.g., *"optimize schedule"*), log expenditures (e.g., *"Spent ₹450 on Swiggy"*), or consult the Decision Engine.
2. **AI Daily Planner**: Dynamically schedules, reorganizes, and prioritizes tasks, assigning focus scores and structured time slots.
3. **Outflow Financial Audit**: Identifies budget leaks (like food delivery markups or app-cab premiums) and logs savings suggestions.
4. **Study Coach & Spaced Revision**: Translates learning targets into active revision queues based on spaced-repetition schedules.
5. **Lifestyle Decision Engine**: Offers advice tailored to the Indian context, helping users evaluate EMIs, transport choices, and wellness habits.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd lifepilot-ai

# Install Frontend dependencies
cd frontend
npm install

# Install Backend dependencies
cd ../backend
npm install
```

### 2. Configure Environment variables
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/lifepilot_db
JWT_SECRET=your-super-secret-key
OPENAI_API_KEY=sk-proj-your-openai-api-key
```

### 3. Run Development Servers
* **Backend API Server**:
  ```bash
  cd backend
  npm run dev
  ```
  *(Runs on [http://localhost:5000](http://localhost:5000))*

* **Next.js Frontend**:
  ```bash
  cd frontend
  npm run dev
  ```
  *(Runs on [http://localhost:3000](http://localhost:3000))*

### 4. Live Demo Access
Log in instantly using the built-in developer credentials:
* **Email**: `ankit@lifepilot.ai`
* **Password**: `admin123`
