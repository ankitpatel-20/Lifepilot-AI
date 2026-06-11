// Frontend API Client with Graceful Local Storage Fallback
const BACKEND_URL = 'http://localhost:5000/api';

// Check if window/localStorage is available (Next.js SSR guard)
const isBrowser = typeof window !== 'undefined';

const getStoredToken = (): string | null => {
  return isBrowser ? localStorage.getItem('lifepilot_token') : null;
};

const setStoredToken = (token: string) => {
  if (isBrowser) localStorage.setItem('lifepilot_token', token);
};

const removeStoredToken = () => {
  if (isBrowser) localStorage.removeItem('lifepilot_token');
};

// ==========================================
// In-Browser State Fallback (Local Database)
// ==========================================
const initLocalDb = () => {
  if (!isBrowser) return;
  if (!localStorage.getItem('lp_local_db_init')) {
    localStorage.setItem('lp_local_db_init', 'true');
    localStorage.setItem('lp_profile', JSON.stringify({
      location: 'Bengaluru, India',
      monthly_budget: 35000,
      learning_goals: 'Prepare for UPSC Exam, learn Machine Learning',
      currency: 'INR',
      productivity_score: 82
    }));
    
    localStorage.setItem('lp_tasks', JSON.stringify([
      {
        id: 'mock-t1',
        title: 'Review daily team objectives',
        description: 'Sync up on frontend/backend tasks for the sprint.',
        priority: 'medium',
        duration_mins: 30,
        status: 'completed',
        start_time: new Date(new Date().setHours(9, 30, 0)).toISOString(),
        end_time: new Date(new Date().setHours(10, 0, 0)).toISOString(),
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: 'mock-t2',
        title: 'Draft system architecture docs',
        description: 'Work on database design schema and endpoints mapping.',
        priority: 'high',
        duration_mins: 90,
        status: 'pending',
        start_time: new Date(new Date().setHours(11, 0, 0)).toISOString(),
        end_time: new Date(new Date().setHours(12, 30, 0)).toISOString(),
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: 'mock-t3',
        title: 'Evening walk & health reset',
        description: 'Walk in Cubbon Park, drink sugar-free coconut water.',
        priority: 'low',
        duration_mins: 45,
        status: 'pending',
        start_time: new Date(new Date().setHours(18, 0, 0)).toISOString(),
        end_time: new Date(new Date().setHours(18, 45, 0)).toISOString(),
        date: new Date().toISOString().split('T')[0],
      }
    ]));

    localStorage.setItem('lp_expenses', JSON.stringify([
      {
        id: 'mock-e1',
        amount: 450.00,
        category: 'Food',
        description: 'Zomato dinner delivery - Paneer Biryani',
        date: new Date().toISOString().split('T')[0],
        is_wasteful: true,
        savings_insight: 'Ordering dinner online twice in a row. Consider cooking or local tiffin service to save ₹300.'
      },
      {
        id: 'mock-e2',
        amount: 80.00,
        category: 'Transport',
        description: 'Namma Metro card auto-recharge',
        date: new Date().toISOString().split('T')[0],
        is_wasteful: false,
        savings_insight: 'Metro is highly cost-effective compared to App cabs (saved ~₹250).'
      },
      {
        id: 'mock-e3',
        amount: 12000.00,
        category: 'Rent',
        description: 'PG accommodation monthly deposit',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        is_wasteful: false,
        savings_insight: 'Fixed cost. Great deal for current location.'
      }
    ]));

    localStorage.setItem('lp_study', JSON.stringify({
      plans: [
        {
          id: 'mock-s1',
          subject: 'UPSC General Studies - Indian Polity',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: 40,
          topics_completed: 4,
          total_topics: 10
        },
        {
          id: 'mock-s2',
          subject: 'Machine Learning - Neural Networks',
          target_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: 60,
          topics_completed: 3,
          total_topics: 5
        }
      ],
      revisions: [
        {
          id: 'mock-r1',
          topic: 'Fundamental Rights - Constitution Art 14-18',
          last_reviewed: new Date().toISOString().split('T')[0],
          next_review: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        },
        {
          id: 'mock-r2',
          topic: 'Backpropagation algorithm math',
          last_reviewed: new Date().toISOString().split('T')[0],
          next_review: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        }
      ]
    }));

    localStorage.setItem('lp_decisions', JSON.stringify([]));
  }
};

