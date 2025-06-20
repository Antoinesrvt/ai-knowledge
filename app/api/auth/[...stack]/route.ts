import { stackServerApp } from '@/stack';
import { StackHandler } from "@stackframe/stack";

const handler = StackHandler({ app: stackServerApp, fullPage: true });

export { handler as GET, handler as POST };