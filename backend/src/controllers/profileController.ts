import { Response } from 'express';
import { ProfileRepository } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/auth';

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { location, monthlyBudget, learningGoals, currency, productivityScore } = req.body;

    const updateData: any = {};
    if (location !== undefined) updateData.location = location;
    if (monthlyBudget !== undefined) updateData.monthly_budget = Number(monthlyBudget);
    if (learningGoals !== undefined) updateData.learning_goals = learningGoals;
    if (currency !== undefined) updateData.currency = currency;
    if (productivityScore !== undefined) updateData.productivity_score = Number(productivityScore);

    const updatedProfile = await ProfileRepository.update(userId, updateData);

    return res.json({
      message: 'Profile updated successfully!',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error. Failed to update profile.' });
  }
};
