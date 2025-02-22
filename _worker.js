export default {
    async fetch(request, env, ctx) {
      const response = await env.ASSETS.fetch(request);
      return new Response(response.body, {
        ...response,
        headers: {
          ...response.headers,
          'Cross-Origin-Opener-Policy': 'same-origin',
          'Cross-Origin-Embedder-Policy': 'require-corp',
        },
      });
    },
    compatibility_flags: ["nodejs_compat"],
  };