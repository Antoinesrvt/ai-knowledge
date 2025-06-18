# AI Knowledge App - User Flow & Component Design

## Current State Analysis

### Existing Structure
- **Documents**: Individual text/code/image/sheet documents with TipTap editor
- **Chats**: AI conversations with message history
- **Sidebar**: Shows chat history and document list separately
- **Layout**: Conditional sidebar removal for document pages

### Current Issues
- No connection between documents and chats
- No project/workspace concept
- Documents and chats exist in isolation
- No central dashboard for overview

## Proposed User Flow

### Core Concept: Project-Based Organization

```
Dashboard
├── All Projects
├── Recent Activity
└── Quick Actions
    ├── New Project
    ├── New Document
    └── New Chat

Project
├── Documents
├── Chats
└── Settings
    ├── Add Document to Chat Context
    ├── Project Sharing
    └── Project Settings
```

## User Flow Scenarios

### 1. Accessing All Documents
**Current**: Sidebar > Documents section
**Proposed**: Dashboard > All Documents OR Project > Documents tab

### 2. Accessing All Chats
**Current**: Sidebar > Chat history
**Proposed**: Dashboard > All Chats OR Project > Chats tab

### 3. Creating Projects
**New Feature**: Dashboard > New Project
- Create project with name and description
- Automatically creates first document or chat
- Option to import existing documents/chats

### 4. Document + Chat Integration
**New Feature**: Within project context
- Add documents to chat context
- Reference documents in conversations
- Split view: document editing + AI chat

## Component Architecture

### New Components Needed

#### 1. Dashboard (`app/dashboard/page.tsx`)
```tsx
- ProjectGrid: Display all projects with preview
- RecentActivity: Recent documents/chats across projects
- QuickActions: Create new project/document/chat
- SearchBar: Global search across all content
```

#### 2. Project Layout (`app/project/[id]/layout.tsx`)
```tsx
- ProjectSidebar: Project-specific navigation
- ProjectHeader: Project name, settings, sharing
- TabNavigation: Documents, Chats, Settings
```

#### 3. Project Dashboard (`app/project/[id]/page.tsx`)
```tsx
- ProjectOverview: Stats, recent activity
- DocumentGrid: Project documents
- ChatList: Project chats
- ContextManager: Document-chat connections
```

#### 4. Split View (`components/split-view-enhanced.tsx`)
```tsx
- DocumentEditor: Left panel with TipTap
- ChatInterface: Right panel with AI chat
- ContextPanel: Show which documents are in chat context
- ResizableLayout: Adjustable panel sizes
```

### Updated Components

#### 1. App Sidebar (`components/app-sidebar.tsx`)
```tsx
- Remove document list (move to dashboard)
- Add project quick access
- Keep recent chats for quick access
- Add dashboard navigation
```

#### 2. Document View (`components/document-view.tsx`)
```tsx
- Add "Add to Chat Context" button
- Show which chats reference this document
- Add project breadcrumb navigation
```

#### 3. Chat Component (`components/chat.tsx`)
```tsx
- Show document context panel
- Add document reference capabilities
- Project-aware chat creation
```

## Database Schema Updates

### New Tables

```sql
-- Projects table
CREATE TABLE Project (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  userId UUID NOT NULL REFERENCES User(id),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Project-Document relationships
CREATE TABLE ProjectDocument (
  projectId UUID NOT NULL REFERENCES Project(id),
  documentId UUID NOT NULL,
  documentCreatedAt TIMESTAMP NOT NULL,
  addedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (projectId, documentId, documentCreatedAt),
  FOREIGN KEY (documentId, documentCreatedAt) REFERENCES Document(id, createdAt)
);

-- Project-Chat relationships
CREATE TABLE ProjectChat (
  projectId UUID NOT NULL REFERENCES Project(id),
  chatId UUID NOT NULL REFERENCES Chat(id),
  addedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (projectId, chatId)
);

-- Chat-Document context (which documents are available to chat)
CREATE TABLE ChatDocumentContext (
  chatId UUID NOT NULL REFERENCES Chat(id),
  documentId UUID NOT NULL,
  documentCreatedAt TIMESTAMP NOT NULL,
  addedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (chatId, documentId, documentCreatedAt),
  FOREIGN KEY (documentId, documentCreatedAt) REFERENCES Document(id, createdAt)
);
```

## Implementation Priority

### Phase 1: Core Structure
1. Create dashboard page
2. Add project schema to database
3. Update navigation structure
4. Migrate existing documents/chats to default project

### Phase 2: Project Management
1. Project creation/editing
2. Document-project associations
3. Chat-project associations
4. Project-based navigation

### Phase 3: Advanced Features
1. Document-chat context integration
2. Split view for document + chat
3. Advanced search across projects
4. Project sharing and collaboration

## Key Design Principles

1. **Less is More**: Clean, minimal interface
2. **Progressive Disclosure**: Show complexity only when needed
3. **Context Awareness**: Always show where user is in the hierarchy
4. **Quick Access**: Common actions easily accessible
5. **Flexible Organization**: Support both project-based and standalone workflows

## Navigation Structure

```
/ (Dashboard)
├── /project/[id] (Project Overview)
├── /project/[id]/documents (Project Documents)
├── /project/[id]/chats (Project Chats)
├── /project/[id]/settings (Project Settings)
├── /document/[id] (Document Editor - can be standalone or in project)
├── /chat/[id] (Chat Interface - can be standalone or in project)
└── /split/[projectId] (Split View: Document + Chat)
```

This design maintains backward compatibility while introducing powerful project-based organization and document-chat integration capabilities.