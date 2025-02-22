import type { Metadata } from 'next';
import Image from 'next/image';
import { Inter } from 'next/font/google';
import './globals.css';
import GitHubStars from '@/components/GitHubStars';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YouTube AI Notes Generator by VegaStack',
  description: 'Automatically extracts transcripts from YouTube videos, processes them with OpenAI, and generates structured notes for efficient learning.',
  openGraph: {
    title: 'YouTube AI Notes Generator by VegaStack',
    description: 'Extracts transcripts from YouTube videos and generates AI-powered structured notes for better learning.',
    url: 'https://youtube-notes.vegastack.com.com', // Replace with your actual domain
    siteName: 'YouTube AI Notes Generator',
    images: [
      {
        url: 'https://youtube-notes.vegastack.com/og-image.jpg', // Replace with your actual image URL
        width: 1200,
        height: 630,
        alt: 'YouTube AI Notes Generator by VegaStack',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube AI Notes Generator',
    description: 'Extracts transcripts from YouTube videos and generates AI-powered structured notes for better learning.',
    images: ['https://youtube-notes.vegastack.com/twitter-image.jpg'], // Replace with your actual image URL
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
    <body className={inter.className}>
    <div className="min-h-screen flex flex-col">
    <header className="bg-black text-white">
    <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center sm:justify-between space-y-2 sm:space-y-0">
        
        {/* Logo + Title - Left Aligned on Desktop, Centered on Mobile */}
        <div className="flex items-center space-x-2">
        <a href="/" className="flex items-center space-x-2">
            <Image 
            src="/images/logo.png" 
            alt="YouTube AI Notes Generator Logo" 
            width={40} 
            height={40} 
            className="w-10 h-10"
            />
            <span className="text-2xl font-bold">YouTube AI Notes</span>
        </a>
        </div>

        {/* Buttons - Centered on Mobile & Adjacent */}
        <div className="flex items-center justify-center sm:justify-start space-x-3 w-full sm:w-auto">
        {/* GitHub Stars Component */}
        <GitHubStars />
        
        <a
            href="https://vegastack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-primary-1300 hover:bg-gray-100 py-2 px-3 rounded-md transition-colors duration-200 flex items-center text-sm"
        >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            VegaStack
        </a>
        </div>
        
    </div>
    </header>
          
        <main className="flex-grow py-4">
            {children}
        </main>
          
        <footer className="bg-gray-100 px-6 border-t border-gray-200">
        <div className="container mx-auto px-4 py-4">
            
            {/* Mobile View - Centered with New Lines */}
            <div className="sm:hidden flex flex-col items-center text-center space-y-2 text-sm text-primary-1300">
            <span>&copy; {new Date().getFullYear()} YouTube AI Notes Generator</span>
            <span>Powered by <a href="https://vegastack.com" target="_blank" rel="noopener noreferrer" className="text-primary-1300 hover:underline">VegaStack Inc.</a></span>
            <span>Developed by <a href="https://kmanojkumar.com" target="_blank" rel="noopener noreferrer" className="text-primary-1300 hover:underline">K Manoj Kumar</a></span>
            <a 
                href="https://github.com/VegaStack/youtube-ai-notes-generator" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-1300 hover:text-primary-1300 transition-colors duration-200 flex items-center mt-2"
            >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
            </a>
            </div>

            {/* Desktop View - Left/Right Alignment */}
            <div className="hidden sm:flex justify-between items-center text-sm text-primary-1300">
            <div>
                &copy; {new Date().getFullYear()} YouTube AI Notes Generator <span className="mx-1">·</span> 
                Powered by <a href="https://vegastack.com" target="_blank" rel="noopener noreferrer" className="text-primary-1300 hover:underline">VegaStack Inc.</a> <span className="mx-1">·</span> 
                Developed by <a href="https://kmanojkumar.com" target="_blank" rel="noopener noreferrer" className="text-primary-1300 hover:underline">K Manoj Kumar</a>
            </div>
            <a 
                href="https://github.com/VegaStack/youtube-ai-notes-generator" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-1300 hover:text-primary-1300 transition-colors duration-200 flex items-center"
            >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                GitHub
            </a>
            </div>
        </div>
        </footer>

        </div>
      </body>
    </html>
  );
}