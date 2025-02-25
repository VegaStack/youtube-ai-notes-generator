'use client';

import { Fragment } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function UserProfileButton() {
  const { user, status, refresh } = useAuth();
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await refresh();
        router.push('/');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <button
        onClick={() => router.push('/auth/signin')}
        className="flex items-center text-sm rounded-md py-2 px-3 bg-primary-1300 text-white hover:bg-primary-1100 transition-colors duration-200"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
        <span>Sign in</span>
      </button>
    );
  }
  
  // User is authenticated
  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          {user?.image ? (
            <Image
              className="h-8 w-8 rounded-full"
              src={user.image}
              alt={user.name || "User"}
              width={32}
              height={32}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary-700" />
            </div>
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || "Signed in User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || ""}
            </p>
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleSignOut}
                className={`${
                  active ? 'bg-gray-100' : ''
                } flex w-full items-center px-4 py-2 text-sm text-gray-700`}
              >
                <ArrowLeftOnRectangleIcon className="mr-2 h-5 w-5" />
                Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}