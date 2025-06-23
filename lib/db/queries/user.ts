import { db } from '@/lib/db/client';
import { eq } from 'drizzle-orm';
import { user } from '../schema';
import { generateHashedPassword } from '../utils';
import { generateUUID } from '@/lib/utils'
import { ChatSDKError } from '@/lib/errors';

export async function getUser(email: string) {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get user by email',
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);
  const [newUser] = await db
    .insert(user)
    .values({
      email,
      password: hashedPassword,
    })
    .returning();
  return newUser;
}

export async function createGuestUser() {
  const guestId = generateUUID();
  const [newUser] = await db
    .insert(user)
    .values({
      id: guestId,
      email: `guest-${guestId}@example.com`,
      password: generateHashedPassword('guest-password'),
    })
    .returning();
  return newUser;
}

export async function syncStackUser(stackUser: {
  id: string;
  primaryEmail: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
}) {
  if (!stackUser.primaryEmail) {
    throw new Error('User email is required');
  }

  const existingUsers = await getUser(stackUser.primaryEmail);
  
  if (existingUsers.length > 0) {
    // Update existing user
    const [updatedUser] = await db
      .update(user)
      .set({
        stackUserId: stackUser.id,
        displayName: stackUser.displayName,
        profileImageUrl: stackUser.profileImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(user.email, stackUser.primaryEmail))
      .returning();
    return updatedUser;
  } else {
    // Create new user
    const [newUser] = await db
      .insert(user)
      .values({
        stackUserId: stackUser.id,
        email: stackUser.primaryEmail,
        displayName: stackUser.displayName,
        profileImageUrl: stackUser.profileImageUrl,
        password: generateHashedPassword('stack-auth-user'),
      })
      .returning();
    return newUser;
  }
}