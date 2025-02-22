var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/youtube-transcript/dist/youtube-transcript.esm.js
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  __name(adopt, "adopt");
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    __name(fulfilled, "fulfilled");
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    __name(rejected, "rejected");
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    __name(step, "step");
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
__name(__awaiter, "__awaiter");
var RE_YOUTUBE = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
var USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)";
var RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
var YoutubeTranscriptError = class extends Error {
  constructor(message) {
    super(`[YoutubeTranscript] \u{1F6A8} ${message}`);
  }
};
__name(YoutubeTranscriptError, "YoutubeTranscriptError");
var YoutubeTranscriptTooManyRequestError = class extends YoutubeTranscriptError {
  constructor() {
    super("YouTube is receiving too many requests from this IP and now requires solving a captcha to continue");
  }
};
__name(YoutubeTranscriptTooManyRequestError, "YoutubeTranscriptTooManyRequestError");
var YoutubeTranscriptVideoUnavailableError = class extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`The video is no longer available (${videoId})`);
  }
};
__name(YoutubeTranscriptVideoUnavailableError, "YoutubeTranscriptVideoUnavailableError");
var YoutubeTranscriptDisabledError = class extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`Transcript is disabled on this video (${videoId})`);
  }
};
__name(YoutubeTranscriptDisabledError, "YoutubeTranscriptDisabledError");
var YoutubeTranscriptNotAvailableError = class extends YoutubeTranscriptError {
  constructor(videoId) {
    super(`No transcripts are available for this video (${videoId})`);
  }
};
__name(YoutubeTranscriptNotAvailableError, "YoutubeTranscriptNotAvailableError");
var YoutubeTranscriptNotAvailableLanguageError = class extends YoutubeTranscriptError {
  constructor(lang, availableLangs, videoId) {
    super(`No transcripts are available in ${lang} this video (${videoId}). Available languages: ${availableLangs.join(", ")}`);
  }
};
__name(YoutubeTranscriptNotAvailableLanguageError, "YoutubeTranscriptNotAvailableLanguageError");
var YoutubeTranscript = class {
  /**
   * Fetch transcript from YTB Video
   * @param videoId Video url or video identifier
   * @param config Get transcript in a specific language ISO
   */
  static fetchTranscript(videoId, config) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      const identifier = this.retrieveVideoId(videoId);
      const videoPageResponse = yield fetch(`https://www.youtube.com/watch?v=${identifier}`, {
        headers: Object.assign(Object.assign({}, (config === null || config === void 0 ? void 0 : config.lang) && { "Accept-Language": config.lang }), { "User-Agent": USER_AGENT })
      });
      const videoPageBody = yield videoPageResponse.text();
      const splittedHTML = videoPageBody.split('"captions":');
      if (splittedHTML.length <= 1) {
        if (videoPageBody.includes('class="g-recaptcha"')) {
          throw new YoutubeTranscriptTooManyRequestError();
        }
        if (!videoPageBody.includes('"playabilityStatus":')) {
          throw new YoutubeTranscriptVideoUnavailableError(videoId);
        }
        throw new YoutubeTranscriptDisabledError(videoId);
      }
      const captions = (_a = (() => {
        try {
          return JSON.parse(splittedHTML[1].split(',"videoDetails')[0].replace("\n", ""));
        } catch (e) {
          return void 0;
        }
      })()) === null || _a === void 0 ? void 0 : _a["playerCaptionsTracklistRenderer"];
      if (!captions) {
        throw new YoutubeTranscriptDisabledError(videoId);
      }
      if (!("captionTracks" in captions)) {
        throw new YoutubeTranscriptNotAvailableError(videoId);
      }
      if ((config === null || config === void 0 ? void 0 : config.lang) && !captions.captionTracks.some((track) => track.languageCode === (config === null || config === void 0 ? void 0 : config.lang))) {
        throw new YoutubeTranscriptNotAvailableLanguageError(config === null || config === void 0 ? void 0 : config.lang, captions.captionTracks.map((track) => track.languageCode), videoId);
      }
      const transcriptURL = ((config === null || config === void 0 ? void 0 : config.lang) ? captions.captionTracks.find((track) => track.languageCode === (config === null || config === void 0 ? void 0 : config.lang)) : captions.captionTracks[0]).baseUrl;
      const transcriptResponse = yield fetch(transcriptURL, {
        headers: Object.assign(Object.assign({}, (config === null || config === void 0 ? void 0 : config.lang) && { "Accept-Language": config.lang }), { "User-Agent": USER_AGENT })
      });
      if (!transcriptResponse.ok) {
        throw new YoutubeTranscriptNotAvailableError(videoId);
      }
      const transcriptBody = yield transcriptResponse.text();
      const results = [...transcriptBody.matchAll(RE_XML_TRANSCRIPT)];
      return results.map((result) => {
        var _a2;
        return {
          text: result[3],
          duration: parseFloat(result[2]),
          offset: parseFloat(result[1]),
          lang: (_a2 = config === null || config === void 0 ? void 0 : config.lang) !== null && _a2 !== void 0 ? _a2 : captions.captionTracks[0].languageCode
        };
      });
    });
  }
  /**
   * Retrieve video id from url or string
   * @param videoId video url or video id
   */
  static retrieveVideoId(videoId) {
    if (videoId.length === 11) {
      return videoId;
    }
    const matchId = videoId.match(RE_YOUTUBE);
    if (matchId && matchId.length) {
      return matchId[1];
    }
    throw new YoutubeTranscriptError("Impossible to retrieve Youtube video ID.");
  }
};
__name(YoutubeTranscript, "YoutubeTranscript");

