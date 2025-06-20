"use client";

import { StackProvider } from '@stackframe/stack';
import { stackApp } from '@/stack-client';

export function StackAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackApp}>
      {children}
    </StackProvider>
  );
}