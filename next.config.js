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
    // Ensure these settings are compatible with Cloudflare Pages
    swcMinify: true,
    experimental: {
      isrMemoryCacheSize: 0,
      serverActions: true,
    }
  }
  
  module.exports = nextConfig