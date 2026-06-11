import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

// Define Types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Profile {
  user_id: string;
  location: string;
  monthly_budget: number;
  learning_goals: string;
  currency: string;
  productivity_score: number;
  updated_at: Date;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  duration_mins: number;
  status: 'pending' | 'completed';
  start_time?: Date;
  end_time?: Date;
  date: string; // YYYY-MM-DD
  created_at: Date;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD
  is_wasteful: boolean;
  savings_insight?: string;
  created_at: Date;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  subject: string;
  target_date: string; // YYYY-MM-DD
  progress: number;
  topics_completed: number;
  total_topics: number;
  created_at: Date;
}

export interface SpacedRevision {
  id: string;
  user_id: string;
  topic: string;
  last_reviewed: string; // YYYY-MM-DD
  next_review: string; // YYYY-MM-DD
  status: 'pending' | 'reviewed';
  created_at: Date;
}

export interface Decision {
  id: string;
  user_id: string;
  query: string;
  recommendation: string;
  context_tags: string[];
  created_at: Date;
}

// In-Memory Database Store (Fallback)
const memoryDb = {
  users: [] as User[],
  profiles: [] as Profile[],
  tasks: [] as Task[],
  expenses: [] as Expense[],
  studyPlans: [] as StudyPlan[],
  spacedRevisions: [] as SpacedRevision[],
  decisions: [] as Decision[]
};

// Populate seed data for fallback mode
const seedMemoryDb = () => {
  const mockUserId = "d3b07384-d113-4956-a5cc-e0e64c238b6d";
  const mockUser: User = {
    id: mockUserId,
    email: "ankit@lifepilot.ai",
    password_hash: "$2a$10$7qB2zU98Xo3dCg2yR0H2eu.5mKk65o5G.s5l5sK55e5u5r5o5y5c.", // hashed dummy
    full_name: "Ankit Kumar",
    created_at: new Date(),
    updated_at: new Date()
  };
  memoryDb.users.push(mockUser);

  memoryDb.profiles.push({
    user_id: mockUserId,
    location: "Bengaluru, India",
    monthly_budget: 35000.00,
    learning_goals: "Prepare for UPSC, learn advanced Machine Learning",
    currency: "INR",
    productivity_score: 82,
    updated_at: new Date()
  });

  memoryDb.tasks.push(
    {
      id: uuidv4(),
      user_id: mockUserId,
      title: "Review daily team objectives",
      description: "Sync up on frontend/backend tasks for the sprint.",
      priority: "medium",
      duration_mins: 30,
      status: "completed",
      start_time: new Date(new Date().setHours(9, 30, 0)),
      end_time: new Date(new Date().setHours(10, 0, 0)),
      date: new Date().toISOString().split('T')[0],
      created_at: new Date()
    },
    {
      id: uuidv4(),
      user_id: mockUserId,
      title: "Draft system architecture docs",
      description: "Work on database design schema and endpoints mapping.",
      priority: "high",
      duration_mins: 90,
      status: "pending",
      start_time: new Date(new Date().setHours(11, 0, 0)),
      end_time: new Date(new Date().setHours(12, 30, 0)),
      date: new Date().toISOString().split('T')[0],
      created_at: new Date()
    },
    {
      id: uuidv4(),
      user_id: mockUserId,
      title: "Evening walking & health reset",
      description: "Walk in Cubbon Park, drink sugar-free tender coconut water.",
      priority: "low",
      duration_mins: 45,
      status: "pending",
      start_time: new Date(new Date().setHours(18, 0, 0)),
      end_time: new Date(new Date().setHours(18, 45, 0)),
      date: new Date().toISOString().split('T')[0],
      created_at: new Date()
    }
  );

  memoryDb.expenses.push(
    {
      id: uuidv4(),
      user_id: mockUserId,
      amount: 450.00,
      category: "Food",
      description: "Zomato dinner delivery - Paneer Biryani",
      date: new Date().toISOString().split('T')[0],
      is_wasteful: true,
      savings_insight: "Ordering dinner online twice in a row. Consider cooking or local tiffin service to save ₹300.",
      created_at: new Date()
    },
    {
      id: uuidv4(),
      user_id: mockUserId,
      amount: 80.00,
      category: "Transport",
      description: "Namma Metro card auto-recharge",
      date: new Date().toISOString().split('T')[0],
      is_wasteful: false,
      savings_insight: "Metro is highly cost-effective compared to App cabs (saved ~₹250).",
      created_at: new Date()
    },
    {
      id: uuidv4(),
      user_id: mockUserId,
      amount: 12000.00,
      category: "Rent",
      description: "PG accommodation monthly deposit",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_wasteful: false,
      savings_insight: "Fixed cost. Great deal for current location.",
      created_at: new Date()
    }
  );

  memoryDb.studyPlans.push(
    {
      id: uuidv4(),
      user_id: mockUserId,
      subject: "UPSC General Studies - Indian Polity",
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 40,
      topics_completed: 4,
      total_topics: 10,
      created_at: new Date()
    },
    {
      id: uuidv4(),
      user_id: mockUserId,
      subject: "Machine Learning - Neural Networks",
      target_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 60,
      topics_completed: 3,
      total_topics: 5,
      created_at: new Date()
    }
  );

  memoryDb.spacedRevisions.push(
    {
      id: uuidv4(),
      user_id: mockUserId,
      topic: "Fundamental Rights - Constitution Art 14-18",
      last_reviewed: new Date().toISOString().split('T')[0],
      next_review: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "pending",
      created_at: new Date()
    },
    {
      id: uuidv4(),
      user_id: mockUserId,
      topic: "Backpropagation algorithm math",
      last_reviewed: new Date().toISOString().split('T')[0],
      next_review: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "pending",
      created_at: new Date()
    }
  );
};

