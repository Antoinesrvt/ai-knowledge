import { relations } from "drizzle-orm/relations";
import { user, chat, suggestion, document, message, messageV2, stream, documentBranch, documentMerge, documentVersion, branchRequest, vote, voteV2, chatDocument } from "./schema";

export const chatRelations = relations(chat, ({one, many}) => ({
	user: one(user, {
		fields: [chat.userId],
		references: [user.id]
	}),
	messages: many(message),
	messageV2s: many(messageV2),
	streams: many(stream),
	votes: many(vote),
	voteV2s: many(voteV2),
	chatDocuments: many(chatDocument),
}));

export const userRelations = relations(user, ({many}) => ({
	chats: many(chat),
	suggestions: many(suggestion),
	documents: many(document),
}));

export const suggestionRelations = relations(suggestion, ({one}) => ({
	user: one(user, {
		fields: [suggestion.userId],
		references: [user.id]
	}),
	document: one(document, {
		fields: [suggestion.documentId],
		references: [document.id]
	}),
}));

export const documentRelations = relations(document, ({one, many}) => ({
	suggestions: many(suggestion),
	documentBranches: many(documentBranch),
	branchRequests: many(branchRequest),
	chatDocuments: many(chatDocument),
	user: one(user, {
		fields: [document.userId],
		references: [user.id]
	}),
}));

export const messageRelations = relations(message, ({one, many}) => ({
	chat: one(chat, {
		fields: [message.chatId],
		references: [chat.id]
	}),
	votes: many(vote),
}));

export const messageV2Relations = relations(messageV2, ({one, many}) => ({
	chat: one(chat, {
		fields: [messageV2.chatId],
		references: [chat.id]
	}),
	voteV2s: many(voteV2),
}));

export const streamRelations = relations(stream, ({one}) => ({
	chat: one(chat, {
		fields: [stream.chatId],
		references: [chat.id]
	}),
}));

export const documentBranchRelations = relations(documentBranch, ({one, many}) => ({
	documentBranch: one(documentBranch, {
		fields: [documentBranch.parentBranchId],
		references: [documentBranch.id],
		relationName: "documentBranch_parentBranchId_documentBranch_id"
	}),
	documentBranches: many(documentBranch, {
		relationName: "documentBranch_parentBranchId_documentBranch_id"
	}),
	document: one(document, {
		fields: [documentBranch.documentId],
		references: [document.id]
	}),
	documentMerges_sourceBranchId: many(documentMerge, {
		relationName: "documentMerge_sourceBranchId_documentBranch_id"
	}),
	documentMerges_targetBranchId: many(documentMerge, {
		relationName: "documentMerge_targetBranchId_documentBranch_id"
	}),
	documentVersions: many(documentVersion),
	chatDocuments: many(chatDocument),
}));

export const documentMergeRelations = relations(documentMerge, ({one}) => ({
	documentBranch_sourceBranchId: one(documentBranch, {
		fields: [documentMerge.sourceBranchId],
		references: [documentBranch.id],
		relationName: "documentMerge_sourceBranchId_documentBranch_id"
	}),
	documentBranch_targetBranchId: one(documentBranch, {
		fields: [documentMerge.targetBranchId],
		references: [documentBranch.id],
		relationName: "documentMerge_targetBranchId_documentBranch_id"
	}),
	documentVersion: one(documentVersion, {
		fields: [documentMerge.mergedVersionId],
		references: [documentVersion.id]
	}),
}));

export const documentVersionRelations = relations(documentVersion, ({one, many}) => ({
	documentMerges: many(documentMerge),
	documentBranch: one(documentBranch, {
		fields: [documentVersion.branchId],
		references: [documentBranch.id]
	}),
	documentVersion: one(documentVersion, {
		fields: [documentVersion.parentVersionId],
		references: [documentVersion.id],
		relationName: "documentVersion_parentVersionId_documentVersion_id"
	}),
	documentVersions: many(documentVersion, {
		relationName: "documentVersion_parentVersionId_documentVersion_id"
	}),
}));

export const branchRequestRelations = relations(branchRequest, ({one}) => ({
	document: one(document, {
		fields: [branchRequest.documentId],
		references: [document.id]
	}),
}));

export const voteRelations = relations(vote, ({one}) => ({
	chat: one(chat, {
		fields: [vote.chatId],
		references: [chat.id]
	}),
	message: one(message, {
		fields: [vote.messageId],
		references: [message.id]
	}),
}));

export const voteV2Relations = relations(voteV2, ({one}) => ({
	chat: one(chat, {
		fields: [voteV2.chatId],
		references: [chat.id]
	}),
	messageV2: one(messageV2, {
		fields: [voteV2.messageId],
		references: [messageV2.id]
	}),
}));

export const chatDocumentRelations = relations(chatDocument, ({one}) => ({
	chat: one(chat, {
		fields: [chatDocument.chatId],
		references: [chat.id]
	}),
	documentBranch: one(documentBranch, {
		fields: [chatDocument.branchId],
		references: [documentBranch.id]
	}),
	document: one(document, {
		fields: [chatDocument.documentId],
		references: [document.id]
	}),
}));