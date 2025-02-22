'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { NotesData, TranscriptResponse } from '@/lib/types';
import YouTubePlayer, { YouTubePlayerRef } from '@/components/YouTubePlayer';
import TranscriptViewer from '@/components/TranscriptViewer';
import NotesViewer from '@/components/NotesViewer';
import { fetchTranscript, getVideoDetails } from '@/lib/youtube';
import { generateNotes } from '@/lib/openai';

// Helper for formatting dates like YouTube
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  if (diffDays < 1) {
    // Today
    return 'Today';
  } else if (diffDays === 1) {
    // Yesterday
    return 'Yesterday';
  } else if (diffDays < 7) {
    // Less than a week
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    // Less than a month
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffMonths < 12) {
    // Less than a year
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  } else {
    // More than a year
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }
};

export default function NotesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const videoId = params.videoId as string;
  const url = searchParams.get('url');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<NotesData | null>(null);
  const playerRef = useRef<YouTubePlayerRef>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'transcript'>('notes');

  useEffect(() => {
    const processVideo = async () => {
      // If we have a videoId but no URL, construct a YouTube URL
      const videoUrl = url || `https://www.youtube.com/watch?v=${videoId}`;
      
      try {
        // Get video details with actual title from YouTube
        const videoDetails = await getVideoDetails(videoId);
        console.log('Video details fetched:', videoDetails);
        
        // Set page title to video title for better sharing
        if (videoDetails.title) {
          document.title = `${videoDetails.title} - Notes`;
        }
        
        // Check if we already have saved notes for this video
        const savedNotes = localStorage.getItem(`notes_${videoId}`);
        const savedTranscript = localStorage.getItem(`transcript_${videoId}`);
        
        // If we have both saved, use them instead of making API calls
        if (savedNotes && savedTranscript) {
          const transcriptData = JSON.parse(savedTranscript);
          
          setData({
            videoId,
            videoDetails,
            transcript: transcriptData.transcript || [],
            transcriptText: transcriptData.transcript_text || '',
            notes: savedNotes,
          });
          
          setLoading(false);
          return;
        }
        
        // Fetch transcript
        console.log('Fetching transcript for URL:', videoUrl);
        const transcriptData: TranscriptResponse = await fetchTranscript(videoUrl);
        
        // Check if transcript exists and has the expected format
        if (!transcriptData.transcript || !Array.isArray(transcriptData.transcript)) {
          console.error('Invalid transcript format:', transcriptData);
          throw new Error('Invalid transcript data received');
        }

        // Log a sample of the transcript data to debug
        if (transcriptData.transcript.length > 0) {
          console.log('Sample transcript item (first):', transcriptData.transcript[0]);
        }
        
        // Generate notes using OpenAI
        const notes = await generateNotes(transcriptData.transcript_text);
        console.log('Notes generated successfully');
        
        // Save to localStorage for future visits
        localStorage.setItem(`notes_${videoId}`, notes);
        localStorage.setItem(`transcript_${videoId}`, JSON.stringify({
          transcript: transcriptData.transcript,
          transcript_text: transcriptData.transcript_text
        }));
        
        // Set the data with verified transcript
        setData({
          videoId,
          videoDetails,
          transcript: transcriptData.transcript,
          transcriptText: transcriptData.transcript_text,
          notes,
        });
        
      } catch (err) {
        console.error('Error processing video:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    processVideo();
  }, [videoId, url]);

  // Handle timestamp click to seek the YouTube player
  const handleTimestampClick = (timeInSeconds: number) => {
    console.log('Seeking to time (seconds):', timeInSeconds);
    if (playerRef.current) {
      playerRef.current.seekTo(timeInSeconds);
      playerRef.current.playVideo();
    }
  };

  // Handle error state
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

  // Handle loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-20">
          <div className="mb-4 text-2xl font-semibold">Processing Video</div>
          <p className="text-primary-1300">
            We're extracting the transcript and generating notes. This may take a minute or two, especially for longer videos.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-1300"></div>
          </div>
        </div>
      </div>
    );
  }

  // Display data when loaded
  if (data) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Title: {data.videoDetails.title}</h1>
        
        {/* Channel and publish date info */}
        <div className="text-primary-1300 text-sm mb-4">
          {data.videoDetails.channelTitle && (
            <span className="font-medium">Channel: {data.videoDetails.channelTitle}</span>
          )}
          {data.videoDetails.channelTitle && data.videoDetails.publishedAt && (
            <span className="mx-1">•</span>
          )}
          {data.videoDetails.publishedAt && (
            <span>{formatDate(data.videoDetails.publishedAt)}</span>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex">
            <button 
              className={`py-2 px-4 font-medium text-sm border-b-2 ${
                activeTab === 'notes' 
                  ? 'border-primary-1300 text-primary-1300' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('notes')}
            >
            AI Notes
            </button>
            <button 
              className={`py-2 px-4 font-medium text-sm border-b-2 ${
                activeTab === 'transcript' 
                  ? 'border-primary-1300 text-primary-1300' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('transcript')}
            >
              Video & Transcript
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'notes' ? (
          // Notes Tab (Full Width)
          <div className="w-full relative">
            {data.notes ? (
              <NotesViewer notes={data.notes} videoId={data.videoId} />
            ) : (
              <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700">Notes could not be generated</p>
              </div>
            )}
          </div>
        ) : (
          // Video & Transcript Tab (Side by Side)
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div id="youtube-player-container" className="mb-4">
                <YouTubePlayer ref={playerRef} videoId={data.videoId} />
              </div>
            </div>
            <div className="relative">
              {data.transcript && Array.isArray(data.transcript) ? (
                <TranscriptViewer 
                  transcript={data.transcript}
                  transcriptText={data.transcriptText}
                  onTimestampClick={handleTimestampClick}
                />
              ) : (
                <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700">Transcript data not available or invalid format</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 mb-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-primary-1300 text-white px-4 py-4 rounded-md hover:bg-primary-1100"
          >
            Generate Notes for Another Video
          </a>
        </div>
      </div>
    );
  }

  // Fallback return
  return (
    <div className="max-w-5xl mx-auto text-center py-10">
      <p>Loading content...</p>
    </div>
  );
}