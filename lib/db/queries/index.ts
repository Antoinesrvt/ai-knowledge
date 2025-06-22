// Export organization queries
export {
  createOrganization,
  getOrganizationById,
  getUserOrganizations,
  addOrganizationMember,
  removeOrganizationMember,
  updateOrganization,
} from './organization';

// Export team queries
export {
  createTeam,
  getTeamById,
  getOrganizationTeams,
  getUserTeams,
  addTeamMember,
  removeTeamMember,
  updateTeam,
} from './team';

// Export document queries
export {
  getDocuments,
  getDocumentsForUser,
  getDocumentById,
  getDocumentsById,
  createDocument,
  saveDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByTeam,
  getDocumentsByOrganization,
  getAccessibleDocuments,
  getPublicDocuments,
  searchDocuments,
} from './document';

// Export chat and message queries (consolidated)
export {
  getChats,
  getChatsByUserId,
  getChatById,
  getMessagesByChatId,
  saveChat,
  deleteChatById,
  getChatsForUser,
  getChatsByOrganization,
  getChatsByTeam,
  getAccessibleChats,
  saveMessages,
  getPublicChats,
  searchChats,
  getRecentChatActivity,
  updateChatVisiblityById,
  // Message functions
  getMessageById,
  voteMessage,
  getVotesByChatId,
  deleteMessagesByChatIdAfterTimestamp,
  getMessagesByUserId,
  getMessageCount,
  createStreamId,
  getStreamIdsByChatId,
} from './chat';

// Export user queries
export {
  getUser,
  createUser,
  createGuestUser,
  syncStackUser,
} from './user';

// Export suggestion queries
export {
  saveSuggestions,
  getSuggestionsByDocumentId,
} from './suggestion';

// Export branch queries
export {
  createBranchRequest,
  getBranchRequestsByDocument,
  updateBranchRequestStatus,
  createDocumentBranch,
  getDocumentBranches,
  createDocumentVersion,
  getBranchVersions,
} from './branch';

// Export link queries
export {
  linkChatToDocument,
  getDocumentChats,
  unlinkChatFromDocument,
  getChatLinkedDocument,
  getChatLinkedToDocument,
} from './link';

// Export pending change queries
export {
  createPendingChange,
  getPendingChanges,
  acceptPendingChange,
  rejectPendingChange,
  pushLocalChanges,
} from './pending-change';

// Export utility queries
export {
  getRecentActivity,
  getStats,
} from './utils';