seedMemoryDb();

// PostgreSQL Configuration
let pool: Pool | null = null;
let isPostgresConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    });
    console.log("PostgreSQL Pool initialized");
  } catch (err) {
    console.warn("Failed to initialize PostgreSQL pool, falling back to memory database:", err);
  }
}

export const checkDbConnection = async (): Promise<boolean> => {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    client.release();
    isPostgresConnected = true;
    console.log("Successfully connected to PostgreSQL database!");
    return true;
  } catch (err) {
    console.warn("PostgreSQL connection failed. Operating in IN-MEMORY fallback mode.");
    isPostgresConnected = false;
    return false;
  }
};

// Gracefully run diagnostic query on load
checkDbConnection();

// ==========================================
// DB REPOSITORIES (Auto-handling Real vs Mock)
// ==========================================

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || null;
    }
    const user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  },

  async findById(id: string): Promise<User | null> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return memoryDb.users.find(u => u.id === id) || null;
  },

  async create(email: string, passwordHash: string, fullName: string): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      email,
      password_hash: passwordHash,
      full_name: fullName,
      created_at: new Date(),
      updated_at: new Date()
    };

    if (isPostgresConnected && pool) {
      const result = await pool.query(
        'INSERT INTO users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4) RETURNING *',
        [newUser.id, newUser.email, newUser.password_hash, newUser.full_name]
      );
      // Create initial profile
      await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [newUser.id]);
      return result.rows[0];
    }

    memoryDb.users.push(newUser);
    memoryDb.profiles.push({
      user_id: newUser.id,
      location: 'Mumbai, India',
      monthly_budget: 30000.00,
      learning_goals: '',
      currency: 'INR',
      productivity_score: 70,
      updated_at: new Date()
    });
    return newUser;
  }
};

export const ProfileRepository = {
  async findByUserId(userId: string): Promise<Profile | null> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
      return result.rows[0] || null;
    }
    return memoryDb.profiles.find(p => p.user_id === userId) || null;
  },

  async update(userId: string, data: Partial<Omit<Profile, 'user_id' | 'updated_at'>>): Promise<Profile> {
    if (isPostgresConnected && pool) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
      
      const query = `
        UPDATE profiles 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = $1 
        RETURNING *
      `;
      const result = await pool.query(query, [userId, ...values]);
      return result.rows[0];
    }

    let profile = memoryDb.profiles.find(p => p.user_id === userId);
    if (!profile) {
      profile = {
        user_id: userId,
        location: 'Mumbai, India',
        monthly_budget: 30000.00,
        learning_goals: '',
        currency: 'INR',
        productivity_score: 70,
        updated_at: new Date()
      };
      memoryDb.profiles.push(profile);
    }
    
    Object.assign(profile, data, { updated_at: new Date() });
    return profile;
  }
};

