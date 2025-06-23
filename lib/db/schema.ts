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
  integer,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  stackUserId: varchar('stackUserId', { length: 255 }).unique(), // Stack Auth user ID
  displayName: varchar('displayName', { length: 255 }),
  profileImageUrl: text('profileImageUrl'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Organizations for multi-tenancy
export const organization = pgTable('Organization', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  logoUrl: text('logoUrl'),
  stackTeamId: varchar('stackTeamId', { length: 255 }).unique(), // Stack Auth team ID
  plan: varchar('plan', { enum: ['free', 'pro', 'enterprise'] }).notNull().default('free'),
  maxMembers: integer('maxMembers').default(5),
  maxDocuments: integer('maxDocuments').default(100),
  maxChats: integer('maxChats').default(500),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Organization memberships with roles
export const organizationMember = pgTable(
  'OrganizationMember',
  {
    id: uuid('id').notNull().defaultRandom(),
    organizationId: uuid('organizationId')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: varchar('role', { enum: ['owner', 'admin', 'member', 'viewer'] })
      .notNull()
      .default('member'),
    permissions: json('permissions'), // Custom permissions object
    invitedAt: timestamp('invitedAt'),
    joinedAt: timestamp('joinedAt').notNull().defaultNow(),
    invitedBy: uuid('invitedBy').references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.organizationId, table.userId] }),
  }),
);

// Teams within organizations
export const team = pgTable('Team', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  organizationId: uuid('organizationId')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 7 }), // Hex color code
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Team memberships
export const teamMember = pgTable(
  'TeamMember',
  {
    id: uuid('id').notNull().defaultRandom(),
    teamId: uuid('teamId')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: varchar('role', { enum: ['lead', 'member'] })
      .notNull()
      .default('member'),
    joinedAt: timestamp('joinedAt').notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.teamId, table.userId] }),
  }),
);

export type User = InferSelectModel<typeof user>;
export type Organization = InferSelectModel<typeof organization>;
export type OrganizationMember = InferSelectModel<typeof organizationMember>;
export type Team = InferSelectModel<typeof team>;
export type TeamMember = InferSelectModel<typeof teamMember>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  organizationId: uuid('organizationId')
    .references(() => organization.id),
  teamId: uuid('teamId')
    .references(() => team.id),
  visibility: varchar('visibility', { enum: ['public', 'private', 'organization', 'team'] })
    .notNull()
    .default('private'),
  linkedDocumentId: uuid('linkedDocumentId'),
  linkedDocumentCreatedAt: timestamp('linkedDocumentCreatedAt'),
  // New fields for workspace refactor
  workspaceType: varchar('workspaceType', { enum: ['document', 'chat'] }),
  primaryDocumentId: uuid('primaryDocumentId'),
  primaryDocumentCreatedAt: timestamp('primaryDocumentCreatedAt'),
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
    visibility: varchar('visibility', { enum: ['public', 'private', 'organization', 'team'] })
      .notNull()
      .default('private'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    organizationId: uuid('organizationId')
      .references(() => organization.id),
    teamId: uuid('teamId')
      .references(() => team.id),
    pendingChanges: json('pendingChanges'),
    hasUnpushedChanges: boolean('hasUnpushedChanges').notNull().default(false),
    // New fields for workspace refactor
    currentMainChatId: uuid('currentMainChatId'),
    lastViewMode: varchar('lastViewMode', { enum: ['document', 'chat', 'split'] }).default('document'),
    lastAccessedAt: timestamp('lastAccessedAt').defaultNow(),
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
    relationshipType: varchar('relationshipType', { enum: ['main_chat', 'created', 'modified'] }).notNull(),
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

// Document Main Chat tracking
export const documentMainChat = pgTable(
  'DocumentMainChat',
  {
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    isActive: boolean('isActive').notNull().default(true),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    deactivatedAt: timestamp('deactivatedAt'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.documentId, table.chatId] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type DocumentMainChat = InferSelectModel<typeof documentMainChat>;

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
