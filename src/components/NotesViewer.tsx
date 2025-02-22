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
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy notes:', err);
      alert('Failed to copy notes to clipboard');
    }
  };

  // Helper to copy share link to clipboard
  const copyShareLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
      alert('Failed to copy share link to clipboard');
    }
  };

  // Share notes via URL - directly copy to clipboard
  const handleShareLink = async () => {
    if (!videoId) {
      alert('Cannot share without video ID');
      return;
    }
    const shareUrl = `${window.location.origin}/notes/${videoId}`;
    await copyShareLink(shareUrl);
  };

  // Download notes as PDF (multi-page approach)
  const handleDownloadPdf = async () => {
    if (!notesRef.current) return;

    try {
      setDownloadingPdf(true);

      // Create an off-screen container for consistent styling
      const container = document.createElement('div');
      container.style.width = '794px'; // A4 width in pixels at ~96 DPI
      container.style.padding = '20px 40px';
      container.style.backgroundColor = 'white';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
      container.style.lineHeight = '1.8';
      container.style.fontSize = '14px';
      container.style.color = '#000';
      container.style.transformOrigin = 'top left';
      container.style.transform = 'scale(1)';

      // Clone the notes content into our container
      const clonedContent = notesRef.current.cloneNode(true) as HTMLElement;
      container.appendChild(clonedContent);
      document.body.appendChild(container);

      // Capture the entire container as one large canvas
      const bigCanvas = await html2canvas(container, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: false,
        imageTimeout: 0,
        width: container.offsetWidth,
        height: container.offsetHeight,
        scrollY: -window.scrollY
      });

      // Clean up the off-screen container
      document.body.removeChild(container);

      // Initialize jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // A4 page dimensions in mm
      const pageWidthMM = 210;
      const pageHeightMM = 297;

      // We’ll apply margins to the PDF
      const margins = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      };
      const contentWidthMM = pageWidthMM - margins.left - margins.right;
      const contentHeightMM = pageHeightMM - margins.top - margins.bottom;

      // Canvas dimensions in pixels
      const bigCanvasWidthPx = bigCanvas.width;
      const bigCanvasHeightPx = bigCanvas.height;

      // Convert the canvas width from px → mm to keep proportions
      // (We scale the entire width to fit the PDF content width.)
      const pxToMm = contentWidthMM / bigCanvasWidthPx;

      // The height in px that fits on one PDF page (minus margins)
      const pageContentHeightPx = contentHeightMM / pxToMm;

      // Calculate total pages needed
      const totalPages = Math.ceil(bigCanvasHeightPx / pageContentHeightPx);

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        // Add a new page for every page after the first
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // Create a chunk canvas for just this page portion
        const chunkCanvas = document.createElement('canvas');
        chunkCanvas.width = bigCanvasWidthPx;
        // Only take as much height as remains, or one page chunk
        const chunkHeightPx = Math.min(
          pageContentHeightPx,
          bigCanvasHeightPx - pageIndex * pageContentHeightPx
        );
        chunkCanvas.height = Math.max(0, chunkHeightPx);

        const chunkCtx = chunkCanvas.getContext('2d');
        if (!chunkCtx) continue;

        // Draw the portion of the big canvas onto the chunk canvas
        const yOffsetPx = pageIndex * pageContentHeightPx;
        chunkCtx.drawImage(bigCanvas, 0, -yOffsetPx);

        // Convert chunk to data URL
        const chunkImgData = chunkCanvas.toDataURL('image/jpeg', 0.98);

        // The chunk’s height in mm after scaling
        const chunkHeightMM = chunkCanvas.height * pxToMm;

        // Add the chunk to the PDF
        pdf.addImage(
          chunkImgData,
          'JPEG',
          margins.left,
          margins.top,
          contentWidthMM,
          chunkHeightMM
        );

        // Optional: Add page numbering
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.text(
          `Page ${pageIndex + 1} of ${totalPages}`,
          pageWidthMM / 2,
          pageHeightMM - 5,
          { align: 'center' }
        );
      }

      // Generate a filename
      const videoTitle = document.title.replace(' - Notes', '') || 'YouTube Notes';
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`${videoTitle}_${timestamp}.pdf`);

    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    } finally {
      setDownloadingPdf(false);
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
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download as PDF"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {downloadingPdf ? 'Preparing...' : 'Download PDF'}
          </button>

          <button
            onClick={handleShareLink}
            className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md flex items-center"
            title="Share notes link"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
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
