'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

// This component silently syncs locally stored notes with the database
// when a user signs in
export default function NotesSyncManager() {
  const { user, status } = useAuth();
  
  useEffect(() => {
    // Only run when user is authenticated
    if (status !== 'authenticated' || !user) {
      return;
    }
    
    const syncLocalNotesToDb = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        // Find all localStorage items that are notes
        const notesToSync = [];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          
          if (key && key.startsWith('notes_')) {
            const videoId = key.replace('notes_', '');
            const notes = localStorage.getItem(key);
            const transcriptData = localStorage.getItem(`transcript_${videoId}`);
            const metaData = localStorage.getItem(`video_meta_${videoId}`);
            
            if (notes && transcriptData && metaData) {
              try {
                const parsedTranscript = JSON.parse(transcriptData);
                const parsedMeta = JSON.parse(metaData);
                
                notesToSync.push({
                  videoId,
                  title: parsedMeta.videoDetails.title,
                  channelTitle: parsedMeta.videoDetails.channelTitle,
                  transcript: parsedTranscript.transcript_text,
                  notesContent: notes
                });
              } catch (err) {
                console.error('Error parsing stored data for videoId:', videoId, err);
              }
            }
          }
        }
        
        // Sync notes to database
        for (const noteData of notesToSync) {
          try {
            await fetch('/api/notes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(noteData)
            });
          } catch (err) {
            console.error('Error syncing note to database:', err);
          }
        }
        
        console.log(`Synced ${notesToSync.length} notes to database`);
      } catch (error) {
        console.error('Error syncing notes to database:', error);
      }
    };
    
    // Run sync process
    syncLocalNotesToDb();
  }, [status, user]);
  
  // This component doesn't render anything visible
  return null;
}