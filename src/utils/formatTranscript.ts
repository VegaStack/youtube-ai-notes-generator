import { TranscriptItem } from '@/lib/types';

/**
 * Format timestamp from seconds to MM:SS format
 */
export const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format transcript with timestamps
 */
export const formatTranscriptWithTimestamps = (transcript: TranscriptItem[]): string => {
  return transcript
    .map(item => `[${formatTimestamp(item.offset / 1000)}] ${item.text}`)
    .join('\n');
};