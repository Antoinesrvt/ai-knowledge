// Server Actions Index
// This file exports all server actions for easier imports

// Analytics Actions
export {
  getRecentActivityAction,
  getStatsAction,
  getOrganizationStatsAction,
  getTeamStatsAction,
  getUserActivityTimelineAction,
  getDashboardAnalyticsAction
} from './analytics'

// Branch Actions
export {
  createBranch
} from './branches'

// Chat Actions
export {
  saveChatAction
} from './chat'

// Dashboard Actions
export {
  getDashboardData
} from './dashboard'

// Document Actions
export {
  createDocument
} from './documents'

// Link Actions
export {
  linkChatToDocumentAction,
  getDocumentChatsAction,
  getChatDocumentsAction,
  unlinkChatFromDocumentAction,
  updateChatDocumentLinkAction,
  getChatDocumentLinkAction
} from './links'

// Organizations
export {
  createOrganizationAction,
  getOrganizationAction,
  getUserOrganizationsAction,
  addOrganizationMemberAction,
  removeOrganizationMemberAction,
  getOrganizationMembersAction,
  updateOrganizationAction
} from './organizations'

// Pending Changes Actions
export {
  createPendingChangeAction
} from './pending-changes'

// Suggestion Actions
export {
  createSuggestionAction
} from './suggestions'

// Teams
export {
  createTeamAction,
  getTeamAction,
  getOrganizationTeamsAction,
  getUserTeamsAction,
  addTeamMemberAction,
  removeTeamMemberAction,
  getTeamMembersAction,
  updateTeamAction,
  deleteTeamAction
} from './teams'

// User Actions
export {
  getUserAction,
  getUserByIdAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  searchUsersAction,
  getCurrentUserAction
} from './users'

// Version Actions
// Note: Add version action exports here when available