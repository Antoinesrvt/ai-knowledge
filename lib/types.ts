export type DataPart = { type: 'append-message'; message: string };

export type UserType = 'unauthenticated' | 'guest' | 'regular';
export type VisibilityType = 'private' | 'public' | 'organization' | 'team';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  primaryEmail?: string;
  displayName?: string;
  profileImageUrl?: string;
}

export interface Session {
  user: User | null;
}