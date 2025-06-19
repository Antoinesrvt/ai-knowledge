import { pgTable, uuid, varchar, foreignKey, timestamp, text, boolean, json, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 64 }),
});

export const chat = pgTable("Chat", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	userId: uuid().notNull(),
	title: text().notNull(),
	visibility: varchar().default('private').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		chatUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Chat_userId_User_id_fk"
		}),
	}
});

export const suggestion = pgTable("Suggestion", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
	originalText: text().notNull(),
	suggestedText: text().notNull(),
	description: text(),
	isResolved: boolean().default(false).notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		suggestionUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Suggestion_userId_User_id_fk"
		}),
		suggestionDocumentIdDocumentCreatedAtDocumentIdCreatedAtF: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
			name: "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f"
		}),
	}
});

export const message = pgTable("Message", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	content: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_chatId_Chat_id_fk"
		}),
	}
});

export const messageV2 = pgTable("Message_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	parts: json().notNull(),
	attachments: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_v2_chatId_Chat_id_fk"
		}),
	}
});

export const stream = pgTable("Stream", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		streamChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Stream_chatId_Chat_id_fk"
		}),
	}
});

export const documentBranch = pgTable("DocumentBranch", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	parentBranchId: uuid(),
	createdByType: varchar().notNull(),
	createdById: uuid().notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		documentBranchParentBranchIdDocumentBranchIdFk: foreignKey({
			columns: [table.parentBranchId],
			foreignColumns: [table.id],
			name: "DocumentBranch_parentBranchId_DocumentBranch_id_fk"
		}),
		documentBranchDocumentIdDocumentCreatedAtDocumentIdCreated: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
			name: "DocumentBranch_documentId_documentCreatedAt_Document_id_created"
		}),
	}
});

export const documentMerge = pgTable("DocumentMerge", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sourceBranchId: uuid().notNull(),
	targetBranchId: uuid().notNull(),
	mergedVersionId: uuid().notNull(),
	mergedByType: varchar().notNull(),
	mergedById: uuid().notNull(),
	mergeStrategy: varchar().default('manual').notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		documentMergeSourceBranchIdDocumentBranchIdFk: foreignKey({
			columns: [table.sourceBranchId],
			foreignColumns: [documentBranch.id],
			name: "DocumentMerge_sourceBranchId_DocumentBranch_id_fk"
		}),
		documentMergeTargetBranchIdDocumentBranchIdFk: foreignKey({
			columns: [table.targetBranchId],
			foreignColumns: [documentBranch.id],
			name: "DocumentMerge_targetBranchId_DocumentBranch_id_fk"
		}),
		documentMergeMergedVersionIdDocumentVersionIdFk: foreignKey({
			columns: [table.mergedVersionId],
			foreignColumns: [documentVersion.id],
			name: "DocumentMerge_mergedVersionId_DocumentVersion_id_fk"
		}),
	}
});

export const documentVersion = pgTable("DocumentVersion", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	branchId: uuid().notNull(),
	content: text().notNull(),
	commitMessage: text(),
	authorType: varchar().notNull(),
	authorId: uuid().notNull(),
	parentVersionId: uuid(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		documentVersionBranchIdDocumentBranchIdFk: foreignKey({
			columns: [table.branchId],
			foreignColumns: [documentBranch.id],
			name: "DocumentVersion_branchId_DocumentBranch_id_fk"
		}),
		documentVersionParentVersionIdDocumentVersionIdFk: foreignKey({
			columns: [table.parentVersionId],
			foreignColumns: [table.id],
			name: "DocumentVersion_parentVersionId_DocumentVersion_id_fk"
		}),
	}
});

export const branchRequest = pgTable("BranchRequest", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid().notNull(),
	proposedName: varchar({ length: 255 }).notNull(),
	reason: text(),
	requestedByType: varchar().notNull(),
	requestedById: uuid().notNull(),
	status: varchar().default('pending').notNull(),
	respondedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		branchRequestDocumentIdDocumentCreatedAtDocumentIdCreatedA: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
			name: "BranchRequest_documentId_documentCreatedAt_Document_id_createdA"
		}),
	}
});

export const vote = pgTable("Vote", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_chatId_Chat_id_fk"
		}),
		voteMessageIdMessageIdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "Vote_messageId_Message_id_fk"
		}),
		voteChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_chatId_messageId_pk"}),
	}
});

export const voteV2 = pgTable("Vote_v2", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_v2_chatId_Chat_id_fk"
		}),
		voteV2MessageIdMessageV2IdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [messageV2.id],
			name: "Vote_v2_messageId_Message_v2_id_fk"
		}),
		voteV2ChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_v2_chatId_messageId_pk"}),
	}
});

export const chatDocument = pgTable("ChatDocument", {
	chatId: uuid().notNull(),
	documentId: uuid().notNull(),
	branchId: uuid(),
	linkedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	linkType: varchar().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		chatDocumentChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "ChatDocument_chatId_Chat_id_fk"
		}),
		chatDocumentBranchIdDocumentBranchIdFk: foreignKey({
			columns: [table.branchId],
			foreignColumns: [documentBranch.id],
			name: "ChatDocument_branchId_DocumentBranch_id_fk"
		}),
		chatDocumentDocumentIdDocumentCreatedAtDocumentIdCreatedAt: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
			name: "ChatDocument_documentId_documentCreatedAt_Document_id_createdAt"
		}),
		chatDocumentChatIdDocumentIdPk: primaryKey({ columns: [table.chatId, table.documentId], name: "ChatDocument_chatId_documentId_pk"}),
	}
});

export const document = pgTable("Document", {
	id: uuid().defaultRandom().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	content: text(),
	userId: uuid().notNull(),
	text: varchar().default('text').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	visibility: varchar().default('private').notNull(),
},
(table) => {
	return {
		documentUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Document_userId_User_id_fk"
		}),
		documentIdCreatedAtPk: primaryKey({ columns: [table.id, table.createdAt], name: "Document_id_createdAt_pk"}),
	}
});