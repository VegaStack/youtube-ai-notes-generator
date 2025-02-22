export interface TranscriptItem {
    text: string;
    offset: number;
    duration: number;
  }
  
  export interface TranscriptResponse {
    status_code: number;
    message: string;
    video_id: string;
    transcript: TranscriptItem[];
    transcript_text: string;
  }
  
  export interface VideoDetails {
    title: string;
    thumbnail: string;
    channelTitle?: string;
    publishedAt?: string;
  }
  
  export interface NotesData {
    videoId: string;
    videoDetails: VideoDetails;
    transcript: TranscriptItem[];
    transcriptText: string;
    notes: string;
  }
  
  export interface FormState {
    isLoading: boolean;
    error: string | null;
  }