// src/index.js
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?\/]+)/,
    /youtube\.com\/embed\/([^\/\?]+)/,
    /youtube\.com\/v\/([^\/\?]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}
__name(extractVideoId, "extractVideoId");
var src_default = {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }
    if (request.method !== "GET" && request.method !== "POST") {
      return new Response(JSON.stringify({
        status_code: 400,
        message: "Only GET and POST methods are supported"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    try {
      let url;
      let languages = ["en"];
      if (request.method === "POST") {
        try {
          const body = await request.json();
          url = body.url;
          if (body.languages) {
            languages = Array.isArray(body.languages) ? body.languages : [body.languages];
          }
        } catch (error) {
          return new Response(JSON.stringify({
            status_code: 400,
            message: "Invalid JSON body"
          }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
      } else {
        const params = new URL(request.url).searchParams;
        url = params.get("url");
        const langParam = params.get("languages");
        if (langParam) {
          languages = langParam.split(",").map((lang) => lang.trim());
        }
      }
      if (!url) {
        return new Response(JSON.stringify({
          status_code: 107,
          message: "Missing required parameter: url"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      const videoId = extractVideoId(url);
      if (!videoId) {
        return new Response(JSON.stringify({
          status_code: 102,
          message: "Unable to extract video ID from URL"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        if (!transcript || transcript.length === 0) {
          return new Response(JSON.stringify({
            status_code: 104,
            message: "No transcript available for this video"
          }), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          });
        }
        const transcriptText = transcript.map((item) => item.text).join(" ");
        const response = {
          status_code: 100,
          message: "Transcript retrieved successfully",
          video_id: videoId,
          transcript,
          transcript_text: transcriptText
        };
        return new Response(JSON.stringify(response), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      } catch (error) {
        let statusCode = 104;
        let message = "Error retrieving transcript";
        if (error.message.includes("not found") || error.message.includes("404")) {
          statusCode = 103;
          message = "Video not found or is unavailable";
        }
        return new Response(JSON.stringify({
          status_code: statusCode,
          message,
          error: error.message
        }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(JSON.stringify({
        status_code: 110,
        message: "An unknown error occurred",
        error: error.message
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
  }
};
export {
  src_default as default
};
/*! Bundled license information:

youtube-transcript/dist/youtube-transcript.esm.js:
  (*! *****************************************************************************
  Copyright (c) Microsoft Corporation.
  
  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.
  
  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** *)
*/
//# sourceMappingURL=index.js.map
