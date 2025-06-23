import { db } from '@/lib/db/client';
import { eq, and, desc } from 'drizzle-orm';
import { suggestion, document } from '../schema';
import { generateUUID } from '@/lib/utils';
import { ChatSDKError } from '@/lib/errors';
import type { Suggestion } from '../schema';

export async function saveSuggestions({
  suggestions,
  documentId,
}: {
  suggestions: Array<Omit<Suggestion, 'id' | 'documentId' | 'createdAt'>>;
  documentId: string;
}) {
  try {
    const suggestionsWithIds = suggestions.map((s) => ({
      ...s,
      id: generateUUID(),
      documentId,
      createdAt: new Date(),
    }));

    return await db.insert(suggestion).values(suggestionsWithIds).returning();
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to save suggestions',
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(eq(suggestion.documentId, documentId))
      .orderBy(suggestion.createdAt);
  } catch (error) {
    throw new ChatSDKError(
      'bad_request:database',
      'Failed to get suggestions by document ID',
    );
  }
}