'use client';

import { create } from 'zustand';
import { useAuth } from '@/components/AuthProvider'; // This will now work
import { VideoDetails } from '@/lib/types';

export interface HistoryItem {
  id: string;
  videoId: string;
  title: string;
  channelTitle?: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface HistoryState {
  items: HistoryItem[];
  pagination: PaginationInfo;
  isOpen: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadHistory: (page?: number, limit?: number) => Promise<void>;
  setPage: (page: number) => Promise<void>;
  toggleHistory: () => void;
  closeHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  items: [],
  pagination: {
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  },
  isOpen: false,
  loading: false,
  error: null,
  
  loadHistory: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    
    // Check authentication status from localStorage cache first
    // This is because we may not have access to the auth context in a store
    const authCookie = document.cookie.includes('auth-token');
    
    try {
      if (authCookie) {
        // Load from API if authenticated
        const response = await fetch(`/api/history?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Auth token is invalid or expired
            return loadFromLocalStorage(set, get, page, limit);
          }
          
          throw new Error(`Failed to load history: ${response.status}`);
        }
        
        const data = await response.json();
        
        set({
          items: data.items.map(mapDbItemToHistoryItem),
          pagination: data.pagination,
          loading: false,
        });
      } else {
        // Load from localStorage if not authenticated
        return loadFromLocalStorage(set, get, page, limit);
      }
    } catch (error) {
      console.error('Error loading history:', error);
      set({
        error: error instanceof Error ? error.message : 'Unknown error loading history',
        loading: false,
      });
      
      // Fall back to localStorage
      return loadFromLocalStorage(set, get, page, limit);
    }
  },
  
  setPage: async (page: number) => {
    if (page < 1 || page > get().pagination.totalPages) return;
    
    return get().loadHistory(page, get().pagination.limit);
  },
  
  toggleHistory: () => {
    const isCurrentlyOpen = get().isOpen;
    
    set({ isOpen: !isCurrentlyOpen });
    
    // Load history data when opening if we don't have any
    if (!isCurrentlyOpen && get().items.length === 0) {
      get().loadHistory();
    }
  },
  
  closeHistory: () => {
    set({ isOpen: false });
  }
}));

// Helper function to load history from localStorage
async function loadFromLocalStorage(
  set: (state: Partial<HistoryState>) => void,
  get: () => HistoryState,
  page: number,
  limit: number
) {
  setTimeout(() => {
    try {
      const historyItems: HistoryItem[] = [];
      
      if (typeof window !== 'undefined') {
        // Get all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          // Process only the video metadata items
          if (key && key.startsWith('video_meta_')) {
            try {
              const videoId = key.replace('video_meta_', '');
              const storedData = localStorage.getItem(key);
              
              if (storedData) {
                const data = JSON.parse(storedData);
                
                historyItems.push({
                  id: videoId, // Use videoId as id for localStorage items
                  videoId,
                  title: data.videoDetails.title || 'Unknown title',
                  channelTitle: data.videoDetails.channelTitle,
                  thumbnail: data.videoDetails.thumbnail || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                  createdAt: data.timestamp || Date.now(),
                  updatedAt: data.timestamp || Date.now(),
                });
              }
            } catch (err) {
              console.error('Failed to parse history item:', err);
            }
          }
        }
      }
      
      // Sort by update time (newest first)
      historyItems.sort((a, b) => b.updatedAt - a.updatedAt);
      
      // Apply pagination
      const offset = (page - 1) * limit;
      const paginatedItems = historyItems.slice(offset, offset + limit);
      const totalCount = historyItems.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      
      set({ 
        items: paginatedItems,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
        loading: false,
      });
    } catch (error) {
      console.error('Error loading history from localStorage:', error);
      set({ 
        loading: false,
        error: 'Failed to load history from local storage',
      });
    }
  }, 100);
}

// Helper function to map DB item to HistoryItem
function mapDbItemToHistoryItem(dbItem: any): HistoryItem {
  return {
    id: dbItem.id,
    videoId: dbItem.videoId,
    title: dbItem.title || 'Unknown title',
    channelTitle: dbItem.channelTitle,
    thumbnail: `https://img.youtube.com/vi/${dbItem.videoId}/mqdefault.jpg`,
    createdAt: dbItem.createdAt ? new Date(dbItem.createdAt).getTime() : Date.now(),
    updatedAt: dbItem.updatedAt ? new Date(dbItem.updatedAt).getTime() : Date.now(),
  };
}

// Helper function to add video to history (both localStorage and DB if authenticated)
export const addToHistory = async (videoId: string, videoDetails: VideoDetails) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Always store in localStorage for quick access
    localStorage.setItem(`video_meta_${videoId}`, JSON.stringify({
      videoDetails,
      timestamp: Date.now()
    }));
    
    // If authenticated, also store in database
    const authCookie = document.cookie.includes('auth-token');
    
    if (authCookie) {
      try {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId,
            title: videoDetails.title,
            channelTitle: videoDetails.channelTitle,
            // We're just updating history, not saving actual notes/transcripts here
            // This just records that the user viewed this video
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to save history to database:', response.status);
        }
      } catch (error) {
        console.error('Error saving history to database:', error);
      }
    }
  } catch (error) {
    console.error('Error adding to history:', error);
  }
};

// Format relative time for display
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};