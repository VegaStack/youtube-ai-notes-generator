'use client';

import { useState, useEffect } from 'react';

export default function GitHubStars() {
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch star count from GitHub API
    fetch('https://api.github.com/repos/VegaStack/youtube-ai-notes-generator')
      .then(response => response.json())
      .then(data => {
        setStars(data.stargazers_count);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching GitHub stars:', error);
        setLoading(false);
      });
  }, []);
  
  return (
    <a 
    href="https://github.com/VegaStack/youtube-ai-notes-generator"
    target="_blank" 
    rel="noopener noreferrer"
    className="flex items-center bg-gray-800 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
    >
    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
    </svg>
    Star
    <span className="ml-1.5 bg-gray-700 px-1.5 py-0.5 rounded-md text-xs">
        {loading ? '...' : stars}
    </span>
    </a>
  );
}