import axios from 'axios';
import { TranscriptResponse, VideoDetails } from './types';
import { extractVideoId } from '@/utils/extractVideoId';

/**
 * Fetches transcript from Cloudflare Worker
 */
export const fetchTranscript = async (url: string): Promise<TranscriptResponse> => {
  const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL || process.env.WORKER_URL;
  
  if (!workerUrl) {
    throw new Error('Worker URL is not defined in environment variables');
  }

  try {
    console.log('Sending request to worker at:', workerUrl);
    
    const response = await axios.post(workerUrl, { url });
    
    // Log response data
    console.log('Worker response status:', response.status);
    console.log('Worker response structure:', Object.keys(response.data).join(', '));
    
    // Validate transcript data
    if (!response.data || response.data.status_code !== 100) {
      throw new Error(response.data?.message || 'Failed to fetch transcript');
    }
    
    if (!response.data.transcript || !Array.isArray(response.data.transcript)) {
      console.error('Invalid transcript format in response:', response.data);
      throw new Error('Invalid transcript data received from worker');
    }
    
    // Ensure each transcript item has the required properties
    for (const item of response.data.transcript) {
      if (typeof item.text !== 'string' || typeof item.offset !== 'number') {
        console.error('Invalid transcript item format:', item);
        throw new Error('Transcript data has invalid format');
      }
    }
    
    return {
      status_code: response.data.status_code,
      message: response.data.message,
      video_id: response.data.video_id,
      transcript: response.data.transcript,
      transcript_text: response.data.transcript_text,
    };
  } catch (error) {
    console.error('Error fetching transcript:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Worker response error:', error.response.data);
        throw new Error(error.response.data?.message || `Failed to fetch transcript: ${error.response.status}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('No response from transcript worker - check your connection and worker URL');
      }
    }
    
    throw new Error(`Failed to connect to transcript worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gets video details using the videoId
 */
export const getVideoDetails = async (videoId: string): Promise<VideoDetails> => {
  try {
    // Try to fetch video details from YouTube Data API (public metadata endpoint)
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY}`);
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      const video = response.data.items[0];
      const snippet = video.snippet;
      
      return {
        title: snippet.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
      };
    }
    
    // Fallback to oEmbed API if the YouTube Data API fails or no key is available
    const oembedResponse = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    return {
      title: oembedResponse.data.title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      channelTitle: oembedResponse.data.author_name,
      // Note: oEmbed doesn't provide publish date
    };
  } catch (error) {
    console.error('Error fetching video details from Data API, trying oEmbed:', error);
    
    try {
      // Fallback to oEmbed API
      const oembedResponse = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      
      return {
        title: oembedResponse.data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: oembedResponse.data.author_name,
        // Note: oEmbed doesn't provide publish date
      };
    } catch (oembedError) {
      console.error('Error fetching video details from oEmbed:', oembedError);
      
      // Final fallback to basic details
      return {
        title: 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
  }
};

/**
 * Process YouTube URL to get transcript and notes
 */
export const processYouTubeUrl = async (url: string) => {
  // Extract video ID
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  // Get transcript
  const transcriptData = await fetchTranscript(url);
  
  // Get video details (title, thumbnail)
  const videoDetails = await getVideoDetails(videoId);
  
  return {
    videoId,
    transcriptData,
    videoDetails,
  };
};