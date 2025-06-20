import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  unauthenticated: {
    maxMessagesPerDay: 0,
    availableChatModelIds: [],
  },
  guest: {
    maxMessagesPerDay: 10,
    availableChatModelIds: ['gpt-4o-mini'],
  },
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet-20241022'],
  },
};
