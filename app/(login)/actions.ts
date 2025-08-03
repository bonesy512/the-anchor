'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, type NewUser } from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { validatedAction } from '@/lib/auth/middleware';

// --- Sign In Action ---
const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { email, password } = data;

  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (userResult.length === 0) {
    return { error: 'Invalid email or password.', email, password };
  }

  const foundUser = userResult[0];
  const isPasswordValid = await comparePasswords(password, foundUser.passwordHash);

  if (!isPasswordValid) {
    return { error: 'Invalid email or password.', email, password };
  }

  await setSession(foundUser);
  redirect('/dashboard');
});


// --- Sign Up Action ---
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { error: 'An account with this email already exists.', email, password };
  }

  const passwordHash = await hashPassword(password);
  const newUser: NewUser = { email, passwordHash };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return { error: 'Failed to create user. Please try again.', email, password };
  }

  await setSession(createdUser);
  redirect('/dashboard');
});


// --- Sign Out Action ---
export async function signOut() {
  // FIX: Added 'await' before cookies()
  (await cookies()).delete('session');
  redirect('/');
}

// NOTE: All other actions like updatePassword, deleteAccount, etc., have been removed for simplicity.
// We can add them back later with our new, simplified logic if needed.
