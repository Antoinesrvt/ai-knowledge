import { stackApp } from '@/stack-client';
import { SignUp } from '@stackframe/stack';
import { redirect } from 'next/navigation';
import { stackServerApp } from '@/stack';

export default async function SignUpPage() {
  const user = await stackServerApp.getUser();
  
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the AI Knowledge Management Platform
          </p>
        </div>
        <div className="mt-8">
          <SignUp />
        </div>
      </div>
    </div>
  );
}