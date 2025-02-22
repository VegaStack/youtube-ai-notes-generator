'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ClipboardDocumentIcon, LinkIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

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

  // Copy share link to clipboard
  const handleShareLink = async () => {
    if (!videoId) {
      alert('Cannot share without video ID');
      return;
    }
    const shareUrl = `${window.location.origin}/notes/${videoId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy share link:', err);
      alert('Failed to copy share link to clipboard');
    }
  };

  // System share option
  const handleSystemShare = async () => {
    if (!videoId) {
      alert('Cannot share without video ID');
      return;
    }
    const shareUrl = `${window.location.origin}/notes/${videoId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check these notes',
          url: shareUrl
        });
      } catch (err) {
        console.error('System share canceled or failed', err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  // Download notes as PDF (multi-page, with header + dynamic footer)
  const handleDownloadPdf = async () => {
    if (!notesRef.current) return;

    try {
      setDownloadingPdf(true);

      // Create an off-screen container for consistent styling
      const container = document.createElement('div');
      container.style.width = '794px'; // A4 width in px at ~96 DPI
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

      // We'll apply margins
      const margins = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      };
      const contentWidthMM = pageWidthMM - margins.left - margins.right;

      // Reserve space for a header and a footer
      const headerHeightMM = 10; // Enough space for a header line
      const footerHeightMM = 10; // Enough space for a footer line
      const contentHeightMM =
        pageHeightMM - margins.top - margins.bottom - headerHeightMM - footerHeightMM;

      // Canvas dimensions in px
      const bigCanvasWidthPx = bigCanvas.width;
      const bigCanvasHeightPx = bigCanvas.height;

      // Scale from px to mm so the width fits into contentWidthMM
      const pxToMm = contentWidthMM / bigCanvasWidthPx;

      // The portion of the big canvas that fits on one PDF page in px
      const pageContentHeightPx = contentHeightMM / pxToMm;

      // Calculate total pages needed
      const totalPages = Math.ceil(bigCanvasHeightPx / pageContentHeightPx);

      // Header text
      const headerText = 'YouTube AI Notes Generator by VegaStack';

      // Dynamic footer text: "Generated on <date time> at <site url>"
      const dateTime = new Date().toLocaleString();
      const siteUrl = window.location.origin;
      const footerText = `Generated on ${dateTime} at ${siteUrl}`;

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        // Add a new page for every page after the first
        if (pageIndex > 0) {
          pdf.addPage();
        }

        // Draw the header on each page
        pdf.setFontSize(12);
        pdf.setTextColor(0); // black
        // Place header ~5 mm below the top margin
        pdf.text(headerText, pageWidthMM / 2, margins.top + 5, { align: 'center' });

        // Calculate how tall this chunk is
        const chunkHeightPx = Math.min(
          pageContentHeightPx,
          bigCanvasHeightPx - pageIndex * pageContentHeightPx
        );

        // Create a chunk canvas
        const chunkCanvas = document.createElement('canvas');
        chunkCanvas.width = bigCanvasWidthPx;
        chunkCanvas.height = Math.max(0, chunkHeightPx);

        const chunkCtx = chunkCanvas.getContext('2d');
        if (!chunkCtx) continue;

        // Draw the portion of the big canvas onto the chunk
        const yOffsetPx = pageIndex * pageContentHeightPx;
        chunkCtx.drawImage(bigCanvas, 0, -yOffsetPx);

        // Convert chunk to data URL
        const chunkImgData = chunkCanvas.toDataURL('image/jpeg', 0.98);

        // The chunk’s height in mm after scaling
        const chunkHeightMM = chunkCanvas.height * pxToMm;

        // Where we place the image below the header
        const imageY = margins.top + headerHeightMM;
        // Add the chunk image
        pdf.addImage(
          chunkImgData,
          'JPEG',
          margins.left,
          imageY,
          contentWidthMM,
          chunkHeightMM
        );

        // Draw the footer on each page
        pdf.setFontSize(10);
        pdf.setTextColor(0); // black
        // Place footer ~5 mm above the page bottom
        pdf.text(footerText, pageWidthMM / 2, pageHeightMM - margins.bottom - 5, {
          align: 'center'
        });

        // Add page numbering (centered near bottom)
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
    <div className="space-y-6">
      <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopyNotes}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Copy notes in markdown format"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </button>

            <button
              onClick={handleShareLink}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Copy share link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              title="Download as PDF"
            >
              {downloadingPdf ? (
                <div className="h-4 w-4 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin" />
              ) : (
                <ArrowDownTrayIcon className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={handleSystemShare}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Share"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {copySuccess && (
          <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md z-50">
            Copied to clipboard!
          </div>
        )}
        {shareSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md z-50">
            Share link copied!
          </div>
        )}

        <div ref={notesRef} className="prose max-w-none">
          <ReactMarkdown>{notes}</ReactMarkdown>
        </div>
      </div>

      <div className="flex justify-center py-8">
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Generate Notes for another YouTube video
        </Link>
      </div>
    </div>
  );
}
