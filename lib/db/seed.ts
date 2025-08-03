import { db } from './drizzle';
import { users } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function seed() {
  console.log('Seeding initial user...');

  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  // Check if the user already exists to prevent errors on re-seeding
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, email),
  });

  if (!existingUser) {
    await db
      .insert(users)
      .values([
        {
          email: email,
          passwordHash: passwordHash,
        },
      ])
      .returning();
    console.log('Initial user created: test@test.com');
  } else {
    console.log('Initial user already exists. Skipping creation.');
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished successfully.');
    process.exit(0);
  });
