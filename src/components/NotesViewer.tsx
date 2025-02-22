'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface NotesViewerProps {
  notes: string;
  videoId?: string;
}

export default function NotesViewer({ notes, videoId }: NotesViewerProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const notesRef = React.useRef<HTMLDivElement>(null);

  // Copy notes to clipboard in markdown format
  const handleCopyNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopySuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy notes:', err);
      alert('Failed to copy notes to clipboard');
    }
  };

  // Download notes as PDF
  const handleDownloadPdf = async () => {
    if (!notesRef.current) return;
    
    try {
      setDownloadingPdf(true);
      
      // Create a container with white background for proper PDF rendering
      const container = document.createElement('div');
      container.style.padding = '20px';
      container.style.backgroundColor = 'white';
      container.style.width = '800px';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.innerHTML = notesRef.current.innerHTML;
      
      document.body.appendChild(container);
      
      // Generate PDF from the container
      const canvas = await html2canvas(container, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(container);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / ratio;
      
      // If image is longer than a page, adjust the scaling
      if (imgHeight > pdfHeight) {
        const pages = Math.ceil(imgHeight / pdfHeight);
        const imgHeightScaled = imgHeight / pages;
        
        for (let i = 0; i < pages; i++) {
          // Add new page if needed
          if (i > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(
            imgData, 
            'PNG', 
            0, 
            -i * pdfHeight, 
            pdfWidth, 
            imgHeight
          );
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      }
      
      // Determine file name
      const title = document.title || 'YouTube Notes';
      pdf.save(`${title}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Share notes via URL
  const handleShareLink = async () => {
    if (!videoId) {
      alert('Cannot share without video ID');
      return;
    }
    
    // Create share URL
    const shareUrl = `${window.location.origin}/notes/${videoId}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title || 'YouTube Video Notes',
          text: 'Check out these notes I generated for this YouTube video!',
          url: shareUrl
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to clipboard copy if sharing is canceled or fails
        await copyShareLink(shareUrl);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await copyShareLink(shareUrl);
    }
  };
  
  // Helper to copy share link to clipboard
  const copyShareLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      
      // Reset message after 3 seconds
      setTimeout(() => {
        setShareSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
      alert('Failed to copy share link to clipboard');
    }
  };

  if (!notes) {
    return <div className="text-center py-4">No notes available</div>;
  }

  return (
    <div className="px-4 py-2 bg-white rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notes</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyNotes}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center"
            title="Copy notes in markdown format"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy
          </button>
          
          <button 
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as PDF"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloadingPdf ? 'Preparing...' : 'Download PDF'}
          </button>
          
          <button 
            onClick={handleShareLink}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center"
            title="Share notes link"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
      
      {/* Success messages */}
      {copySuccess && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md">
          Notes copied to clipboard!
        </div>
      )}
      
      {shareSuccess && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md">
          Share link copied to clipboard!
        </div>
      )}
      
      {/* Notes content */}
      <div ref={notesRef} className="prose max-w-none">
        <ReactMarkdown>{notes}</ReactMarkdown>
      </div>
    </div>
  );
}