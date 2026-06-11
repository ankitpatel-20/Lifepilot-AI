import http from 'http';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

interface RequestOptions {
  method: string;
  path: string;
  body?: any;
  token?: string;
}

const makeRequest = (options: RequestOptions): Promise<any> => {
  return new Promise((resolve, reject) => {
    const dataStr = options.body ? JSON.stringify(options.body) : '';
    
    const headers: Record<string, any> = {
      'Content-Type': 'application/json',
    };

    if (options.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    if (options.body) {
      headers['Content-Length'] = Buffer.byteLength(dataStr);
    }

    const reqOptions: http.RequestOptions = {
      hostname: 'localhost',
      port: PORT,
      path: options.path,
      method: options.method,
      headers
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode && res.statusCode >= 400) {
            reject({ status: res.statusCode, error: parsed.error || parsed });
          } else {
            resolve(parsed);
          }
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    
    if (options.body) {
      req.write(dataStr);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log("🚀 Starting LifePilot AI Endpoint Verification Tests...\n");
  
  try {
    // 1. Health check
    console.log("Checking Base URL Health...");
    const health = await makeRequest({ method: 'GET', path: '/' });
    console.log("✅ Server Health check success:", health);
    console.log("-----------------------------------------");

    // 2. Register User
    console.log("Registering Test User...");
    const testEmail = `test_${Date.now()}@lifepilot.ai`;
    const regResult = await makeRequest({
      method: 'POST',
      path: '/api/auth/register',
      body: {
        email: testEmail,
        password: 'password123',
        fullName: 'Test User'
      }
    });
    console.log("✅ Registration success! User ID:", regResult.user.id);
    const token = regResult.token;

    // 3. Login User
    console.log("Logging in Test User...");
    const loginResult = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: testEmail,
        password: 'password123'
      }
    });
    console.log("✅ Login success! Received Token.");

    // 4. Fetch User Details & Profile Settings
    console.log("Fetching profile info...");
    const me = await makeRequest({ method: 'GET', path: '/api/auth/me', token });
    console.log("✅ Fetch Profile success. Location:", me.profile.location);

    // 5. Update Profile Details
    console.log("Updating profile settings (budget & goals)...");
    const updateProfile = await makeRequest({
      method: 'PUT',
      path: '/api/profile/update',
      token,
      body: {
        location: 'Mumbai, India',
        monthlyBudget: 40000,
        learningGoals: 'Master React & System Design'
      }
    });
    console.log("✅ Profile updated! New Budget:", updateProfile.profile.monthly_budget);

    // 6. Create Tasks in Daily Planner
    console.log("Creating tasks for today...");
    const task1 = await makeRequest({
      method: 'POST',
      path: '/api/planner/tasks',
      token,
      body: {
        title: 'Review database indexes',
        description: 'Optimize user lookup performance.',
        priority: 'high',
        durationMins: 45
      }
    });
    console.log("✅ Task 1 Created:", task1.task.title);

    const task2 = await makeRequest({
      method: 'POST',
      path: '/api/planner/tasks',
      token,
      body: {
        title: 'Draft API contracts',
        priority: 'medium',
        durationMins: 60
      }
    });
    console.log("✅ Task 2 Created:", task2.task.title);

    // 7. Optimize Daily Schedule via AI
    console.log("Optimizing daily schedule via AI...");
    const optimized = await makeRequest({
      method: 'POST',
      path: '/api/planner/optimize',
      token,
      body: {
        date: new Date().toISOString().split('T')[0]
      }
    });
    console.log("✅ AI Optimizer output tasks count:", optimized.tasks.length);
    console.log("AI Insight Summary:", optimized.insights);

    // 8. Log Expenses & Audit Wasteful Actions
    console.log("Logging a Swiggy Food delivery expense...");
    const exp1 = await makeRequest({
      method: 'POST',
      path: '/api/expenses',
      token,
      body: {
        rawText: 'Spent ₹480 on Swiggy delivery lunch'
      }
    });
    console.log(`✅ Expense parsed: Category: ${exp1.expense.category}, Amount: ₹${exp1.expense.amount}`);
    console.log(`Wasteful? ${exp1.expense.is_wasteful ? '🚫 Yes' : '✅ No'}`);
    console.log(`Savings Insight: ${exp1.expense.savings_insight}`);

    console.log("Logging a Metro ticket expense...");
    const exp2 = await makeRequest({
      method: 'POST',
      path: '/api/expenses',
      token,
      body: {
        rawText: '₹80 Metro travel recharge'
      }
    });
    console.log(`✅ Expense parsed: Category: ${exp2.expense.category}, Amount: ₹${exp2.expense.amount}`);
    console.log(`Wasteful? ${exp2.expense.is_wasteful ? '🚫 Yes' : '✅ No'}`);

    // 9. Fetch Expenses List
    console.log("Fetching all logged expenses...");
    const expenses = await makeRequest({ method: 'GET', path: '/api/expenses', token });
    console.log(`✅ Fetched ${expenses.expenses.length} expenses.`);

    // 10. Study Coach Setup
    console.log("Creating a study tracking subject...");
    const studyPlan = await makeRequest({
      method: 'POST',
      path: '/api/study/plan',
      token,
      body: {
        subject: 'Master SQL Indexing & Joins',
        totalTopics: 5
      }
    });
    console.log("✅ Study track created:", studyPlan.plan.subject);

    // 11. Log Study Progress (Ticking topic completion)
    console.log("Updating study progress (Completing topic 1)...");
    const progressUpdate = await makeRequest({
      method: 'PUT',
      path: `/api/study/progress/${studyPlan.plan.id}`,
      token,
      body: {
        topicsCompleted: 1
      }
    });
    console.log(`✅ Study progress: ${progressUpdate.plan.progress}% complete.`);

    // 12. Check Study Dashboard & Spaced Revision Tasks
    console.log("Fetching study dashboard (plans & revisions)...");
    const studyDashboard = await makeRequest({ method: 'GET', path: '/api/study', token });
    console.log(`✅ Active Plans: ${studyDashboard.plans.length}, Revision items: ${studyDashboard.revisions.length}`);

    // 13. Ask Lifestyle Question to Decision Engine
    console.log("Consulting Decision Engine: 'Should I buy a new iPhone on EMI?'...");
    const decision = await makeRequest({
      method: 'POST',
      path: '/api/decision',
      token,
      body: {
        query: 'Should I buy a new iPhone on EMI?'
      }
    });
    console.log("✅ AI Decision Engine recommendation:");
    console.log(decision.decision.recommendation);
    console.log("Tags resolved:", decision.decision.context_tags);

    console.log("\n🎉 ALL LIFE-PILOT API ENDPOINTS SUCCESSFULLY VERIFIED!");

  } catch (err) {
    console.error("❌ Test failed with error:", err);
    process.exit(1);
  }
};

runTests();
