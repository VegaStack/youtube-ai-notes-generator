import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import "./globals.css";
import GitHubStars from "@/components/GitHubStars";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YouTube AI Notes Generator by VegaStack",
  description:
    "Automatically extracts transcripts from YouTube videos, processes them with OpenAI, and generates structured notes for efficient learning.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://youtube-notes.vegastack.com"), // 🔹 Dynamically set site URL
  openGraph: {
    title: "YouTube AI Notes Generator by VegaStack",
    description:
      "Extracts transcripts from YouTube videos and generates AI-powered structured notes for better learning.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://youtube-notes.vegastack.com",
    siteName: "YouTube AI Notes Generator",
    images: [
      {
        url: "/images/favicons/favicon-96x96.png", // 🔹 Using favicon as default Open Graph image
        width: 96,
        height: 96,
        alt: "YouTube AI Notes Generator by VegaStack",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube AI Notes Generator",
    description:
      "Extracts transcripts from YouTube videos and generates AI-powered structured notes for better learning.",
    images: ["/images/favicons/favicon-96x96.png"],
  },
  icons: {
    icon: "/images/favicons/favicon.ico",
    shortcut: "/images/favicons/favicon-96x96.png",
    apple: "/images/favicons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicons */}
        <link rel="icon" href="/images/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/images/favicons/favicon-96x96.png" />
        <link rel="icon" type="image/svg+xml" href="/images/favicons/favicon.svg" />
        <link rel="manifest" href="/images/favicons/site.webmanifest" />
      </head>
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
                <GitHubStars />
                <a
                  href="https://vegastack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-primary-1300 hover:bg-gray-100 py-2 px-3 rounded-md transition-colors duration-200 flex items-center text-sm"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  VegaStack
                </a>
              </div>
            </div>
          </header>

          <main className="flex-grow py-4">{children}</main>

          <footer className="bg-gray-100 px-6 border-t border-gray-200">
            <div className="container mx-auto px-4 py-4">
              {/* Mobile View - Centered with New Lines */}
              <div className="sm:hidden flex flex-col items-center text-center space-y-2 text-sm text-primary-1300">
                <span>&copy; {new Date().getFullYear()} YouTube AI Notes Generator</span>
                <span>
                  Powered by{" "}
                  <a
                    href="https://vegastack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-1300 hover:underline"
                  >
                    VegaStack Inc.
                  </a>
                </span>
                <span>
                  Developed by{" "}
                  <a
                    href="https://kmanojkumar.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-1300 hover:underline"
                  >
                    K Manoj Kumar
                  </a>
                </span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}