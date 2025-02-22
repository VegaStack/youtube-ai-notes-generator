/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['img.youtube.com', 'i.ytimg.com'],
      unoptimized: true,
    },
    env: {
      WORKER_URL: process.env.WORKER_URL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_MODEL: process.env.OPENAI_MODEL,
      SUMMARY_PROMPT: process.env.SUMMARY_PROMPT,
    },
    // Add this to ensure proper build output
    output: 'export',
    distDir: '.next',
    // Disable page optimization to ensure proper static generation
    optimizeFonts: false,
    compiler: {
      removeConsole: false,
    },
  }
  
  module.exports = nextConfig