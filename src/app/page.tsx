import YouTubeForm from '@/components/YouTubeForm';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
          YouTube AI Notes Generator
        </h1>
        <p className="text-xl text-primary-1300 max-w-3xl mx-auto">
          Transform any YouTube video into comprehensive, organized notes using AI.
          Save time and learn more effectively.
        </p>
      </div>
      
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-16">
        <YouTubeForm />
        <p className="text-sm text-gray-500 mt-4 text-center">
          Enter any YouTube URL to get started. Processing takes about 20-30 seconds.
        </p>
      </div>
      
      {/* Features Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Demo Video */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="aspect-video bg-gray-100 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image 
                src="/images/youtube-ai-notes-generator.png" 
                alt="YouTube AI Notes Generator"
                width={600}
                height={338}
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-1300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-2 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">See It In Action</h3>
            <p className="text-primary-1300">
              Watch how quickly you can generate comprehensive notes from any YouTube video.
            </p>
          </div>
        </div>
        
        {/* Main Features */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Key Features</h3>
          <ul className="space-y-3">
            <FeatureItem 
              icon="📝" 
              title="AI-Generated Notes" 
              description="Get structured, well-organized notes powered by GPT models"
            />
            <FeatureItem 
              icon="⏱️" 
              title="Interactive Timestamps" 
              description="Click any timestamp to jump to that moment in the video"
            />
            <FeatureItem 
              icon="💾" 
              title="Export Options" 
              description="Download as PDF or copy in markdown format"
            />
            <FeatureItem 
              icon="🔗" 
              title="Shareable Links" 
              description="Create simple links to share notes with others"
            />
            <FeatureItem 
              icon="📱" 
              title="Device Friendly" 
              description="Works seamlessly on all your devices and browsers"
            />
            <FeatureItem 
              icon="🆓" 
              title="Free to Use" 
              description="No account, payment or subscription is required to access"
            />
          </ul>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepCard 
            number="1" 
            title="Enter URL" 
            description="Paste any YouTube video link into the form" 
          />
          <StepCard 
            number="2" 
            title="Extract Transcript" 
            description="Our system automatically extracts the video transcript" 
          />
          <StepCard 
            number="3" 
            title="Generate Notes" 
            description="AI analyzes the content and creates structured notes" 
          />
          <StepCard 
            number="4" 
            title="Use & Share" 
            description="View notes alongside the video, export, or share with others" 
          />
        </div>
      </div>
      
      {/* Feature List */}
      <div className="mb-16 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Complete Feature List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard title="Automatic Transcript Extraction" icon="🔍" />
          <FeatureCard title="AI-Powered Note Generation" icon="🤖" />
          <FeatureCard title="Interactive Timestamps" icon="⏱️" />
          <FeatureCard title="Video & Creator Metadata" icon="ℹ️" />
          <FeatureCard title="Copy Notes as Markdown" icon="📋" />
          <FeatureCard title="Download Notes as PDF" icon="📄" />
          <FeatureCard title="Share via Direct Link" icon="🔗" />
          <FeatureCard title="Embedded YouTube Video Player" icon="▶️" />
          <FeatureCard title="Free to Use" icon="🆓" />
        </div>
      </div>
      
      {/* Call to Action - Fixed */}
      <div className="text-center bg-gradient-to-r from-primary-1100 to-primary-1300 rounded-lg shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to Try It?</h2>
        <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
          Generate notes for your first YouTube video and start learning more effectively.
          No signup required - it's completely free.
        </p>
        <a 
          href="#top" 
          className="inline-block bg-white text-primary-1300 py-3 px-8 rounded-md hover:bg-gray-100 transition duration-200 text-lg"
        >
          Get Started Now
        </a>
      </div>
      
      {/* VegaStack Banner */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2">Powered by VegaStack Inc.</h3>
            <p className="text-primary-1300 mb-3">
              Developed by <a href="https://kmanojkumar.com" target="_blank" rel="noopener noreferrer" className="text-primary-1300 hover:underline font-medium">K Manoj Kumar</a>, founder of <a href="https://vegastack.com" target="_blank" rel="noopener noreferrer" className="text-primary-1300 hover:underline font-medium">VegaStack</a>. 
            </p>
            <p className="text-primary-1300 text-sm">
              VegaStack builds powerful DevOps, AI, and Automation solutions for businesses worldwide.
            </p>
          </div>
          <a
            href="https://vegastack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-1300 hover:bg-primary-1100 text-white py-3 px-6 rounded-md transition-colors duration-200 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            Visit VegaStack
          </a>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FeatureItem({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <li className="flex items-start">
      <span className="text-xl mr-3">{icon}</span>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-primary-1300">{description}</p>
      </div>
    </li>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-1300 flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-primary-1300 text-sm">{description}</p>
    </div>
  );
}

function FeatureCard({ title, icon }: { title: string, icon: string }) {
  return (
    <div className="flex items-center p-4 border border-gray-200 rounded-lg">
      <span className="text-2xl mr-3">{icon}</span>
      <span className="text-sm">{title}</span>
    </div>
  );
}