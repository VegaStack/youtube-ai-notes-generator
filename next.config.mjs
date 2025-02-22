const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["img.youtube.com", "i.ytimg.com"],
    unoptimized: true,
  },
  env: {
    WORKER_URL: process.env.WORKER_URL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    SUMMARY_PROMPT: process.env.SUMMARY_PROMPT,
  },
  experimental: {
    runtime: "edge",
  },
  productionBrowserSourceMaps: false, // 🔹 Disable source maps in production
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // 🔹 Remove console logs in production
  },
};

export default nextConfig;