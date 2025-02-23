import { createPagesFunctionHandler } from "@cloudflare/pages-plugin-next";
import manifestJSON from "__STATIC_CONTENT_MANIFEST"; // Internal to CF

const assetManifest = JSON.parse(manifestJSON);

export function onRequest(context) {
  // Ensure DB binding exists before setting
  if (!context.env.DB) {
    console.warn("Warning: Cloudflare D1 database (DB) is not available.");
  } else {
    globalThis.DB = context.env.DB;
  }

  // Hand off the request to Next.js
  return createPagesFunctionHandler({
    buildManifest: assetManifest,
  })(context);
}