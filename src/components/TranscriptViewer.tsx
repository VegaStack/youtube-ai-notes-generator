'use client';

import { useState, useCallback, useEffect } from 'react';
import { TranscriptItem } from '@/lib/types';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface TranscriptViewerProps {
  transcript: TranscriptItem[] | null | undefined;
  transcriptText?: string; // Full transcript text for copying
  onTimestampClick?: (timeInSeconds: number) => void;
}

export default function TranscriptViewer({ transcript, transcriptText, onTimestampClick }: TranscriptViewerProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Format timestamp from seconds to HH:MM:SS or MM:SS format
  const formatTimestamp = useCallback((seconds: number): string => {
    if (seconds === undefined || seconds === null) {
      return '0:00';
    }
    
    // Ensure we're working with a number
    const totalSeconds = Number(seconds);
    
    if (isNaN(totalSeconds)) {
      console.error('Invalid timestamp value:', seconds);
      return '0:00';
    }
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    
    if (hours > 0) {
      // Format as HH:MM:SS
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      // Format as MM:SS
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }, []);

  // Handle timestamp click
  const handleTimestampClick = useCallback((seconds: number) => {
    if (onTimestampClick) {
      // Pass seconds directly to the player
      onTimestampClick(seconds);
    }
  }, [onTimestampClick]);

  // Function to decode HTML entities
  const decodeHtmlEntities = useCallback((text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }, []);

  // Handle copy transcript to clipboard
  const handleCopyTranscript = async () => {
    if (!transcriptText) {
      // If transcriptText is not provided, try to extract text from transcript array
      if (transcript && Array.isArray(transcript)) {
        const extractedText = transcript.map(item => decodeHtmlEntities(item.text)).join(' ');
        await copyToClipboard(extractedText);
      } else {
        console.error('No transcript text available to copy');
      }
    } else {
      // Use the provided full transcript text (decode entities first)
      await copyToClipboard(decodeHtmlEntities(transcriptText));
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopySuccess(false);
    }
  };

  // Error states
  if (!transcript) {
    return <div className="text-center py-4">No transcript available</div>;
  }
  
  if (!Array.isArray(transcript)) {
    console.error('Expected transcript to be an array but got:', typeof transcript);
    return <div className="text-center py-4">Error loading transcript data</div>;
  }

  if (transcript.length === 0) {
    return <div className="text-center py-4">Transcript is empty</div>;
  }

  return (
    <div className="relative max-h-[500px] overflow-y-auto px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Transcript</h2>
        <button 
          onClick={handleCopyTranscript}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
          <span className="text-sm">Copy</span>
        </button>
      </div>
      
      {/* Copy success message */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md z-50">
          Copied Transcript to clipboard!
        </div>
      )}
      
      <div className="space-y-2">
        {transcript.map((item, index) => {
          // Ensure we have a valid offset number
          const offsetSeconds = typeof item.offset === 'number' ? item.offset : 
                              (typeof item.offset === 'string' ? parseFloat(item.offset) : 0);
          
          // Decode HTML entities in the text
          const decodedText = decodeHtmlEntities(item.text);
          
          return (
            <div key={index} className="pb-2">
              <button 
                onClick={() => handleTimestampClick(offsetSeconds)}
                className="text-xs text-blue-500 hover:text-blue-700 hover:underline mr-2 font-medium"
                title="Click to jump to this part of the video"
              >
                {formatTimestamp(offsetSeconds)}
              </button>
              <span>{decodedText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}