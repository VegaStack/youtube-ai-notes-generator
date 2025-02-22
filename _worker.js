export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const response = await env.ASSETS.fetch(request);
  
      // Add CORS and compatibility headers
      const headers = new Headers(response.headers);
      headers.set('Cross-Origin-Opener-Policy', 'same-origin');
      headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }
  };
  
  // Set compatibility flags
  export const compatibility_flags = ["nodejs_compat"];
  
  // Configure env
  export const envPath = '.env';
  
  // Set runtime options
  export const runtime = {
    edge: true,
    nodejs_compat: true
  };