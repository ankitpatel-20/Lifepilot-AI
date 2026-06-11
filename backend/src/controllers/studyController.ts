import { Response } from 'express';
import { StudyPlanRepository, SpacedRevisionRepository, ProfileRepository } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/auth';

export const getStudyPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const plans = await StudyPlanRepository.findAllByUserId(userId);
    const revisions = await SpacedRevisionRepository.findAllByUserId(userId);

    return res.json({ plans, revisions });
  } catch (error) {
    console.error('Get study plans error:', error);
    return res.status(500).json({ error: 'Server error. Failed to retrieve study dashboard.' });
  }
};

export const createStudyPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { subject, targetDate, totalTopics } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject/Topic name is required.' });
    }

    const plan = await StudyPlanRepository.create({
      user_id: userId,
      subject,
      target_date: targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      topics_completed: 0,
      total_topics: Number(totalTopics) || 5
    });

    return res.status(201).json({
      message: 'New study track created!',
      plan
    });
  } catch (error) {
    console.error('Create study plan error:', error);
    return res.status(500).json({ error: 'Server error. Failed to create study plan.' });
  }
};

export const updateStudyProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { topicsCompleted, totalTopics, subject } = req.body;

    const currentPlans = await StudyPlanRepository.findAllByUserId(userId);
    const targetPlan = currentPlans.find(p => p.id === id);

    if (!targetPlan) {
      return res.status(404).json({ error: 'Study plan not found.' });
    }

    const finalCompleted = topicsCompleted !== undefined ? Number(topicsCompleted) : targetPlan.topics_completed;
    const finalTotal = totalTopics !== undefined ? Number(totalTopics) : targetPlan.total_topics;
    
    // Calculate progress percentage
    const progress = Math.min(100, Math.max(0, Math.round((finalCompleted / finalTotal) * 100)));

    const updated = await StudyPlanRepository.update(id, userId, {
      topics_completed: finalCompleted,
      total_topics: finalTotal,
      progress
    });

    // Check if user completed a new topic and trigger Spaced Repetition
    if (topicsCompleted !== undefined && topicsCompleted > targetPlan.topics_completed) {
      // Auto-schedule a spaced revision topic
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 3); // Review in 3 days
      const dateStr = nextDate.toISOString().split('T')[0];

      await SpacedRevisionRepository.create({
        user_id: userId,
        topic: `Revision: ${targetPlan.subject} - Session ${finalCompleted}`,
        last_reviewed: new Date().toISOString().split('T')[0],
        next_review: dateStr,
        status: 'pending'
      });
    }

    // Award productivity score boost for studying
    const profile = await ProfileRepository.findByUserId(userId);
    let newScore = (profile?.productivity_score || 70) + 4;
    if (newScore > 100) newScore = 100;
    await ProfileRepository.update(userId, { productivity_score: newScore });

    return res.json({
      message: 'Study progress saved!',
      plan: updated,
      productivityScore: newScore
    });

  } catch (error) {
    console.error('Update study progress error:', error);
    return res.status(500).json({ error: 'Server error. Failed to save study progress.' });
  }
};

export const completeRevision = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    // Mark as reviewed and reschedule for 7 days later
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 7); // Spaced rep: next check 7 days out
    const dateStr = nextDate.toISOString().split('T')[0];

    const updated = await SpacedRevisionRepository.update(id, userId, {
      status: 'reviewed',
      last_reviewed: new Date().toISOString().split('T')[0],
      next_review: dateStr
    });

    if (!updated) {
      return res.status(404).json({ error: 'Revision record not found.' });
    }

    return res.json({
      message: 'Spaced revision milestone completed! Next review scheduled in 7 days.',
      revision: updated
    });
  } catch (error) {
    console.error('Complete revision error:', error);
    return res.status(500).json({ error: 'Server error. Failed to complete spaced revision.' });
  }
};
