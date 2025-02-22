'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer as YTPlayer } from 'react-youtube';

interface YouTubePlayerProps {
  videoId: string;
  onReady?: (player: YTPlayer) => void;
}

export interface YouTubePlayerRef {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
}

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, onReady }, ref) => {
    const playerRef = useRef<YTPlayer | null>(null);

    const opts = {
      height: '390',
      width: '100%',
      playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        modestbranding: 1,
        rel: 0,
      },
    };

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (playerRef.current) {
          playerRef.current.seekTo(seconds, true);
        }
      },
      getCurrentTime: () => {
        if (playerRef.current) {
          return playerRef.current.getCurrentTime();
        }
        return 0;
      },
      getPlayerState: () => {
        if (playerRef.current) {
          return playerRef.current.getPlayerState();
        }
        return -1;
      },
      playVideo: () => {
        if (playerRef.current) {
          playerRef.current.playVideo();
        }
      },
      pauseVideo: () => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
      },
    }));

    // Handle player ready event
    const handleReady = (event: YouTubeEvent) => {
      playerRef.current = event.target;
      if (onReady) {
        onReady(event.target);
      }
    };

    return (
      <div className="aspect-video w-full">
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={handleReady}
          className="w-full" 
        />
      </div>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;