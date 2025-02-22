import { TranscriptResponse, VideoDetails } from './types';
import { extractVideoId } from '@/utils/extractVideoId';

/**
 * Helper function for fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

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
    
    const response = await fetchWithTimeout(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Log response data
    console.log('Worker response status:', response.status);
    console.log('Worker response structure:', Object.keys(data).join(', '));
    
    // Validate transcript data
    if (!data || data.status_code !== 100) {
      throw new Error(data?.message || 'Failed to fetch transcript');
    }
    
    if (!data.transcript || !Array.isArray(data.transcript)) {
      console.error('Invalid transcript format in response:', data);
      throw new Error('Invalid transcript data received from worker');
    }
    
    // Ensure each transcript item has the required properties
    for (const item of data.transcript) {
      if (typeof item.text !== 'string' || typeof item.offset !== 'number') {
        console.error('Invalid transcript item format:', item);
        throw new Error('Transcript data has invalid format');
      }
    }
    
    return {
      status_code: data.status_code,
      message: data.message,
      video_id: data.video_id,
      transcript: data.transcript,
      transcript_text: data.transcript_text,
    };
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error(`Failed to connect to transcript worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gets video details using the videoId
 */
export const getVideoDetails = async (videoId: string): Promise<VideoDetails> => {
  try {
    // Try to fetch video details from YouTube Data API (public metadata endpoint)
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY;
    if (apiKey) {
      const response = await fetchWithTimeout(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.items && data.items.length > 0) {
          const video = data.items[0];
          const snippet = video.snippet;
          
          return {
            title: snippet.title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            channelTitle: snippet.channelTitle,
            publishedAt: snippet.publishedAt,
          };
        }
      }
    }
    
    // Fallback to oEmbed API if the YouTube Data API fails or no key is available
    const oembedResponse = await fetchWithTimeout(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    if (oembedResponse.ok) {
      const data = await oembedResponse.json();
      return {
        title: data.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: data.author_name,
        // Note: oEmbed doesn't provide publish date
      };
    }
    
    // Final fallback to basic details
    return {
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    
    // Fallback to basic details on error
    return {
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
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