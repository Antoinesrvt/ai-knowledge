# Workspace Document-Chat Relationship Refactor Plan

## Vision Overview

The workspace system should support two distinct entry modes that both lead to a unified split-view experience:

1. **Document-First Mode**: User accesses a document, can initiate chat about it
2. **Chat-First Mode**: User accesses a chat, sees all documents it has modified/created

Both modes converge into the same split-view interface, but the user's last view preference is remembered per document.

## Core Principles

### 1. Dual Entry Points, Single Interface
- `/workspace/{documentId}` - Document-first entry
- `/workspace/{chatId}` - Chat-first entry  
- Both render the same `WorkspacePage` component in split-view
- No switching between modes within the interface - user must return to dashboard to change entry point

### 2. Document-Chat Relationships

**Document Perspective:**
- Each document can have multiple "main chats" (persistent conversations about this document)
- Track current active main chat per document
- When accessing document-first: auto-load current main chat or offer to create/select one
- Remember user's last view preference (document-focus vs chat-focus vs balanced)

**Chat Perspective:**
- Each chat maintains a list of documents it has created/modified (not just referenced)
- Only track documents when AI actually modifies/updates them
- Show document list as "workspace context" in chat-first mode

### 3. View State Persistence
- Remember last panel focus per document (document-focused, chat-focused, or balanced)
- Default to user's last preference when re-entering document
- Panel focus affects split ratios (70/30, 30/70, 50/50)

## Database Schema Changes

### Enhanced Document Table
```sql
ALTER TABLE "Document" ADD COLUMN "currentMainChatId" uuid REFERENCES "Chat"("id");
ALTER TABLE "Document" ADD COLUMN "lastViewMode" varchar DEFAULT 'balanced' CHECK (lastViewMode IN ('document', 'chat', 'balanced'));
ALTER TABLE "Document" ADD COLUMN "lastAccessedAt" timestamp DEFAULT NOW();
```

### Enhanced Chat Table
```sql
ALTER TABLE "Chat" ADD COLUMN "workspaceType" varchar DEFAULT 'standalone' CHECK (workspaceType IN ('standalone', 'document_main', 'document_secondary'));
ALTER TABLE "Chat" ADD COLUMN "primaryDocumentId" uuid REFERENCES "Document"("id");
ALTER TABLE "Chat" ADD COLUMN "primaryDocumentCreatedAt" timestamp;
```

### Simplified ChatDocument Table
```sql
-- Reset and simplify the relationship table
DROP TABLE "ChatDocument";

CREATE TABLE "ChatDocument" (
  "chatId" uuid NOT NULL REFERENCES "Chat"("id"),
  "documentId" uuid NOT NULL,
  "documentCreatedAt" timestamp NOT NULL,
  "relationshipType" varchar NOT NULL CHECK (relationshipType IN ('main_chat', 'created', 'modified')),
  "linkedAt" timestamp NOT NULL DEFAULT NOW(),
  "isActive" boolean DEFAULT true,
  PRIMARY KEY ("chatId", "documentId"),
  FOREIGN KEY ("documentId", "documentCreatedAt") REFERENCES "Document"("id", "createdAt")
);
```

### Document Main Chats Tracking
```sql
CREATE TABLE "DocumentMainChat" (
  "documentId" uuid NOT NULL,
  "documentCreatedAt" timestamp NOT NULL,
  "chatId" uuid NOT NULL REFERENCES "Chat"("id"),
  "createdAt" timestamp NOT NULL DEFAULT NOW(),
  "isActive" boolean DEFAULT true,
  "title" varchar(255),
  PRIMARY KEY ("documentId", "chatId"),
  FOREIGN KEY ("documentId", "documentCreatedAt") REFERENCES "Document"("id", "createdAt")
);
```

## Routing Logic

### URL Structure
- `/workspace/{id}` - Universal workspace entry
- ID can be either documentId or chatId
- System determines type by checking both tables
- Redirect logic ensures consistent URL structure

