import { Response } from 'express';
import { ExpenseRepository, ProfileRepository } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import OpenAI from 'openai';

const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

export const getExpenses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const expenses = await ExpenseRepository.findAllByUserId(userId);
    return res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ error: 'Server error. Failed to retrieve expenses.' });
  }
};

export const createExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { amount, category, description, date, rawText } = req.body;

    let finalAmount = Number(amount);
    let finalCategory = category || 'Shopping';
    let finalDescription = description || '';
    let finalDate = date || new Date().toISOString().split('T')[0];
    let isWasteful = false;
    let savingsInsight = '';

    // Option 1: AI text parsing (if rawText is passed like "₹450 on Zomato Paneer dinner")
    if (rawText && rawText.trim() !== '') {
      if (openai) {
        try {
          const prompt = `
            You are a personal finance assistant in India.
            Parse this expense text: "${rawText}"
            Determine:
            1. The amount in Rupees (numeric).
            2. Category: Food, Transport, Rent, Entertainment, Subscriptions, Utilities, Shopping, or Healthcare.
            3. Clean description.
            4. If it is wasteful spending (true/false) in an everyday Indian budget context (e.g., food delivery markups, luxury app cabs, unused subscriptions, impulse fashion buying).
            5. A brief friendly recommendation (under 30 words) on how they could save or a cheaper alternative (e.g. Metro vs Cab, cooking vs Swiggy).
            
            Return JSON only:
            { "amount": number, "category": string, "description": string, "is_wasteful": boolean, "savings_insight": string }
          `;

          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' }
          });

          const data = JSON.parse(response.choices[0].message.content || '{}');
          if (data.amount) finalAmount = Number(data.amount);
          if (data.category) finalCategory = data.category;
          if (data.description) finalDescription = data.description;
          if (data.is_wasteful !== undefined) isWasteful = data.is_wasteful;
          if (data.savings_insight) savingsInsight = data.savings_insight;
        } catch (err) {
          console.warn("OpenAI expense parsing failed, using regex fallback", err);
        }
      }

      // Local Regex/Keyword Parser Fallback
      if (finalDescription === '') {
        const amountMatch = rawText.match(/(?:rs\.?|inr|₹|rs)\s*(\d+(?:\.\d+)?)/i) || rawText.match(/(\d+(?:\.\d+)?)\s*(?:rs|rupees|bucks|₹)/i);
        if (amountMatch) {
          finalAmount = Number(amountMatch[1]);
        } else {
          // Check for any number
          const numMatch = rawText.match(/\b\d+(?:\.\d+)?\b/);
          if (numMatch) finalAmount = Number(numMatch[0]);
        }

        finalDescription = rawText;
        const textLower = rawText.toLowerCase();

        // Categorize & audit based on Indian lifestyle keywords
        if (textLower.includes('swiggy') || textLower.includes('zomato') || textLower.includes('food') || textLower.includes('restaurant') || textLower.includes('dinner') || textLower.includes('lunch') || textLower.includes('biryani') || textLower.includes('cafe') || textLower.includes('coffee') || textLower.includes('starbucks')) {
          finalCategory = 'Food';
          if (finalAmount > 200 || textLower.includes('swiggy') || textLower.includes('zomato') || textLower.includes('starbucks')) {
            isWasteful = true;
            savingsInsight = textLower.includes('starbucks') 
              ? 'Starbucks coffee is a premium luxury. Switch to local tapri filter coffee or make home brews to save ₹250 per cup.'
              : 'Online food delivery has high markups. Eating at a local mess or cooking at home saves up to ₹250 per meal.';
          } else {
            savingsInsight = 'Budget-friendly meals are great for keeping daily dining expenses controlled!';
          }
        } else if (textLower.includes('uber') || textLower.includes('ola') || textLower.includes('auto') || textLower.includes('metro') || textLower.includes('cab') || textLower.includes('taxi') || textLower.includes('bus') || textLower.includes('petrol') || textLower.includes('fuel')) {
          finalCategory = 'Transport';
          if ((textLower.includes('uber') || textLower.includes('ola') || textLower.includes('cab')) && finalAmount > 150) {
            isWasteful = true;
            savingsInsight = 'Cab rides drain budgets fast. Choose the Metro or public bus services to cut transit costs by 70%.';
          } else {
            savingsInsight = 'Using public transit (Metro/Bus) keeps carbon emissions and wallet drains low!';
          }
        } else if (textLower.includes('netflix') || textLower.includes('spotify') || textLower.includes('hotstar') || textLower.includes('prime') || textLower.includes('youtube premium') || textLower.includes('subscription')) {
          finalCategory = 'Subscriptions';
          isWasteful = true;
          savingsInsight = 'Consider reviewing active OTT subscriptions. Cancel or pause platforms you have not watched this week.';
        } else if (textLower.includes('rent') || textLower.includes('pg') || textLower.includes('room') || textLower.includes('flat')) {
          finalCategory = 'Rent';
          savingsInsight = 'Fixed rent expense. Ensure it stays within 30-35% of your total take-home income.';
        } else if (textLower.includes('electricity') || textLower.includes('wifi') || textLower.includes('broadband') || textLower.includes('gas') || textLower.includes('bill') || textLower.includes('water')) {
          finalCategory = 'Utilities';
          savingsInsight = 'Utilities are essential. Switch off idle fans/ACs to optimize electricity consumption.';
        } else if (textLower.includes('medicine') || textLower.includes('doctor') || textLower.includes('clinic') || textLower.includes('hospital') || textLower.includes('health')) {
          finalCategory = 'Healthcare';
          savingsInsight = 'Essential health cost. Invest in health insurance to cover unexpected larger expenses.';
        } else {
          finalCategory = 'Shopping';
          if (finalAmount > 1000) {
            isWasteful = true;
            savingsInsight = 'Wait for 48 hours before major shopping purchases to avoid emotional or impulse buying.';
          } else {
            savingsInsight = 'Keep small retail purchases limited to pre-allocated pocket money.';
          }
        }
      }
    } else {
      // Manual input parsing
      if (!amount) {
        return res.status(400).json({ error: 'Please enter a valid expense amount.' });
      }

      // Add default insight if manual entry matches typical categories
      const descLower = finalDescription.toLowerCase();
      if (finalCategory === 'Food' && (descLower.includes('swiggy') || descLower.includes('zomato') || finalAmount > 300)) {
        isWasteful = true;
        savingsInsight = 'Premium dining delivery adds up quickly. Cooking or ordering from local tiffin services saves ₹200+';
      } else if (finalCategory === 'Transport' && (descLower.includes('uber') || descLower.includes('ola') || finalAmount > 250)) {
        isWasteful = true;
        savingsInsight = 'App cabs are convenient but expensive. Namma Metro/Auto shares save up to ₹150+';
      } else if (finalCategory === 'Subscriptions') {
        isWasteful = true;
        savingsInsight = 'OTT/music subscriptions compound silently. Audit active plans and share family packages.';
      } else {
        savingsInsight = 'Expense recorded successfully. Maintain your daily tracker to stay financially disciplined.';
      }
    }

    const expense = await ExpenseRepository.create({
      user_id: userId,
      amount: finalAmount,
      category: finalCategory,
      description: finalDescription,
      date: finalDate,
      is_wasteful: isWasteful,
      savings_insight: savingsInsight
    });

    // Award / adjust productivity score for tracking finances
    const profile = await ProfileRepository.findByUserId(userId);
    let newScore = (profile?.productivity_score || 70) + 2;
    if (newScore > 100) newScore = 100;
    await ProfileRepository.update(userId, { productivity_score: newScore });

    return res.status(201).json({
      message: 'Expense logged successfully!',
      expense,
      productivityScore: newScore
    });

  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ error: 'Server error. Failed to add expense.' });
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const success = await ExpenseRepository.delete(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found or unauthorized.' });
    }

    return res.json({ message: 'Expense deleted successfully!' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ error: 'Server error. Failed to delete expense.' });
  }
};
