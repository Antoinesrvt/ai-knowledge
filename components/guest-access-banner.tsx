'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, LogIn, Eye } from 'lucide-react';
import { signIn } from 'next-auth/react';
import type { UserType } from '@/lib/auth-utils';

interface GuestAccessBannerProps {
  userType: UserType;
  contentType: 'document' | 'chat';
  className?: string;
}

export function GuestAccessBanner({ userType, contentType, className }: GuestAccessBannerProps) {
  // Don't show banner for regular users
  if (userType === 'regular') {
    return null;
  }

  const handleSignUp = () => {
    window.location.href = '/register';
  };

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  const handleGuestAccess = () => {
    signIn('guest');
  };

  if (userType === 'unauthenticated') {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">
                  You're viewing a public {contentType}
                </h3>
                <p className="text-sm text-blue-700">
                  Sign up to create and manage your own {contentType}s
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignIn}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <LogIn className="h-4 w-4 mr-1" />
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={handleSignUp}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Sign Up
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userType === 'guest') {
    return (
      <Card className={`border-amber-200 bg-amber-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserPlus className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-900">
                  You're browsing as a guest
                </h3>
                <p className="text-sm text-amber-700">
                  Create an account to access the dashboard and manage your content
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleSignUp}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <UserPlus className="h-4 w-4 mr-1" />
                Create Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}