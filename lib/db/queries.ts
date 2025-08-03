import { and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { users, dailyLogs } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    const sessionData = await verifyToken(sessionCookie.value);
    if (
      !sessionData ||
      !sessionData.user ||
      typeof sessionData.user.id !== 'number'
    ) {
      return null;
    }

    if (new Date(sessionData.expires) < new Date()) {
      return null;
    }

    const userResult = await db
      .select()
      .from(users)
      .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
      .limit(1);

    return userResult.length > 0 ? userResult[0] : null;
  } catch (error) {
    // Invalid token, session expired, etc.
    return null;
  }
}

// NEW FUNCTION: Gets the daily log and its associated task statuses for the current user and today's date.
export async function getDailyLogForToday() {
    const user = await getUser();
    if (!user) {
        return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day in the current timezone

    const log = await db.query.dailyLogs.findFirst({
        where: and(eq(dailyLogs.userId, user.id), eq(dailyLogs.logDate, today.toISOString().split('T')[0])),
        with: {
            taskStatuses: {
                with: {
                    anchorTask: true,
                },
            },
        },
    });

    return log || null;
}
