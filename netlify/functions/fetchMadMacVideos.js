import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export async function handler(event, context) {
  try {
    const res = await fetch('https://www.youtube.com/channel/UC0ud4nQPzZo4PMBVdKTSP5Q/videos', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    const text = await res.text();
    const dom = new JSDOM(text);
    const document = dom.window.document;

    const scripts = [...document.querySelectorAll('script')];
    const ytDataScript = scripts.find(s => s.textContent.includes('var ytInitialData'));

    if (!ytDataScript) {
      throw new Error('could not find ytInitialData. youtube probably changed layout again.');
    }

    const ytDataText = ytDataScript.textContent
      .replace('var ytInitialData = ', '')
      .replace(/;$/, '');

    const jsonData = JSON.parse(ytDataText);

    const videoItems = jsonData.contents
      ?.twoColumnBrowseResultsRenderer
      ?.tabs?.find(tab => tab.tabRenderer && tab.tabRenderer.title === "Videos")
      ?.tabRenderer
      ?.content
      ?.richGridRenderer
      ?.contents || [];

    const videos = videoItems
      .filter(item => item.richItemRenderer && item.richItemRenderer.content.videoRenderer)
      .slice(0, 3)
      .map(item => {
        const video = item.richItemRenderer.content.videoRenderer;
        return {
          title: video.title.runs[0].text,
          videoId: video.videoId,
          thumbnail: video.thumbnail.thumbnails.pop().url,
          link: `https://www.youtube.com/watch?v=${video.videoId}`
        };
      });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET"
      },
      body: JSON.stringify(videos)
    };

  } catch (err) {
    console.error('serverless function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
