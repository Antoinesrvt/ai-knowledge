import { auth } from '@/app/(auth)/auth';
import { getDocumentById } from '@/lib/db/queries';
import { notFound } from 'next/navigation';
import { WorkspacePage } from '@/components/workspace-page';
import { GuestAccessBanner } from '@/components/guest-access-banner';
import { getUserType } from '@/lib/auth-utils';
import { headers } from 'next/headers';
import {
  detectWorkspaceEntryType,
  validateWorkspaceAccess,
  determineViewMode,
  updateDocumentAccess,
  type WorkspaceEntryType,
} from '@/lib/workspace-utils';
import {
  getDocumentForWorkspace,
  getChatForWorkspace,
} from '@/lib/db/queries/workspace';

export default async function WorkspacePageRoute({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const userId = session?.user?.id;
  const headersList = await headers();
  const userType = await getUserType(headersList);
  const { id } = await params;

  if (!userId) {
    notFound();
  }

  // Detect entry type (document or chat)
  const entryInfo = await detectWorkspaceEntryType(id);
  if (!entryInfo) {
    notFound();
  }

  // Validate access
  const hasAccess = await validateWorkspaceAccess(id, entryInfo.type, userId);
  if (!hasAccess) {
    notFound();
  }

  let workspaceData;
  let isReadOnly = false;
  let contentType: WorkspaceEntryType = 'document';

  if (entryInfo.type === 'document') {
    // Document entry point
    workspaceData = await getDocumentForWorkspace(id, userId);
    if (!workspaceData) {
      notFound();
    }

    // Determine view mode and update access
    const viewMode = determineViewMode('document', workspaceData.lastViewMode);
    await updateDocumentAccess(id, viewMode);

    // Check permissions for guest access banner
    const isOwner = userId === workspaceData.userId;
    const isPublic = workspaceData.visibility === 'public';
    const isOrganizationMember = 
      workspaceData.visibility === 'organization' && 
      session?.user?.stackUserId === workspaceData.organizationId;

    isReadOnly = !isOwner && (isPublic || isOrganizationMember);
    contentType = 'document';
  } else {
    // Chat entry point
    workspaceData = await getChatForWorkspace(id, userId);
    if (!workspaceData) {
      notFound();
    }
    contentType = 'chat';
  }

  const isOwner = userId === workspaceData.userId;
  const isPublic = workspaceData.visibility === 'public';
  const isOrganizationMember = 
    workspaceData.visibility === 'organization' && 
    session?.user?.stackUserId === workspaceData.organizationId;

  return (
    <div className="h-screen w-full bg-background">
      {!isOwner && (isPublic || isOrganizationMember) && (
        <GuestAccessBanner 
          userType={userType}
          contentType={contentType}
        />
      )}
      <WorkspacePage
        entryType={entryInfo.type}
        entryId={id}
        workspaceData={workspaceData}
        userId={userId}
        isOwner={isOwner}
        session={session}
        isReadOnly={isReadOnly}
        userType={userType}
      />
    </div>
  );
}