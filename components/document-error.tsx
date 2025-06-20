'use client';

import { ChatSDKError } from '@/lib/errors';

export function DocumentErrorComponent({ error, documentId }: { error: Error; documentId: string }) {
  console.error('Document page error:', {
    documentId,
    error: {
      message: error.message,
      name: error.name,
      stack: error.stack,
    },
    timestamp: new Date().toISOString(),
  });

  const isNotFound = error.message.includes('not found') || error.message.includes('Not found');
  const isPermissionError = error.message.includes('permission') || error.message.includes('access');
  const isDatabaseError = error instanceof ChatSDKError && error.surface === 'database';
  const isAuthError = error instanceof ChatSDKError && error.surface === 'auth';

  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl mb-4">
          {isNotFound ? '📄' : isPermissionError ? '🔒' : isDatabaseError ? '💾' : isAuthError ? '🔐' : '⚠️'}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isNotFound ? 'Document Not Found' : 
           isPermissionError ? 'Access Denied' :
           isDatabaseError ? 'Database Error' :
           isAuthError ? 'Authentication Error' :
           'Something Went Wrong'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400">
          {isNotFound ? 'The document you\'re looking for doesn\'t exist or has been deleted.' :
           isPermissionError ? 'You don\'t have permission to view this document.' :
           isDatabaseError ? 'There was a problem connecting to the database. Please try again later.' :
           isAuthError ? 'There was a problem with authentication. Please sign in again.' :
           'An unexpected error occurred while loading the document.'}
        </p>
        
        <div className="text-sm text-gray-500 dark:text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded">
          Document ID: {documentId}
          <br />
          Error: {error.message}
          {error instanceof ChatSDKError && (
            <>
              <br />
              Type: {error.type}:{error.surface}
            </>
          )}
        </div>
        
        <div className="flex gap-2 justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => window.history.back()} 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}