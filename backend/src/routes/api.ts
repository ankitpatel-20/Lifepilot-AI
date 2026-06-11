import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser 
} from '../controllers/authController';
import { 
  updateProfile 
} from '../controllers/profileController';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  optimizeSchedule 
} from '../controllers/plannerController';
import { 
  getExpenses, 
  createExpense, 
  deleteExpense 
} from '../controllers/expenseController';
import { 
  getStudyPlans, 
  createStudyPlan, 
  updateStudyProgress, 
  completeRevision 
} from '../controllers/studyController';
import { 
  getDecisions, 
  createDecision 
} from '../controllers/decisionController';

const router = Router();

// ==========================================
// Authentication Routes
// ==========================================
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/auth/me', authenticateToken, getCurrentUser);

// ==========================================
// Profile / Preferences Routes
// ==========================================
router.put('/profile/update', authenticateToken, updateProfile);

// ==========================================
// AI Daily Planner Routes
// ==========================================
router.get('/planner/tasks', authenticateToken, getTasks);
router.post('/planner/tasks', authenticateToken, createTask);
router.put('/planner/tasks/:id', authenticateToken, updateTask);
router.delete('/planner/tasks/:id', authenticateToken, deleteTask);
router.post('/planner/optimize', authenticateToken, optimizeSchedule);

// ==========================================
// Expense Manager Routes
// ==========================================
router.get('/expenses', authenticateToken, getExpenses);
router.post('/expenses', authenticateToken, createExpense);
router.delete('/expenses/:id', authenticateToken, deleteExpense);

// ==========================================
// Study Coach Routes
// ==========================================
router.get('/study', authenticateToken, getStudyPlans);
router.post('/study/plan', authenticateToken, createStudyPlan);
router.put('/study/progress/:id', authenticateToken, updateStudyProgress);
router.put('/study/revision/:id', authenticateToken, completeRevision);

// ==========================================
// Daily Decision Engine Routes
// ==========================================
router.get('/decision', authenticateToken, getDecisions);
router.post('/decision', authenticateToken, createDecision);

export default router;