export const TaskRepository = {
  async findAllByUserId(userId: string, date?: string): Promise<Task[]> {
    if (isPostgresConnected && pool) {
      let query = 'SELECT * FROM tasks WHERE user_id = $1';
      const params: any[] = [userId];
      if (date) {
        query += ' AND date = $2';
        params.push(date);
      }
      query += ' ORDER BY start_time ASC, created_at ASC';
      const result = await pool.query(query, params);
      return result.rows;
    }
    
    return memoryDb.tasks
      .filter(t => t.user_id === userId && (!date || t.date === date))
      .sort((a, b) => {
        if (a.start_time && b.start_time) return a.start_time.getTime() - b.start_time.getTime();
        return a.created_at.getTime() - b.created_at.getTime();
      });
  },

  async create(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      created_at: new Date()
    };

    if (isPostgresConnected && pool) {
      const result = await pool.query(
        `INSERT INTO tasks (id, user_id, title, description, priority, duration_mins, status, start_time, end_time, date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          newTask.id, newTask.user_id, newTask.title, newTask.description, 
          newTask.priority, newTask.duration_mins, newTask.status, 
          newTask.start_time, newTask.end_time, newTask.date
        ]
      );
      return result.rows[0];
    }

    memoryDb.tasks.push(newTask);
    return newTask;
  },

  async update(id: string, userId: string, data: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>): Promise<Task | null> {
    if (isPostgresConnected && pool) {
      const keys = Object.keys(data);
      if (keys.length === 0) return null;
      const values = Object.values(data);
      const setClause = keys.map((key, idx) => `${key} = $${idx + 3}`).join(', ');
      const query = `UPDATE tasks SET ${setClause} WHERE id = $1 AND user_id = $2 RETURNING *`;
      const result = await pool.query(query, [id, userId, ...values]);
      return result.rows[0] || null;
    }

    const task = memoryDb.tasks.find(t => t.id === id && t.user_id === userId);
    if (!task) return null;
    Object.assign(task, data);
    return task;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      return (result.rowCount ?? 0) > 0;
    }
    const idx = memoryDb.tasks.findIndex(t => t.id === id && t.user_id === userId);
    if (idx === -1) return false;
    memoryDb.tasks.splice(idx, 1);
    return true;
  },

  async bulkSave(userId: string, tasks: Array<Omit<Task, 'id' | 'user_id' | 'created_at'>>, date: string): Promise<Task[]> {
    // Clear existing pending tasks for that day before regenerating schedule
    if (isPostgresConnected && pool) {
      await pool.query("DELETE FROM tasks WHERE user_id = $1 AND date = $2 AND status = 'pending'", [userId, date]);
      const savedTasks: Task[] = [];
      for (const t of tasks) {
        const item = await this.create({ ...t, user_id: userId, date });
        savedTasks.push(item);
      }
      return savedTasks;
    }

    memoryDb.tasks = memoryDb.tasks.filter(t => !(t.user_id === userId && t.date === date && t.status === 'pending'));
    const savedTasks: Task[] = [];
    for (const t of tasks) {
      const item = await this.create({ ...t, user_id: userId, date });
      savedTasks.push(item);
    }
    return savedTasks;
  }
};

export const ExpenseRepository = {
  async findAllByUserId(userId: string): Promise<Expense[]> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC', [userId]);
      return result.rows;
    }
    return memoryDb.expenses
      .filter(e => e.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.getTime() - a.created_at.getTime());
  },

  async create(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      created_at: new Date()
    };

    if (isPostgresConnected && pool) {
      const result = await pool.query(
        `INSERT INTO expenses (id, user_id, amount, category, description, date, is_wasteful, savings_insight) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          newExpense.id, newExpense.user_id, newExpense.amount, newExpense.category, 
          newExpense.description, newExpense.date, newExpense.is_wasteful, newExpense.savings_insight
        ]
      );
      return result.rows[0];
    }

    memoryDb.expenses.push(newExpense);
    return newExpense;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, userId]);
      return (result.rowCount ?? 0) > 0;
    }
    const idx = memoryDb.expenses.findIndex(e => e.id === id && e.user_id === userId);
    if (idx === -1) return false;
    memoryDb.expenses.splice(idx, 1);
    return true;
  }
};

