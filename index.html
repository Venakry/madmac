import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

export async function handler(event, context) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    // Validate YouTube channel ID
    const channelId = 'UC0ud4nQPzZo4PMBVdKTSP5Q';
    if (!channelId || !channelId.startsWith('UC')) {
      throw new Error('Invalid YouTube channel ID');
    }

    // Fetch YouTube RSS feed with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`YouTube API responded with status ${res.status}`);
    }

    const xmlText = await res.text();
    if (!xmlText.includes('<feed')) {
      throw new Error('Invalid YouTube RSS response');
    }

    // Parse XML with error handling
    const parser = new XMLParser({
      ignoreAttributes: false,
      isArray: (name) => name === 'entry'
    });

    let jsonData;
    try {
      jsonData = parser.parse(xmlText);
    } catch (parseError) {
      throw new Error('Failed to parse YouTube RSS feed');
    }

    // Process entries with validation
    const entries = jsonData?.feed?.entry || [];
    if (!Array.isArray(entries)) {
      throw new Error('Invalid video entries format');
    }

    const videos = entries.slice(0, 6).map(entry => {
      if (!entry?.['yt:videoId']) {
        throw new Error('Missing video ID in entry');
      }
      
      return {
        title: entry.title || 'Untitled Video',
        videoId: entry['yt:videoId'],
        thumbnail: `https://i.ytimg.com/vi/${entry['yt:videoId']}/hqdefault.jpg`,
        link: `https://youtube.com/watch?v=${entry['yt:videoId']}`,
        published: entry.published ? new Date(entry.published).toISOString() : null
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        recent: videos,
        popular: [...videos].sort(() => 0.5 - Math.random()).slice(0, 6) // Random 6 as popular
      })
    };

  } catch (err) {
    console.error('Scraper error:', err);
    return {
      statusCode: err.message.includes('timeout') ? 504 : 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch videos',
        details: err.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}
