'use client'

import { useState } from 'react';
import { UserIcon } from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { AuthModal } from './AuthModal';

export function HeaderButtons() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <>
      <div className="flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto">
        {/* GitHub Star Button */}
        <iframe 
          src="https://ghbtns.com/github-btn.html?user=VegaStack&repo=youtube-ai-notes-generator&type=star&count=true&size=large" 
          frameBorder="0" 
          scrolling="0" 
          width="125" 
          height="30" 
          title="GitHub"
          className="bg-transparent mt[-4px]"
        />
        
        {status === 'loading' ? (
          // Placeholder with same dimensions as the avatar button to prevent layout shift
          <div className="w-8 h-8" />
        ) : session ? (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 focus:outline-none"
            >
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || 'User'} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-sm font-medium">
                  {session.user?.name?.[0] || 'U'}
                </span>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 text-sm text-gray-700">
                <div className="px-4 py-2 flex flex-col">
                  <span className="font-medium">{session.user?.name}</span>
                  <span className="text-gray-500">{session.user?.email}</span>
                </div>
                <div className="h-px bg-gray-200 my-1" />
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
                <div className="h-px bg-gray-200 my-1" />
                <a
                  href="https://vegastack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  VegaStack
                </a>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="bg-white text-primary-1300 font-semi-bold hover:bg-gray-100 py-2 px-3 rounded-md transition-colors duration-200 flex items-center text-sm"
          >
            Sign in
          </button>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
