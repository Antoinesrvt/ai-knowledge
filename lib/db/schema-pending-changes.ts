import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';
import { document } from './schema';

// Pending Changes for AI-assisted IDE flow
export const pendingChange = pgTable(
  'PendingChange',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    changes: json('changes').notNull(), // Diff/patch data
    description: text('description').notNull(),
    changeType: varchar('changeType', { enum: ['ai_suggestion', 'user_edit'] }).notNull(),
    authorType: varchar('authorType', { enum: ['user', 'ai'] }).notNull(),
    authorId: uuid('authorId').notNull(), // user_id or message_id
    status: varchar('status', { enum: ['pending', 'accepted', 'rejected'] }).notNull().default('pending'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    resolvedAt: timestamp('resolvedAt'),
  },
  (table) => ({
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type PendingChange = InferSelectModel<typeof pendingChange>;