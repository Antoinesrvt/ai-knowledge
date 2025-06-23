import { db } from '@/lib/db/client';
import { eq, desc, count } from 'drizzle-orm';
import { document, chat } from '../schema';
import { ChatSDKError } from '@/lib/errors';

export async function getRecentActivity(userId: string) {
  try {
    const [recentDocuments, recentChats] = await Promise.all([
      db
        .select()
        .from(document)
        .where(eq(document.userId, userId))
        .orderBy(desc(document.updatedAt))
        .limit(5),
      db
        .select()
        .from(chat)
        .where(eq(chat.userId, userId))
        .orderBy(desc(chat.updatedAt))
        .limit(5)
    ]);

    return { recentDocuments, recentChats };
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get recent activity');
  }
}

export async function getStats(userId: string) {
  try {
    const [documentCount, chatCount] = await Promise.all([
      db
        .select({ count: count() })
        .from(document)
        .where(eq(document.userId, userId))
        .then((result) => result[0]?.count ?? 0),
      db
        .select({ count: count() })
        .from(chat)
        .where(eq(chat.userId, userId))
        .then((result) => result[0]?.count ?? 0)
    ]);

    return { documentCount, chatCount };
  } catch (error) {
    throw new ChatSDKError('bad_request:database', 'Failed to get stats');
  }
}