if (isBrowser) initLocalDb();

// Request Helper
const apiRequest = async (method: string, path: string, body?: any) => {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (err: any) {
    // Check if network failed or server offline
    if (err.message.includes('Failed to fetch') || err.message.includes('network') || err.message.includes('HTTP error 500')) {
      console.warn("Backend server offline. Performing request via Local Fallback mode.");
      return handleLocalRequest(method, path, body);
    }
    throw err;
  }
};

// Stateful client-side simulator
const handleLocalRequest = (method: string, path: string, body?: any) => {
  if (!isBrowser) return null;

  const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
  const setLocal = (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val));

  // Authentication
  if (path === '/auth/login') {
    const { email } = body;
    setStoredToken('mock-user-token');
    return {
      token: 'mock-user-token',
      user: { id: 'd3b07384-d113-4956-a5cc-e0e64c238b6d', email, fullName: 'Ankit Kumar' }
    };
  }
  if (path === '/auth/register') {
    const { email, fullName } = body;
    setStoredToken('mock-user-token');
    return {
      token: 'mock-user-token',
      user: { id: 'd3b07384-d113-4956-a5cc-e0e64c238b6d', email, fullName }
    };
  }
  if (path === '/auth/me') {
    const profile = JSON.parse(localStorage.getItem('lp_profile') || '{}');
    return {
      user: { id: 'd3b07384-d113-4956-a5cc-e0e64c238b6d', email: 'ankit@lifepilot.ai', fullName: 'Ankit Kumar' },
      profile
    };
  }

  // Profile
  if (path === '/profile/update' && method === 'PUT') {
    const current = JSON.parse(localStorage.getItem('lp_profile') || '{}');
    const updated = { ...current, ...body };
    localStorage.setItem('lp_profile', JSON.stringify(updated));
    return { profile: updated };
  }

  // Planner
  if (path.startsWith('/planner/tasks')) {
    const tasks = getLocal('lp_tasks');
    if (method === 'GET') {
      const { date } = body || {};
      const filterDate = date || new Date().toISOString().split('T')[0];
      return { tasks: tasks.filter((t: any) => t.date === filterDate) };
    }
    if (method === 'POST') {
      const newTask = {
        ...body,
        id: `local-t-${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      tasks.push(newTask);
      setLocal('lp_tasks', tasks);
      return { task: newTask };
    }
    if (method === 'PUT') {
      const id = path.split('/').pop();
      const idx = tasks.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...body };
        if (body.startTime) {
          tasks[idx].start_time = body.startTime;
          tasks[idx].end_time = new Date(new Date(body.startTime).getTime() + tasks[idx].duration_mins * 60 * 1000).toISOString();
        }
        setLocal('lp_tasks', tasks);
        return { task: tasks[idx] };
      }
    }
    if (method === 'DELETE') {
      const id = path.split('/').pop();
      const filtered = tasks.filter((t: any) => t.id !== id);
      setLocal('lp_tasks', filtered);
      return { message: 'Task deleted' };
    }
  }

  if (path === '/planner/optimize' && method === 'POST') {
    const tasks = getLocal('lp_tasks');
    const date = body.date || new Date().toISOString().split('T')[0];
    const dayTasks = tasks.filter((t: any) => t.date === date);
    
    const sorted = [...dayTasks].sort((a: any, b: any) => {
      const p: any = { high: 3, medium: 2, low: 1 };
      return p[b.priority] - p[a.priority];
    });

    let hour = 9;
    let min = 0;
    const optimized = sorted.map((t: any, idx: number) => {
      const start = new Date(date);
      start.setHours(hour, min, 0);
      min += t.duration_mins;
      if (min >= 60) {
        hour += Math.floor(min / 60);
        min = min % 60;
      }
      const end = new Date(date);
      end.setHours(hour, min, 0);

      // Add small spacing
      min += 10;
      if (min >= 60) { hour += 1; min -= 60; }

      return {
        ...t,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      };
    });

    // Update in list
    const otherTasks = tasks.filter((t: any) => t.date !== date);
    setLocal('lp_tasks', [...otherTasks, ...optimized]);

    // Update productivity score
    const profile = JSON.parse(localStorage.getItem('lp_profile') || '{}');
    profile.productivity_score = Math.min(100, (profile.productivity_score || 70) + 5);
    localStorage.setItem('lp_profile', JSON.stringify(profile));

    return {
      tasks: optimized,
      insights: "Daily schedule organized! Tackling complex engineering blocks first, with dedicated walking and lunch breaks. Keep hydrated with local coconut water!",
      productivityScore: profile.productivity_score
    };
  }

  // Expenses
  if (path.startsWith('/expenses')) {
    const expenses = getLocal('lp_expenses');
    if (method === 'GET') {
      return { expenses };
    }
    if (method === 'POST') {
      let amt = Number(body.amount) || 150;
      let cat = body.category || 'Shopping';
      let desc = body.description || '';
      let isW = false;
      let insight = 'Expense tracked.';

      if (body.rawText) {
        desc = body.rawText;
        const textL = body.rawText.toLowerCase();
        
        // Match numbers
        const match = body.rawText.match(/(\d+)/);
        if (match) amt = Number(match[1]);

        if (textL.includes('swiggy') || textL.includes('zomato') || textL.includes('starbucks') || textL.includes('food')) {
          cat = 'Food';
          isW = true;
          insight = 'Online dining markups are high. Cook at home or eat at local joints to save ₹200.';
        } else if (textL.includes('uber') || textL.includes('ola') || textL.includes('cab')) {
          cat = 'Transport';
          isW = true;
          insight = 'App cabs cost premium rates. Namma Metro or public transit saves up to 70%.';
        } else if (textL.includes('netflix') || textL.includes('spotify') || textL.includes('subscription')) {
          cat = 'Subscriptions';
          isW = true;
          insight = 'Consolidate multiple active media accounts to save monthly.';
        } else if (textL.includes('rent') || textL.includes('room')) {
          cat = 'Rent';
          insight = 'Fixed Rent. Maintain within 30% of salary.';
        }
      }

      const newExpense = {
        id: `local-e-${Date.now()}`,
        amount: amt,
        category: cat,
        description: desc,
        date: body.date || new Date().toISOString().split('T')[0],
        is_wasteful: isW,
        savings_insight: insight
      };

      expenses.unshift(newExpense);
      setLocal('lp_expenses', expenses);

      // Increase productivity score
      const profile = JSON.parse(localStorage.getItem('lp_profile') || '{}');
      profile.productivity_score = Math.min(100, (profile.productivity_score || 70) + 2);
      localStorage.setItem('lp_profile', JSON.stringify(profile));

      return { expense: newExpense, productivityScore: profile.productivity_score };
    }
    if (method === 'DELETE') {
      const id = path.split('/').pop();
      const filtered = expenses.filter((e: any) => e.id !== id);
      setLocal('lp_expenses', filtered);
      return { message: 'Expense deleted' };
    }
  }

  // Study
  if (path.startsWith('/study')) {
    const studyData = JSON.parse(localStorage.getItem('lp_study') || '{"plans":[],"revisions":[]}');
    if (method === 'GET') {
      return studyData;
    }
    if (path === '/study/plan' && method === 'POST') {
      const newPlan = {
        id: `local-s-${Date.now()}`,
        subject: body.subject,
        target_date: body.targetDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 0,
        topics_completed: 0,
        total_topics: Number(body.totalTopics) || 5
      };
      studyData.plans.unshift(newPlan);
      localStorage.setItem('lp_study', JSON.stringify(studyData));
      return { plan: newPlan };
    }
    if (path.startsWith('/study/progress/') && method === 'PUT') {
      const id = path.split('/').pop();
      const idx = studyData.plans.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        const p = studyData.plans[idx];
        const prevComp = p.topics_completed;
        const comp = Number(body.topicsCompleted);
        p.topics_completed = comp;
        p.progress = Math.min(100, Math.round((comp / p.total_topics) * 100));
        
        // Spaced Repetition trigger
        if (comp > prevComp) {
          const revDate = new Date();
          revDate.setDate(revDate.getDate() + 3);
          studyData.revisions.unshift({
            id: `local-r-${Date.now()}`,
            topic: `Revision: ${p.subject} - Session ${comp}`,
            last_reviewed: new Date().toISOString().split('T')[0],
            next_review: revDate.toISOString().split('T')[0],
            status: 'pending'
          });
        }
        localStorage.setItem('lp_study', JSON.stringify(studyData));
        return { plan: p };
      }
    }
    if (path.startsWith('/study/revision/') && method === 'PUT') {
      const id = path.split('/').pop();
      const idx = studyData.revisions.findIndex((r: any) => r.id === id);
      if (idx !== -1) {
        const r = studyData.revisions[idx];
        r.status = 'reviewed';
        r.last_reviewed = new Date().toISOString().split('T')[0];
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        r.next_review = nextDate.toISOString().split('T')[0];
        localStorage.setItem('lp_study', JSON.stringify(studyData));
        return { revision: r };
      }
    }
  }

  // Decisions
  if (path.startsWith('/decision')) {
    const decisions = getLocal('lp_decisions');
    if (method === 'GET') {
      return { decisions };
    }
    if (method === 'POST') {
      const qLower = body.query.toLowerCase();
      let recommendation = '';
      let tags: string[] = ['lifestyle'];

      if (/\b(?:cab|uber|ola|metro|auto)\b/i.test(qLower)) {
        tags = ['transportation', 'lifestyle'];
        recommendation = `### Core Recommendation\n* **Opt for Namma Metro / local train routes** for long commutes during peak traffic.\n* Book share autos for last-mile transit.\n\n### Pros & Cons\n* **Pros**: Cost savings (₹50 vs ₹400 for cab). Predictable timing.\n* **Cons**: Crowded trains.\n\n### Final Verdict\n**Prefer Metro + Auto.** Monthly savings: ₹4,500.`;
      } else if (/\b(?:sip|invest|mutual\s*fund|shares|stock)\b/i.test(qLower)) {
        tags = ['money'];
        recommendation = `### Core Recommendation\n* **Setup a monthly Mutual Fund SIP** starting around ₹1,500/month in Large-Cap indices.\n\n### Pros & Cons\n* **Pros**: Inculcates financial habit.\n* **Cons**: Market volatility.\n\n### Final Verdict\n**Start SIP today.** Beats inflation and compounds wealth.`;
      } else if (/\b(?:emi|iphone|phone|credit\s*card|laptop|gadget)\b/i.test(qLower)) {
        tags = ['money'];
        recommendation = `### Core Recommendation\n* **Apply 48h rules**: Do not buy consumer items on credit. Save cash and purchase without EMI traps.\n\n### Pros & Cons\n* **Pros**: Quick gadget access.\n* **Cons**: Limits future budget surplus.\n\n### Final Verdict\n**Avoid EMI.** Set aside ₹5,000/month. Purchase in cash later.`;
      } else if (/\b(?:car|bike|vehicle|scooter)\b/i.test(qLower)) {
        tags = ['money', 'transportation'];
        recommendation = `### Core Recommendation\n* **Calculate total ownership cost (fuel, maintenance, depreciation)** vs app cabs before purchasing.\n\n### Pros & Cons\n* **Pros**: Personal convenience.\n* **Cons**: Depreciating asset.\n\n### Final Verdict\n**Avoid vehicle debt.** Prefer a certified pre-owned model in cash if public transport is not viable.`;
      } else if (/\b(?:event|travel|trip|city|hotel|flight|train|stay|vacation)\b/i.test(qLower)) {
        tags = ['money', 'lifestyle'];
        recommendation = `### Core Recommendation\n* **Create a travel budget split into three main categories**: Transport (train/flight), Accommodation (hotel/PG/stay), and Daily Food/Local Transit.\n* Avoid last-minute bookings. Booking train/flight tickets 3 weeks in advance saves up to 40% on fares.\n* Use public transit (metro/local buses) or shared autos inside the host city instead of booking individual app cabs.\n\n### Pros & Cons\n* **Pros**: Pre-planning prevents financial stress and saves money.\n* **Cons**: Travel requires upfront cash and planning effort.\n\n### Final Verdict\n**Plan the trip details and allocate a fixed pocket-budget.** Keep a 20% emergency buffer for local transport or dynamic pricing. Use apps like Ixigo or IRCTC for cost-effective bookings.`;
      } else if (/\b(?:buy|purchase|shopping|deal)\b/i.test(qLower)) {
        tags = ['money', 'lifestyle'];
        recommendation = `### Core Recommendation\n* **Apply the 48-Hour delay rule**: Wait exactly 48 hours before purchasing any non-essential item.\n\n### Pros & Cons\n* **Pros**: Curbs impulse spending.\n* **Cons**: Requires patience. \n\n### Final Verdict\n**Delay the purchase.** Check if it fits within your monthly fun allowance.`;
      } else {
        recommendation = `### Core Recommendation\n* **Pomodoro Focus**: Set a 50m timer and restrict notifications.\n* Carry healthy local snacks (makhana/chana) to stay active and fit.\n\n### Pros & Cons\n* **Pros**: Keeps health and focus optimal.\n* **Cons**: Requires early prep.\n\n### Final Verdict\n**Choose small habit swaps** like drinking black coffee or green tea instead of sugared canteen chai.`;
      }

      const newDecision = {
        id: `local-d-${Date.now()}`,
        query: body.query,
        recommendation,
        context_tags: tags,
        created_at: new Date().toISOString()
      };

      decisions.unshift(newDecision);
      setLocal('lp_decisions', decisions);
      return { decision: newDecision };
    }
  }

  throw new Error(`Fallback handler: Path ${path} not supported`);
};

