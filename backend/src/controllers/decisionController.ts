import { Response } from 'express';
import { DecisionRepository, ProfileRepository } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import OpenAI from 'openai';

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

export const getDecisions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const decisions = await DecisionRepository.findAllByUserId(userId);
    return res.json({ decisions });
  } catch (error) {
    console.error('Get decisions error:', error);
    return res.status(500).json({ error: 'Server error. Failed to retrieve decision logs.' });
  }
};

export const createDecision = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { query } = req.body;
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Please enter a valid query or scenario.' });
    }

    const profile = await ProfileRepository.findByUserId(userId);
    const userLocation = profile?.location || 'India';
    const monthlyBudget = profile?.monthly_budget || 30000;

    let recommendation = '';
    let tags: string[] = [];

    if (openai) {
      try {
        const prompt = `
          You are LifePilot AI, a wise and practical decision coach helping a user in India.
          User Profile: Location: ${userLocation}, Monthly Budget: ₹${monthlyBudget}.
          Question: "${query}"
          
          Provide a highly practical, structured recommendation.
          Guidelines:
          - Use bullet points for steps.
          - Offer a clear "Verdict" (e.g., Do it, Avoid it, Wait 7 days).
          - Be highly specific to the Indian context (e.g., mention Namma Metro, local autos, Swiggy markups, SIP mutual funds, small local grocers, competitive exams).
          - Structure the response with sections: "Core Recommendation", "Pros & Cons", and "Final Verdict".
          - Keep the total response under 250 words.
          
          Also, specify 2-3 tags from: 'transportation', 'money', 'learning', 'lifestyle', 'productivity'.
          Return JSON only:
          { "recommendation": string, "tags": string[] }
        `;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');
        recommendation = data.recommendation || '';
        tags = data.tags || ['lifestyle'];
      } catch (err) {
        console.warn("OpenAI decision helper failed, using local recommendation fallback", err);
      }
    }

    // Local Decision Tree Fallback (Custom Indian Lifestyle Scenarios)
    if (!recommendation) {
      const qLower = query.toLowerCase();

      if (/\b(?:cab|uber|ola|metro|auto|office|commute|transport)\b/i.test(qLower)) {
        tags = ['transportation', 'lifestyle'];
        recommendation = `### Core Recommendation
* **Use Public Transit (Metro/Local Trains) for distances > 5km** during peak traffic hours (8:30 AM - 10:30 AM and 5:30 PM - 8:00 PM).
* Use shared auto-rickshaws or ride-hailing bikes (Rapido/Uber Moto) to bridge the first/last mile connection.

### Pros & Cons
* **Pros**: Metro costs ₹20-60 vs Cab costs ₹350-500. Metro bypasses street traffic blocks, ensuring predictable arrival times.
* **Cons**: Metro can be crowded during rush hours. Requires walking to/from stations.

### Final Verdict
**Prefer Metro + Auto first-mile/last-mile combo.** Cabs should be reserved for emergency travel or monsoon downpours. Monthly savings: **₹5,000+**`;
      } 
      else if (/\b(?:sip|invest|mutual\s*fund|shares|stock)\b/i.test(qLower)) {
        tags = ['money'];
        recommendation = `### Core Recommendation
* **Start a monthly Mutual Fund SIP (Systematic Investment Plan) of ₹1,000 - ₹5,000.**
* Allocate 70% in Index/Large Cap funds for stable returns and 30% in Mid/Small Cap funds for growth.
* Build a liquid emergency fund equal to 3 months of expenses first.

### Pros & Cons
* **Pros**: Compounding returns, beats inflation, inculcates saving discipline.
* **Cons**: Short-term market volatility. Money is locked if investing in ELSS tax-saving schemes.

### Final Verdict
**Invest immediately via SIP.** Even a small ₹1,500 monthly SIP compounding at 12% over 10 years builds a wealth corpus of over ₹3.4 Lakhs. Start today.`;
      }
      else if (/\b(?:emi|iphone|phone|credit\s*card|laptop|gadget)\b/i.test(qLower)) {
        tags = ['money'];
        recommendation = `### Core Recommendation
* **Apply the 2x Rule**: If you cannot buy two of these gadgets with cash without draining savings, you cannot afford it.
* Avoid No-Cost EMI traps; they encourage impulse spending and carry hidden processing fees plus 18% GST on interest components.

### Pros & Cons
* **Pros**: Instant gratification, builds a credit history (if paid punctually).
* **Cons**: Deducts future disposable income, locks you in a debt loop, increases stress.

### Final Verdict
**Avoid buying consumer goods on EMI.** Wait 30 days. Save money by setting aside ₹5,000/month in an online recurring deposit or liquid fund. Buy it when you have the cash surplus.`;
      }
      else if (/\b(?:car|bike|vehicle|scooter)\b/i.test(qLower)) {
        tags = ['money', 'transportation'];
        recommendation = `### Core Recommendation
* **Calculate total ownership cost (fuel, maintenance, insurance, depreciation)** vs app cab rides or public transit before purchasing.
* Avoid buying a brand new vehicle on a long-term loan that consumes more than 15% of your monthly take-home salary.

### Pros & Cons
* **Pros**: Complete personal convenience, high status, comfort during monsoons.
* **Cons**: Heavily depreciating asset, high insurance premiums, traffic parking struggles.

### Final Verdict
**Opt for public transit or ride-hailing first.** If you must purchase, consider a certified pre-owned (second-hand) vehicle in cash, preventing debt traps.`;
      }
      else if (/\b(?:event|travel|trip|city|hotel|flight|train|stay|vacation)\b/i.test(qLower)) {
        tags = ['money', 'lifestyle'];
        recommendation = `### Core Recommendation
* **Create a travel budget split into three main categories**: Transport (train/flight), Accommodation (hotel/PG/stay), and Daily Food/Local Transit.
* Avoid last-minute bookings. Booking train/flight tickets 3 weeks in advance saves up to 40% on fares.
* Use public transit (metro/local buses) or shared autos inside the host city instead of booking individual app cabs.

### Pros & Cons
* **Pros**: Pre-planning prevents financial stress and saves money.
* **Cons**: Travel requires upfront cash and planning effort.

### Final Verdict
**Plan the trip details and allocate a fixed pocket-budget.** Keep a 20% emergency buffer for local transport or dynamic pricing. Use apps like Ixigo or IRCTC for cost-effective bookings.`;
      }
      else if (/\b(?:buy|purchase|shopping|deal)\b/i.test(qLower)) {
        tags = ['money', 'lifestyle'];
        recommendation = `### Core Recommendation
* **Apply the 48-Hour delay rule**: Wait exactly 48 hours before purchasing any non-essential item.
* Check if this purchase fits within your pre-allocated monthly 'fun allowance'.

### Pros & Cons
* **Pros**: Curbs impulse spending, saves cash.
* **Cons**: Demands immediate self-discipline.

### Final Verdict
**Delay the purchase.** If you still want the item after 48 hours and can buy it without credit, go ahead. Otherwise, avoid it.`;
      } 
      else if (/\b(?:exam|upsc|jee|study|learn|gate|cat|prepare)\b/i.test(qLower)) {
        tags = ['learning', 'productivity'];
        recommendation = `### Core Recommendation
* **Adopt the 50-10 Pomodoro Method**: Study for 50 minutes with absolute focus, then take a 10-minute active break (stretch, drink water, do not look at social media).
* Create a micro-syllabus; do not look at the entire book. Divide it into weekly sub-chapters.
* Use spaced repetition checklists for high-yield topics (like Polity articles or math formulas).

### Pros & Cons
* **Pros**: Retains 3x more information, reduces study anxiety, builds consistency.
* **Cons**: Hard to maintain focus initial 3 days. Demands logging off social apps.

### Final Verdict
**Focus on consistency over duration.** 4 hours of focused, daily distraction-free study is vastly superior to a 10-hour unstructured binge. Start tracking your progress with the Study Coach tab!`;
      } 
      else if (/\b(?:chai|snack|health|diet|habit|sleep|active)\b/i.test(qLower)) {
        tags = ['lifestyle'];
        recommendation = `### Core Recommendation
* **Reduce Chai consumption to 1-2 cups maximum per day**, switching from sugar to jaggery (gur) or no sugar.
* Replace deep-fried snacks (samosas, pakodas, chips) with roasted makhana, chana, or mixed dry fruits.
* Stand and stretch for 2 minutes every hour during sitting jobs.

### Pros & Cons
* **Pros**: Enhances focus, eliminates afternoon energy crashes, reduces risk of lifestyle issues.
* **Cons**: Initial sugar/caffeine withdrawal headache.

### Final Verdict
**Optimize your snacks.** Carry a box of roasted chana or almonds to office to bypass the evening canteen fried food temptation. Hydrate with warm water.`;
      } 
      else {
        tags = ['lifestyle', 'productivity'];
        recommendation = `### Core Recommendation
* **Deconstruct the decision into small chunks**: What is the immediate cost? What is the time commitment?
* Write down the worst-case scenario. If the worst case is acceptable and reversible, move forward.
* Set a strict 24-hour deadline to make a final choice to avoid analysis paralysis.

### Pros & Cons
* **Pros**: Removes emotional bias, ensures logical evaluation.
* **Cons**: Requires pausing to think, which feels slower initially.

### Final Verdict
**Apply the 10/10/10 rule.** How will you feel about this choice in 10 minutes? 10 months? 10 years? Let this guide your everyday decisions.`;
      }
    }

    const decision = await DecisionRepository.create({
      user_id: userId,
      query,
      recommendation,
      context_tags: tags
    });

    return res.status(201).json({
      message: 'Decision evaluated by AI Pilot!',
      decision
    });

  } catch (error) {
    console.error('Create decision error:', error);
    return res.status(500).json({ error: 'Server error. Failed to process decision.' });
  }
};
