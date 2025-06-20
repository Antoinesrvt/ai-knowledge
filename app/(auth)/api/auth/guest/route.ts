import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get('redirectUrl') || '/';

  // Check if user is already authenticated
  const user = await stackServerApp.getUser();
  
  if (user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect to Stack Auth sign-in page
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}
