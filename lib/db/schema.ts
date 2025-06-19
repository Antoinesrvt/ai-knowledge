import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
  linkedDocumentId: uuid('linkedDocumentId'),
  linkedDocumentCreatedAt: timestamp('linkedDocumentCreatedAt'),
});

export type Chat = InferSelectModel<typeof chat>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const messageDeprecated = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type MessageDeprecated = InferSelectModel<typeof messageDeprecated>;

export const message = pgTable('Message_v2', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  parts: json('parts').notNull(),
  attachments: json('attachments').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type DBMessage = InferSelectModel<typeof message>;

// DEPRECATED: The following schema is deprecated and will be removed in the future.
// Read the migration guide at https://chat-sdk.dev/docs/migration-guides/message-parts
export const voteDeprecated = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => messageDeprecated.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type VoteDeprecated = InferSelectModel<typeof voteDeprecated>;

export const vote = pgTable(
  'Vote_v2',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    visibility: varchar('visibility', { enum: ['public', 'private'] })
      .notNull()
      .default('private'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    pendingChanges: json('pendingChanges'),
    hasUnpushedChanges: boolean('hasUnpushedChanges').notNull().default(false),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
  );

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const stream = pgTable(
  'Stream',
  {
    id: uuid('id').notNull().defaultRandom(),
    chatId: uuid('chatId').notNull(),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    chatRef: foreignKey({
      columns: [table.chatId],
      foreignColumns: [chat.id],
    }),
  }),
);

export type Stream = InferSelectModel<typeof stream>;

// Git-like Document Versioning System
export const documentBranch = pgTable(
  'DocumentBranch',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    name: varchar('name', { length: 255 }).notNull(), // 'main', 'ai-exploration-1', etc.
    parentBranchId: uuid('parentBranchId'),
    createdByType: varchar('createdByType', { enum: ['user', 'ai'] }).notNull(),
    createdById: uuid('createdById').notNull(), // user_id or message_id
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
    parentBranchRef: foreignKey({
      columns: [table.parentBranchId],
      foreignColumns: [table.id],
    }),
  }),
);

export type DocumentBranch = InferSelectModel<typeof documentBranch>;

export const documentVersion = pgTable(
  'DocumentVersion',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    branchId: uuid('branchId')
      .notNull()
      .references(() => documentBranch.id),
    content: text('content').notNull(),
    commitMessage: text('commitMessage'),
    authorType: varchar('authorType', { enum: ['user', 'ai'] }).notNull(),
    authorId: uuid('authorId').notNull(), // user_id or message_id
    parentVersionId: uuid('parentVersionId'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    parentVersionRef: foreignKey({
      columns: [table.parentVersionId],
      foreignColumns: [table.id],
    }),
  }),
);

export type DocumentVersion = InferSelectModel<typeof documentVersion>;

export const documentMerge = pgTable('DocumentMerge', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  sourceBranchId: uuid('sourceBranchId')
    .notNull()
    .references(() => documentBranch.id),
  targetBranchId: uuid('targetBranchId')
    .notNull()
    .references(() => documentBranch.id),
  mergedVersionId: uuid('mergedVersionId')
    .notNull()
    .references(() => documentVersion.id),
  mergedByType: varchar('mergedByType', { enum: ['user', 'ai'] }).notNull(),
  mergedById: uuid('mergedById').notNull(),
  mergeStrategy: varchar('mergeStrategy', { enum: ['auto', 'manual'] }).notNull().default('manual'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type DocumentMerge = InferSelectModel<typeof documentMerge>;

// Chat-Document Relationships
export const chatDocument = pgTable(
  'ChatDocument',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    branchId: uuid('branchId')
      .references(() => documentBranch.id),
    linkedAt: timestamp('linkedAt').notNull().defaultNow(),
    linkType: varchar('linkType', { enum: ['created', 'referenced', 'updated'] }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.chatId, table.documentId] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type ChatDocument = InferSelectModel<typeof chatDocument>;

// Branch Creation Requests (for AI permission system)
export const branchRequest = pgTable(
  'BranchRequest',
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    proposedName: varchar('proposedName', { length: 255 }).notNull(),
    reason: text('reason'),
    requestedByType: varchar('requestedByType', { enum: ['ai'] }).notNull(),
    requestedById: uuid('requestedById').notNull(), // message_id
    status: varchar('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
    respondedAt: timestamp('respondedAt'),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
  },
  (table) => ({
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type BranchRequest = InferSelectModel<typeof branchRequest>;

// Re-export pending changes schema
export { pendingChange, type PendingChange } from './schema-pending-changes';
