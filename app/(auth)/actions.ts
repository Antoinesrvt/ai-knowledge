'use server';

import { redirect } from 'next/navigation';

export type LoginActionState = {
  status: 'idle' | 'failed' | 'success';
  message?: string;
};

export type RegisterActionState = {
  status: 'idle' | 'failed' | 'success' | 'user_exists';
  message?: string;
};

export async function login(
  state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  // Redirect to Stack Auth sign-in page
  redirect('/auth/signin');
}

export async function register(
  state: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  // Redirect to Stack Auth sign-up page
  redirect('/auth/signup');
}