### Entry Point Detection
```typescript
// In workspace/[id]/page.tsx
async function determineWorkspaceType(id: string) {
  const [document, chat] = await Promise.all([
    getDocumentById(id),
    getChatById(id)
  ]);
  
  if (document && chat) {
    // Conflict - prefer document
    return { type: 'document', data: document };
  }
  
  if (document) {
    return { type: 'document', data: document };
  }
  
  if (chat) {
    return { type: 'chat', data: chat };
  }
  
  throw new Error('Workspace not found');
}
```

## Component Architecture

### WorkspacePage Component
```typescript
interface WorkspacePageProps {
  entryType: 'document' | 'chat';
  document: Document;
  chat: Chat | null;
  mainChats: DocumentMainChat[]; // For document entry
  relatedDocuments: Document[]; // For chat entry
  userPreferences: {
    lastViewMode: 'document' | 'chat' | 'balanced';
    panelSizes: { document: number; chat: number };
  };
}
```

### Document-First Mode Behavior
1. Load document content
2. Check for `currentMainChatId`
3. If exists: load chat and show split view
4. If not: show "Start Chat" options:
   - "Continue previous chat" (if main chats exist)
   - "Start new chat"
5. Apply user's last view mode preference

### Chat-First Mode Behavior
1. Load chat messages
2. Load all related documents (created/modified by this chat)
3. If chat has `primaryDocumentId`: highlight it and load content
4. Show document list in sidebar
5. Default to chat-focused view

## User Interaction Flows

### Starting a Chat from Document
1. User clicks "Chat about this document"
2. System checks existing main chats:
   - If none: create new main chat
   - If one: continue that chat
   - If multiple: show selection modal
3. Set as `currentMainChatId` for document
4. Switch to balanced or chat-focused view

### Document Modification from Chat
1. AI modifies document during chat
2. Create/update `ChatDocument` relationship with type 'modified'
3. Update document's `lastAccessedAt`
4. If this is the first modification, set chat as main chat option

### View Mode Persistence
1. User adjusts panel sizes or focus
2. Debounced save to `Document.lastViewMode`
3. Apply preference on next document access

## Implementation Phases

### Phase 1: Database Migration
- [ ] Create migration scripts for new schema
- [ ] Reset existing ChatDocument data (no backward compatibility)
- [ ] Add new columns to Document and Chat tables
- [ ] Create DocumentMainChat table

### Phase 2: Core Logic Updates
- [ ] Update workspace routing to handle dual entry points
- [ ] Implement workspace type detection
- [ ] Update document and chat query functions
- [ ] Create main chat management functions

### Phase 3: Component Refactoring
- [ ] Refactor WorkspacePage to handle both entry modes
- [ ] Update document-chat linking hooks
- [ ] Implement view mode persistence
- [ ] Add main chat selection UI

### Phase 4: AI Integration
- [ ] Update AI tools to track document modifications
- [ ] Implement automatic ChatDocument relationship creation
- [ ] Add document context awareness to chat

### Phase 5: UX Polish
- [ ] Add smooth transitions between view modes
- [ ] Implement document/chat selection interfaces
- [ ] Add visual indicators for relationship types
- [ ] Optimize loading states and error handling

## Key Technical Decisions

1. **No Mode Switching**: Users cannot switch between document-first and chat-first modes within the workspace - they must return to dashboard

2. **View Preference Persistence**: Each document remembers the user's preferred panel focus and sizes

3. **Relationship Tracking**: Only track document relationships when AI actually modifies them, not for references

4. **Main Chat Concept**: Documents can have multiple "main chats" but only one active at a time

5. **URL Consistency**: Single `/workspace/{id}` pattern handles both documents and chats transparently

6. **No Backward Compatibility**: Clean slate approach for existing chat-document relationships

This architecture provides a clean, intuitive workspace experience while maintaining the flexibility for complex document-chat relationships and user preferences.