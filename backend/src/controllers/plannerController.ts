import { Response } from 'express';
import { TaskRepository, ProfileRepository } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/auth';
import OpenAI from 'openai';

// Initialize OpenAI client if API key is provided
const openaiKey = process.env.OPENAI_API_KEY;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { date } = req.query; // YYYY-MM-DD
    
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });
    
    const queryDate = date ? String(date) : new Date().toISOString().split('T')[0];
    const tasks = await TaskRepository.findAllByUserId(userId, queryDate);
    
    return res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ error: 'Server error. Failed to retrieve tasks.' });
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { title, description, priority, durationMins, startTime, date } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const taskDate = date || new Date().toISOString().split('T')[0];
    let parsedStart: Date | undefined;
    let parsedEnd: Date | undefined;

    if (startTime) {
      parsedStart = new Date(startTime);
      parsedEnd = new Date(parsedStart.getTime() + (durationMins || 30) * 60 * 1000);
    }

    const newTask = await TaskRepository.create({
      user_id: userId,
      title,
      description: description || '',
      priority: priority || 'medium',
      duration_mins: Number(durationMins) || 30,
      status: 'pending',
      start_time: parsedStart,
      end_time: parsedEnd,
      date: taskDate
    });

    return res.status(201).json({
      message: 'Task added successfully!',
      task: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Server error. Failed to add task.' });
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { title, description, priority, durationMins, status, startTime, date } = req.body;
    
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (durationMins !== undefined) updateData.duration_mins = Number(durationMins);
    if (status !== undefined) updateData.status = status;
    if (date !== undefined) updateData.date = date;

    if (startTime !== undefined) {
      if (startTime === null) {
        updateData.start_time = null;
        updateData.end_time = null;
      } else {
        const parsedStart = new Date(startTime);
        const mins = durationMins || 30;
        updateData.start_time = parsedStart;
        updateData.end_time = new Date(parsedStart.getTime() + mins * 60 * 1000);
      }
    }

    const updatedTask = await TaskRepository.update(id, userId, updateData);
    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    return res.json({
      message: 'Task updated successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Server error. Failed to update task.' });
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const success = await TaskRepository.delete(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }

    return res.json({ message: 'Task deleted successfully!' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Server error. Failed to delete task.' });
  }
};

// AI Schedule Optimization
export const optimizeSchedule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

    const { date } = req.body; // YYYY-MM-DD
    const targetDate = date || new Date().toISOString().split('T')[0];

    const tasks = await TaskRepository.findAllByUserId(userId, targetDate);
    const profile = await ProfileRepository.findByUserId(userId);
    const userLocation = profile?.location || 'India';

    if (tasks.length === 0) {
      return res.status(400).json({ error: 'Please add some tasks before optimizing the schedule.' });
    }

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    if (pendingTasks.length === 0) {
      return res.json({
        message: 'All tasks are completed! No optimization needed.',
        tasks
      });
    }

    let optimizedTasks: any[] = [];
    let focusInsights = '';

    if (openai) {
      try {
        const prompt = `
          You are LifePilot AI, a premium productivity assistant.
          The user is located in ${userLocation}.
          Below are their tasks for ${targetDate}:
          ${JSON.stringify(pendingTasks.map(t => ({ id: t.id, title: t.title, description: t.description, priority: t.priority, duration_mins: t.duration_mins })))}
          
          Generate a realistic, optimized daily schedule starting from 9:00 AM.
          Rules:
          - Prioritize high priority tasks earlier in the day when focus is highest.
          - Add brief breaks (5-15 mins) between demanding tasks.
          - Incorporate lunch time (~1:00 PM to 2:00 PM) and a brief evening walk or chai break (~5:30 PM).
          - Provide estimated start_time and end_time (in ISO formats) for each task. Keep the date as ${targetDate}.
          - Do not exceed 8 focus hours.
          - Return a JSON object with:
            1. "schedule": Array of optimized tasks including breaks (type: "break" or "task"). Break items should not have database IDs.
            2. "insights": A brief text description (under 120 words) with tips for the user (Indian context, eg. hydration, traffic warnings, exam revisions).
        `;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });

        const data = JSON.parse(response.choices[0].message.content || '{}');
        optimizedTasks = data.schedule || [];
        focusInsights = data.insights || 'Your day is successfully organized!';
      } catch (err) {
        console.warn("OpenAI optimization failed, using local optimization fallback", err);
      }
    }

    // Local Optimization Fallback
    if (optimizedTasks.length === 0) {
      // Sort tasks: high priority first, then medium, then low
      const sorted = [...pendingTasks].sort((a, b) => {
        const priorityVal = { high: 3, medium: 2, low: 1 };
        return priorityVal[b.priority] - priorityVal[a.priority];
      });

      let currentHour = 9;
      let currentMin = 0;
      
      const formatTime = (hour: number, min: number) => {
        const d = new Date(targetDate);
        d.setHours(hour, min, 0, 0);
        return d;
      };

      for (let i = 0; i < sorted.length; i++) {
        const task = sorted[i];
        
        // Check for Lunch break
        if (currentHour === 13 && currentMin === 0) {
          // Lunch Break
          currentHour += 1; // 1 hour lunch
        } else if (currentHour >= 13 && currentHour < 14) {
          currentHour = 14;
          currentMin = 0;
        }

        // Check for Tea/Chai break around 4:30 - 5:00 PM
        if (currentHour === 16 && currentMin >= 30) {
          currentHour = 17;
          currentMin = 0;
        }

        const start = formatTime(currentHour, currentMin);
        currentMin += task.duration_mins;
        if (currentMin >= 60) {
          currentHour += Math.floor(currentMin / 60);
          currentMin = currentMin % 60;
        }
        const end = formatTime(currentHour, currentMin);

        optimizedTasks.push({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          duration_mins: task.duration_mins,
          status: 'pending',
          start_time: start,
          end_time: end
        });

        // Add a micro break (10 mins) after each task
        if (i < sorted.length - 1) {
          currentMin += 10;
          if (currentMin >= 60) {
            currentHour += 1;
            currentMin -= 60;
          }
        }
      }

      focusInsights = `Scheduled high-priority work early in the morning when mental energy is peak. We have auto-placed breaks to avoid burnout, and left the late afternoon for low-priority follow-ups. Stay hydrated with local nimbu paani or coconut water!`;
    }

    // Save optimized times back to Database
    const updatedPendingList: any[] = [];
    for (const item of optimizedTasks) {
      if (item.id) { // Real tasks (not generated breaks)
        const updated = await TaskRepository.update(item.id, userId, {
          start_time: new Date(item.start_time),
          end_time: new Date(item.end_time)
        });
        if (updated) {
          updatedPendingList.push(updated);
        }
      } else {
        // Break items are passed to the frontend dynamically
        updatedPendingList.push({
          id: `break-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title || 'Micro Break ☕',
          description: 'Focus reset / stretching',
          priority: 'low',
          duration_mins: item.duration_mins || 15,
          status: 'completed',
          start_time: new Date(item.start_time),
          end_time: new Date(item.end_time),
          isBreak: true
        });
      }
    }

    // Combine with completed tasks
    const allFinalTasks = [...completedTasks, ...updatedPendingList].sort((a, b) => {
      if (a.start_time && b.start_time) return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      return 0;
    });

    // Award productivity score boost for optimizing schedule
    let newScore = (profile?.productivity_score || 70) + 5;
    if (newScore > 100) newScore = 100;
    await ProfileRepository.update(userId, { productivity_score: newScore });

    return res.json({
      message: 'AI Daily Schedule optimized successfully!',
      tasks: allFinalTasks,
      insights: focusInsights,
      productivityScore: newScore
    });

  } catch (error) {
    console.error('Schedule optimization error:', error);
    return res.status(500).json({ error: 'Server error. Failed to optimize schedule.' });
  }
};
