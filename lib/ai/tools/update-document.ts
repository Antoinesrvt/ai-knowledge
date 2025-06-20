import { DataStreamWriter, tool } from 'ai';
import type { Session } from '@/lib/types';
import { z } from 'zod';
import { getDocumentById, createPendingChange } from '@/lib/db/queries';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';

interface UpdateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description: 'Propose changes to a document. Changes will be staged for user approval before being applied.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      const document = await getDocumentById({ id });

      if (!document) {
        return {
          error: 'Document not found',
        };
      }

      dataStream.writeData({
        type: 'clear',
        content: document.title,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === document.kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }

      // Generate the proposed changes using the document handler
      let proposedContent = '';
      const mockDataStream = {
        writeData: (data: any) => {
          if (data.type === 'text-delta' && data.content) {
            proposedContent += data.content;
          }
        },
      } as DataStreamWriter;

      await documentHandler.onUpdateDocument({
        document,
        description,
        dataStream: mockDataStream,
        session,
      });

      // Create a pending change instead of directly updating
      const pendingChange = await createPendingChange({
        documentId: document.id,
        documentCreatedAt: document.createdAt,
        changes: {
          originalContent: document.content,
          proposedContent,
          diff: generateSimpleDiff(document.content || '', proposedContent),
        },
        description,
        changeType: 'ai_suggestion',
        authorType: 'ai',
        authorId: session.user?.id || 'ai-system',
      });

      // Stream the proposed changes for preview
      const diffData = generateSimpleDiff(document.content || '', proposedContent);
      dataStream.writeData({
        type: 'pending-change',
        content: {
          changeId: pendingChange.id,
          description,
          proposedContent,
          diff: diffData.map(item => ({
            type: item.type,
            line: item.line || null,
            oldLine: item.oldLine || null,
            newLine: item.newLine || null,
            lineNumber: item.lineNumber,
          })),
        },
      });

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title: document.title,
        kind: document.kind,
        content: `Changes proposed for "${document.title}". Review and accept/reject the changes in the document panel.`,
        changeId: pendingChange.id,
      };
    },
  });

// Simple diff generator for basic text comparison
function generateSimpleDiff(original: string, proposed: string) {
  const originalLines = original.split('\n');
  const proposedLines = proposed.split('\n');
  
  const diff: Array<{
    type: string;
    line?: string;
    oldLine?: string;
    newLine?: string;
    lineNumber: number;
  }> = [];
  const maxLines = Math.max(originalLines.length, proposedLines.length);
  
  for (let i = 0; i < maxLines; i++) {
    const originalLine = originalLines[i] || '';
    const proposedLine = proposedLines[i] || '';
    
    if (originalLine !== proposedLine) {
      if (originalLine && !proposedLine) {
        diff.push({ type: 'removed', line: originalLine, lineNumber: i + 1 });
      } else if (!originalLine && proposedLine) {
        diff.push({ type: 'added', line: proposedLine, lineNumber: i + 1 });
      } else {
        diff.push({ type: 'modified', oldLine: originalLine, newLine: proposedLine, lineNumber: i + 1 });
      }
    }
  }
  
  return diff;
}
