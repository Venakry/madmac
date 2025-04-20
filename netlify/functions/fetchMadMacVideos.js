import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export async function handler(event, context) {
  try {
    const res = await fetch('https://www.youtube.com/@M8DM8C/videos');
    const text = await res.text();

    const dom = new JSDOM(text);
    const document = dom.window.document;

    const scripts = [...document.querySelectorAll('script')];
    const ytDataScript = scripts.find(s => s.textContent.includes('var ytInitialData'));

    if (!ytDataScript) {
      throw new Error('Could not find initial YouTube data.');
    }

    const ytDataText = ytDataScript.textContent
      .replace('var ytInitialData = ', '')
      .replace(/;$/, '');

    const jsonData = JSON.parse(ytDataText);

    const videoItems = jsonData.contents
      ?.twoColumnBrowseResultsRenderer
      ?.tabs?.[0]
      ?.tabRenderer
      ?.content
      ?.richGridRenderer
      ?.contents || [];

    const videos = videoItems
      .filter(item => item.richItemRenderer && item.richItemRenderer.content.videoRenderer)
      .slice(0, 3) // Only 3 recent videos
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
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