// Expose API endpoints
export const ApiService = {
  // Auth
  async login(email: string, password: string) {
    const res = await apiRequest('POST', '/auth/login', { email, password });
    if (res.token) setStoredToken(res.token);
    return res;
  },
  
  async register(email: string, password: string, fullName: string) {
    const res = await apiRequest('POST', '/auth/register', { email, password, fullName });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async getProfile() {
    return await apiRequest('GET', '/auth/me');
  },

  async updateProfile(data: any) {
    return await apiRequest('PUT', '/profile/update', data);
  },

  logout() {
    removeStoredToken();
  },

  isAuthenticated(): boolean {
    return !!getStoredToken();
  },

  // Tasks (Planner)
  async getTasks(date: string) {
    return await apiRequest('GET', `/planner/tasks?date=${date}`);
  },

  async createTask(data: { title: string; description?: string; priority?: string; durationMins?: number; startTime?: string; date: string }) {
    return await apiRequest('POST', '/planner/tasks', data);
  },

  async updateTask(id: string, data: any) {
    return await apiRequest('PUT', `/planner/tasks/${id}`, data);
  },

  async deleteTask(id: string) {
    return await apiRequest('DELETE', `/planner/tasks/${id}`);
  },

  async optimizeSchedule(date: string) {
    return await apiRequest('POST', '/planner/optimize', { date });
  },

  // Expenses
  async getExpenses() {
    return await apiRequest('GET', '/expenses');
  },

  async createExpense(data: { amount?: number; category?: string; description?: string; date?: string; rawText?: string }) {
    return await apiRequest('POST', '/expenses', data);
  },

  async deleteExpense(id: string) {
    return await apiRequest('DELETE', `/expenses/${id}`);
  },

  // Study Coach
  async getStudyDashboard() {
    return await apiRequest('GET', '/study');
  },

  async createStudyPlan(data: { subject: string; totalTopics?: number; targetDate?: string }) {
    return await apiRequest('POST', '/study/plan', data);
  },

  async updateStudyProgress(id: string, topicsCompleted: number, totalTopics?: number) {
    return await apiRequest('PUT', `/study/progress/${id}`, { topicsCompleted, totalTopics });
  },

  async completeRevision(id: string) {
    return await apiRequest('PUT', `/study/revision/${id}`);
  },

  // Decisions
  async getDecisions() {
    return await apiRequest('GET', '/decision');
  },

  async createDecision(query: string) {
    return await apiRequest('POST', '/decision', { query });
  }
};