export const StudyPlanRepository = {
  async findAllByUserId(userId: string): Promise<StudyPlan[]> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM study_plans WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows;
    }
    return memoryDb.studyPlans.filter(s => s.user_id === userId).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },

  async create(plan: Omit<StudyPlan, 'id' | 'created_at'>): Promise<StudyPlan> {
    const newPlan: StudyPlan = {
      ...plan,
      id: uuidv4(),
      created_at: new Date()
    };

    if (isPostgresConnected && pool) {
      const result = await pool.query(
        `INSERT INTO study_plans (id, user_id, subject, target_date, progress, topics_completed, total_topics) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          newPlan.id, newPlan.user_id, newPlan.subject, newPlan.target_date, 
          newPlan.progress, newPlan.topics_completed, newPlan.total_topics
        ]
      );
      return result.rows[0];
    }

    memoryDb.studyPlans.push(newPlan);
    return newPlan;
  },

  async update(id: string, userId: string, data: Partial<Omit<StudyPlan, 'id' | 'user_id' | 'created_at'>>): Promise<StudyPlan | null> {
    if (isPostgresConnected && pool) {
      const keys = Object.keys(data);
      if (keys.length === 0) return null;
      const values = Object.values(data);
      const setClause = keys.map((key, idx) => `${key} = $${idx + 3}`).join(', ');
      const query = `UPDATE study_plans SET ${setClause} WHERE id = $1 AND user_id = $2 RETURNING *`;
      const result = await pool.query(query, [id, userId, ...values]);
      return result.rows[0] || null;
    }

    const plan = memoryDb.studyPlans.find(s => s.id === id && s.user_id === userId);
    if (!plan) return null;
    Object.assign(plan, data);
    return plan;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('DELETE FROM study_plans WHERE id = $1 AND user_id = $2', [id, userId]);
      return (result.rowCount ?? 0) > 0;
    }
    const idx = memoryDb.studyPlans.findIndex(s => s.id === id && s.user_id === userId);
    if (idx === -1) return false;
    memoryDb.studyPlans.splice(idx, 1);
    return true;
  }
};

export const SpacedRevisionRepository = {
  async findAllByUserId(userId: string): Promise<SpacedRevision[]> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM spaced_revisions WHERE user_id = $1 ORDER BY next_review ASC', [userId]);
      return result.rows;
    }
    return memoryDb.spacedRevisions
      .filter(r => r.user_id === userId)
      .sort((a, b) => a.next_review.localeCompare(b.next_review));
  },

  async create(rev: Omit<SpacedRevision, 'id' | 'created_at'>): Promise<SpacedRevision> {
    const newRev: SpacedRevision = {
      ...rev,
      id: uuidv4(),
      created_at: new Date()
    };

    if (isPostgresConnected && pool) {
      const result = await pool.query(
        `INSERT INTO spaced_revisions (id, user_id, topic, last_reviewed, next_review, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [newRev.id, newRev.user_id, newRev.topic, newRev.last_reviewed, newRev.next_review, newRev.status]
      );
      return result.rows[0];
    }

    memoryDb.spacedRevisions.push(newRev);
    return newRev;
  },

  async update(id: string, userId: string, data: Partial<Omit<SpacedRevision, 'id' | 'user_id' | 'created_at'>>): Promise<SpacedRevision | null> {
    if (isPostgresConnected && pool) {
      const keys = Object.keys(data);
      if (keys.length === 0) return null;
      const values = Object.values(data);
      const setClause = keys.map((key, idx) => `${key} = $${idx + 3}`).join(', ');
      const query = `UPDATE spaced_revisions SET ${setClause} WHERE id = $1 AND user_id = $2 RETURNING *`;
      const result = await pool.query(query, [id, userId, ...values]);
      return result.rows[0] || null;
    }

    const rev = memoryDb.spacedRevisions.find(r => r.id === id && r.user_id === userId);
    if (!rev) return null;
    Object.assign(rev, data);
    return rev;
  }
};

export const DecisionRepository = {
  async findAllByUserId(userId: string): Promise<Decision[]> {
    if (isPostgresConnected && pool) {
      const result = await pool.query('SELECT * FROM decisions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      return result.rows;
    }
    return memoryDb.decisions.filter(d => d.user_id === userId).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },

  async create(decision: Omit<Decision, 'id' | 'created_at'>): Promise<Decision> {
    const newDecision: Decision = {
      ...decision,
      id: uuidv4(),
      created_at: new Date()
    };

    if (isPostgresConnected && pool) {
      const result = await pool.query(
        `INSERT INTO decisions (id, user_id, query, recommendation, context_tags) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [newDecision.id, newDecision.user_id, newDecision.query, newDecision.recommendation, newDecision.context_tags]
      );
      return result.rows[0];
    }

    memoryDb.decisions.push(newDecision);
    return newDecision;
  }
};
