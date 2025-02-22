# Detailed Deployment Instructions

This guide provides comprehensive step-by-step instructions for deploying the YouTube AI Notes Generator application to Cloudflare.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up Required API Keys](#setting-up-required-api-keys)
3. [Deploying the Transcript Worker](#deploying-the-transcript-worker)
4. [Configuring Environment Variables](#configuring-environment-variables)
5. [Deploying the Next.js Application](#deploying-the-nextjs-application)
6. [Verifying the Deployment](#verifying-the-deployment)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the deployment process, ensure you have:

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is sufficient)
- [Node.js](https://nodejs.org/) installed (v18.0.0 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) installed
- [Git](https://git-scm.com/) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed

Install Wrangler globally:

```bash
npm install -g wrangler
```

## Setting Up Required API Keys

### 1. OpenAI API Key

1. Create or log in to your [OpenAI account](https://platform.openai.com/)
2. Navigate to the [API keys page](https://platform.openai.com/account/api-keys)
3. Click "Create new secret key"
4. Name your key (e.g., "YouTube AI Notes Generator")
5. Copy the generated key and store it securely (it will only be shown once)

### 2. YouTube API Key (Optional, but recommended)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to "APIs & Services" > "Library"
4. Search for "YouTube Data API v3" and enable it
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API key"
7. Copy the generated API key
8. (Optional but recommended) Restrict the key to only the YouTube Data API

## Deploying the Transcript Worker

### 1. Prepare the Worker Code

1. Clone the repository and navigate to the worker directory:

```bash
git clone https://github.com/yourusername/youtube-notes-generator.git
cd youtube-notes-generator/workers/transcript-worker
```

2. Install dependencies:

```bash
npm install
```

3. Check the `wrangler.toml` file to ensure it has the correct configuration:

```toml
name = "youtube-transcript-worker"  # You can change this name
main = "src/index.js"
compatibility_date = "2023-10-30"

# Add any necessary environment variables if your worker needs them
# [vars]
# MY_VARIABLE = "value"
```

### 2. Authenticate with Cloudflare

If you haven't already logged in:

```bash
wrangler login
```

This will open a browser window to authenticate with your Cloudflare account.

### 3. Deploy the Worker

```bash
wrangler deploy
```

Once deployed, you'll see output similar to:

```
Successfully published your script to
https://youtube-transcript-worker.yourusername.workers.dev
```

**Save this URL** - you'll need it for the Next.js application.

### 4. Test the Worker

Test your worker by sending a POST request with a YouTube URL:

```bash
curl -X POST https://youtube-transcript-worker.yourusername.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Or use a tool like [Postman](https://www.postman.com/) to send the request.

The response should include the transcript data if successful.

## Configuring Environment Variables

Before deploying the Next.js application, prepare your environment variables:

### 1. Create an Environment Variables File

Create a `.env.production` file in the root of your project:

```
# Worker URL
NEXT_PUBLIC_WORKER_URL=https://youtube-transcript-worker.yourusername.workers.dev

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# YouTube API (optional)
NEXT_PUBLIC_YOUTUBE_API_KEY=your-youtube-api-key

# Prompt for note generation
SUMMARY_PROMPT="Based on the following YouTube video transcript, create comprehensive structured notes. Format the notes with clear headings, bullet points, and highlight key concepts. Include a brief summary at the beginning. Here's the transcript:"
```

These variables will be used during both local testing and when configuring your Cloudflare Pages deployment.

## Deploying the Next.js Application

You have two options for deploying the Next.js application to Cloudflare Pages:

### Option 1: GitHub Integration (Recommended)

1. Push your repository to GitHub:

```bash
# From the project root
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. Set up Cloudflare Pages:
   
   a. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/)
   
   b. Navigate to "Pages" from the sidebar
   
   c. Click "Create a project" and then "Connect to Git"
   
   d. Select your GitHub repository
   
   e. Configure your build settings:
      - Framework preset: **Next.js**
      - Build command: `npm run build`
      - Build output directory: `.next`
      - Node.js version: **18** (or higher)

   f. Click "Environment variables" and add the following variables:
      - `NEXT_PUBLIC_WORKER_URL`: Your Cloudflare Worker URL
      - `OPENAI_API_KEY`: Your OpenAI API key
      - `OPENAI_MODEL`: Your chosen OpenAI model (e.g., `gpt-4-turbo-preview`)
      - `NEXT_PUBLIC_YOUTUBE_API_KEY`: Your YouTube API key (optional)
      - `SUMMARY_PROMPT`: Your custom prompt for note generation

   g. Click "Save and Deploy"

   h. Wait for the build and deployment to complete

### Option 2: Wrangler Direct Deployment

1. Return to the project root directory and install the required package:

```bash
cd ../..  # If you're still in the workers directory
npm install -D @cloudflare/next-on-pages
```

2. Add the following scripts to your package.json:

```json
"scripts": {
  "pages:build": "npx @cloudflare/next-on-pages",
  "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static",
  "pages:watch": "npx @cloudflare/next-on-pages --watch",
  "pages:dev": "npx wrangler pages dev .vercel/output/static --compatibility-flag=nodejs_compat"
}
```

3. Build and deploy:

```bash
npm run build  # Regular Next.js build
npm run pages:build  # Convert for Cloudflare
```

4. Create a Cloudflare Pages project via command line:

```bash
wrangler pages project create youtube-notes-generator
```

5. Deploy your site:

```bash
wrangler pages deploy .vercel/output/static
```

6. Add environment variables through the Cloudflare Dashboard or via Wrangler:

```bash
wrangler pages secret put OPENAI_API_KEY --project-name youtube-notes-generator
# Enter your secret value when prompted
```

Repeat for all environment variables.

## Verifying the Deployment

After deployment is complete:

1. Visit your Cloudflare Pages URL (e.g., `https://youtube-notes-generator.pages.dev`)
2. Test the application by entering a YouTube URL
3. Verify that the transcript is fetched correctly
4. Confirm that notes are generated properly

## Troubleshooting

### Worker Issues

- **CORS Errors**: If you see CORS errors in the console, check that your worker has the correct CORS headers:

```javascript
// In your worker code
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
```

- **Worker Not Responding**: Check the worker URL in your environment variables and ensure it's correct.

### Next.js Deployment Issues

- **Build Failures**: If the build fails, check the build logs in the Cloudflare Dashboard for specific errors.

- **Missing Environment Variables**: Confirm all environment variables are correctly set in Cloudflare Pages.

- **API Connectivity Issues**: 
  - Test OpenAI connectivity by calling the API directly
  - Check that your API key is valid and has sufficient quota

- **Next.js/Cloudflare Compatibility**: If you encounter compatibility issues, try adding the following to your next.config.js:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
  // For Cloudflare Pages compatibility
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
```

### API Key Issues

- **OpenAI Rate Limits**: If you hit rate limits with OpenAI, you may need to upgrade your plan or implement rate limiting in your application.

- **YouTube API Quota**: The YouTube Data API has daily quotas. If you exceed them, you'll need to wait for the quota to reset or request an increase.

## Maintenance and Updates

To update your application:

1. Pull the latest changes from your repository
2. Make any necessary modifications
3. Push the changes to GitHub, which will trigger a new build and deployment if you're using the GitHub integration
4. Alternatively, run the manual deployment process again

## Setting Up Custom Domain (Optional)

To use a custom domain with your Cloudflare Pages site:

1. Go to your Cloudflare Pages project in the Dashboard
2. Click on "Custom domains"
3. Click "Set up a custom domain"
4. Follow the instructions to add and verify your domain

Note that your domain DNS must be managed by Cloudflare for the easiest setup.

## Next Steps

After successful deployment, consider:

- Setting up analytics to track usage
- Implementing user authentication if needed
- Adding more features to enhance the application
- Setting up monitoring to ensure the application runs smoothly

Congratulations! YouTube AI Notes Generator should now be fully deployed and accessible through your Cloudflare Pages URL.