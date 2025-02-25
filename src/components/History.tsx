'use client';

import { useEffect, useRef } from 'react';
import { useHistoryStore, formatRelativeTime } from '@/lib/historyStore';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function History() {
  const { 
    items, 
    pagination,
    isOpen, 
    loading,
    error,
    loadHistory,
    setPage,
    closeHistory 
  } = useHistoryStore();
  
  const { user, status } = useAuth();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeHistory();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeHistory]);
  
  // Refresh history when opened
  useEffect(() => {
    if (isOpen) {
      loadHistory(pagination.page, pagination.limit);
    }
  }, [isOpen, loadHistory, pagination.page, pagination.limit]);
  
  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPage(page);
    }
  };
  
  const handleSignIn = () => {
    closeHistory();
    router.push('/auth/signin');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold">Viewing History</h2>
          <button 
            onClick={closeHistory}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Sign in prompt for non-authenticated users */}
        {status !== 'authenticated' && !loading && (
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  Sign in to sync your history across devices.
                </p>
                <p className="mt-3 text-sm md:mt-0 md:ml-6">
                  <button
                    onClick={handleSignIn}
                    className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600 flex items-center"
                  >
                    Sign in
                    <ArrowRightOnRectangleIcon className="ml-1 h-4 w-4" />
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-1300"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg mb-2">Error loading history</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => loadHistory()}
                className="mt-4 px-4 py-2 bg-primary-1300 text-white rounded hover:bg-primary-1100"
              >
                Try again
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No history found</p>
              <p className="text-sm">Videos you watch will appear here</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id || item.videoId} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <Link href={`/notes/${item.videoId}`} className="flex p-2 items-center" onClick={closeHistory}>
                    <div className="flex-shrink-0 w-24 h-16 relative mr-3">
                      <Image
                        src={item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                        alt={item.title || 'Video thumbnail'}
                        width={120}
                        height={90}
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{item.title || 'Unknown title'}</h3>
                      <p className="text-xs text-gray-600 truncate">{item.channelTitle || 'Unknown channel'}</p>
                      <p className="text-xs text-gray-500">{formatRelativeTime(item.updatedAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && !error && items.length > 0 && (
          <div className="border-t p-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}