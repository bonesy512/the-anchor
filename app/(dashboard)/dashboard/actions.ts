'use server';

import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { dailyLogs, anchorTasks, dailyAnchorTaskStatus, energyLevelEnum } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { revalidatePath } from 'next/cache';

const upsertLogSchema = z.object({
  energyLevel: z.enum(energyLevelEnum.enumValues),
});

export async function upsertDailyLog(energyLevel: 'low' | 'medium' | 'high') {
  const validation = upsertLogSchema.safeParse({ energyLevel });
  if (!validation.success) {
    return { error: 'Invalid energy level provided.' };
  }

  const user = await getUser();
  if (!user) {
    return { error: 'User not authenticated.' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the start of the day

  try {
    // Check if a log for today already exists
    const existingLog = await db.query.dailyLogs.findFirst({
      where: and(eq(dailyLogs.userId, user.id), eq(dailyLogs.logDate, today.toISOString().split('T')[0])),
    });

    if (existingLog) {
      // If log exists, just update the energy level
      await db
        .update(dailyLogs)
        .set({ energyLevel })
        .where(eq(dailyLogs.id, existingLog.id));
    } else {
      // If no log exists, create a new one
      const [newLog] = await db
        .insert(dailyLogs)
        .values({
          userId: user.id,
          logDate: today.toISOString().split('T')[0],
          energyLevel: energyLevel,
        })
        .returning();

      // AND create the associated task statuses for that day
      const userAnchorTasks = await db.query.anchorTasks.findMany({
        where: and(eq(anchorTasks.userId, user.id), eq(anchorTasks.isActive, true)),
      });

      if (userAnchorTasks.length > 0) {
        const newStatuses = userAnchorTasks.map(task => ({
          dailyLogId: newLog.id,
          anchorTaskId: task.id,
          isCompleted: false,
        }));
        await db.insert(dailyAnchorTaskStatus).values(newStatuses);
      }
    }

    revalidatePath('/dashboard');
    return { success: `Energy level set to ${energyLevel}.` };
  } catch (error) {
    console.error('Error in upsertDailyLog:', error);
    return { error: 'A database error occurred.' };
  }
}
