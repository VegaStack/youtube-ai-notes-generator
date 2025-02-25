'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { NotesData, TranscriptResponse } from '@/lib/types';
import YouTubePlayer, { YouTubePlayerRef } from '@/components/YouTubePlayer';
import TranscriptViewer from '@/components/TranscriptViewer';
import NotesViewer from '@/components/NotesViewer';
import { fetchTranscript, getVideoDetails } from '@/lib/youtube';
import { generateNotes } from '@/lib/openai';
import { addToHistory } from '@/lib/historyStore';
import { useAuth } from '@/components/AuthProvider';

// Helper for formatting dates like YouTube
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return `${diffYears} years ago`;
};

export default function NotesPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, status } = useAuth();
  
  const videoId = params.videoId as string;
  const url = searchParams.get('url');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NotesData | null>(null);
  const playerRef = useRef<YouTubePlayerRef>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'transcript'>('notes');

  // Add a state to track if we're saving to the database
  const [savingToDb, setSavingToDb] = useState(false);

  // Helper function to save notes to database
  const saveNotesToDatabase = async (
    videoId: string,
    title: string,
    channelTitle: string,
    transcript: string,
    notesContent: string
  ) => {
    if (savingToDb || status !== 'authenticated') return;
    
    setSavingToDb(true);
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          title,
          channelTitle,
          transcript,
          notesContent,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save notes to database:', response.status);
      } else {
        console.log('Notes saved to database successfully');
      }
    } catch (error) {
      console.error('Error saving notes to database:', error);
    } finally {
      setSavingToDb(false);
    }
  };

  useEffect(() => {
    const processVideo = async () => {
      const videoUrl = url || `https://www.youtube.com/watch?v=${videoId}`;
      
      try {
        // First, get video details (metadata)
        const videoDetails = await getVideoDetails(videoId);
        console.log('Video details fetched:', videoDetails);
        
        if (videoDetails.title && typeof window !== 'undefined') {
          document.title = `${videoDetails.title} - YouTube AI Notes`;
        }
        
        // If user is authenticated, try to get notes from the database first
        if (status === 'authenticated' && user) {
          try {
            const response = await fetch(`/api/notes?videoId=${videoId}`);
            
            if (response.ok) {
              const noteData = await response.json();
              
              // If found in database, use that data
              setData({
                videoId,
                videoDetails,
                transcript: noteData.transcript ? JSON.parse(noteData.transcript) : [],
                transcriptText: noteData.transcript || '',
                notes: noteData.notesContent,
              });
              
              // Add to history
              await addToHistory(videoId, videoDetails);
              
              // Also cache in localStorage for offline access
              if (typeof window !== 'undefined') {
                localStorage.setItem(`notes_${videoId}`, noteData.notesContent);
                localStorage.setItem(`transcript_${videoId}`, JSON.stringify({
                  transcript: noteData.transcript ? JSON.parse(noteData.transcript) : [],
                  transcript_text: noteData.transcript || ''
                }));
                
                // Store video metadata
                localStorage.setItem(`video_meta_${videoId}`, JSON.stringify({
                  videoDetails,
                  timestamp: Date.now()
                }));
              }
              
              setLoading(false);
              return;
            }
          } catch (err) {
            console.error('Error fetching notes from database:', err);
            // Continue with localStorage or fresh generation
          }
        }
        
        // Check localStorage as a fallback or for offline access
        let savedNotes, savedTranscript;
        if (typeof window !== 'undefined') {
          savedNotes = localStorage.getItem(`notes_${videoId}`);
          savedTranscript = localStorage.getItem(`transcript_${videoId}`);
        }
        
        if (savedNotes && savedTranscript) {
          try {
            const transcriptData = JSON.parse(savedTranscript);
            
            setData({
              videoId,
              videoDetails,
              transcript: transcriptData.transcript || [],
              transcriptText: transcriptData.transcript_text || '',
              notes: savedNotes,
            });
            
            // Add to history
            await addToHistory(videoId, videoDetails);
            
            // If user is authenticated, save to database for future access
            if (status === 'authenticated' && user) {
              saveNotesToDatabase(
                videoId,
                videoDetails.title,
                videoDetails.channelTitle || '',
                transcriptData.transcript_text || '',
                savedNotes
              );
            }
            
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing saved transcript:', error);
            // Continue with fresh generation
          }
        }
        
        // If we don't have the data yet, fetch the transcript and generate notes
        console.log('Fetching transcript for URL:', videoUrl);
        const transcriptData: TranscriptResponse = await fetchTranscript(videoUrl);
        
        if (!transcriptData.transcript || !Array.isArray(transcriptData.transcript)) {
          console.error('Invalid transcript format:', transcriptData);
          throw new Error('Invalid transcript data received');
        }

        console.log('Sample transcript item (first):', transcriptData.transcript[0]);
        
        // Generate notes from the transcript
        const notes = await generateNotes(transcriptData.transcript_text);
        console.log('Notes generated successfully');
        
        // Store data in state
        setData({
          videoId,
          videoDetails,
          transcript: transcriptData.transcript,
          transcriptText: transcriptData.transcript_text,
          notes,
        });
        
        // Store in localStorage for offline access
        if (typeof window !== 'undefined') {
          localStorage.setItem(`notes_${videoId}`, notes);
          localStorage.setItem(`transcript_${videoId}`, JSON.stringify({
            transcript: transcriptData.transcript,
            transcript_text: transcriptData.transcript_text
          }));
          
          // Store video metadata for history
          localStorage.setItem(`video_meta_${videoId}`, JSON.stringify({
            videoDetails,
            timestamp: Date.now()
          }));
        }
        
        // Add to history
        await addToHistory(videoId, videoDetails);
        
        // If user is authenticated, save to database for future access
        if (status === 'authenticated' && user) {
          saveNotesToDatabase(
            videoId,
            videoDetails.title,
            videoDetails.channelTitle || '',
            transcriptData.transcript_text,
            notes
          );
        }
        
      } catch (err) {
        console.error('Error processing video:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    // Only process the video if we have the videoId
    if (videoId) {
      processVideo();
    } else {
      setError('No video ID provided');
      setLoading(false);
    }
  }, [videoId, url, status, user, saveNotesToDatabase]);

  const handleTimestampClick = (timeInSeconds: number) => {
    console.log('Seeking to time (seconds):', timeInSeconds);
    if (playerRef.current) {
      playerRef.current.seekTo(timeInSeconds);
      playerRef.current.playVideo();
    }
  };

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <div className="mt-6 text-center">
          <a href="/" className="inline-block bg-primary-1300 text-white px-4 py-2 rounded-md hover:bg-primary-1100">
            Try Again
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto text-center py-20">
        <div className="mb-4 text-2xl font-semibold px-2 sm:px-0">Fetching & Processing Video</div>
        <p className="text-primary-1300 px-2 sm:px-0">
          We're extracting the transcript and generating notes. This may take a minute or two, especially for longer videos.
        </p>
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-1300"></div>
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-0">
        <h1 className="text-2xl font-bold mb-2">Title: {data.videoDetails.title}</h1>
        <div className="text-primary-1300 text-sm mb-4">
          {data.videoDetails.channelTitle && <span className="font-medium">Channel: {data.videoDetails.channelTitle}</span>}
          {data.videoDetails.channelTitle && data.videoDetails.publishedAt && <span className="mx-1">•</span>}
          {data.videoDetails.publishedAt && <span>{formatDate(data.videoDetails.publishedAt)}</span>}
        </div>

        <div className="mb-6 border-b border-gray-200 flex">
          <button 
            className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === 'notes' ? 'border-primary-1300 text-primary-1300' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('notes')}
          >
            AI Notes
          </button>
          <button 
            className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === 'transcript' ? 'border-primary-1300 text-primary-1300' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('transcript')}
          >
            Video & Transcript
          </button>
        </div>

        {activeTab === 'notes' ? (
          <NotesViewer notes={data.notes} videoId={data.videoId} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <YouTubePlayer ref={playerRef} videoId={data.videoId} />
            <TranscriptViewer transcript={data.transcript} transcriptText={data.transcriptText} onTimestampClick={handleTimestampClick} />
          </div>
        )}
      </div>
    );
  }

  return <div className="max-w-5xl mx-auto text-center py-10">Loading content...</div>;
}