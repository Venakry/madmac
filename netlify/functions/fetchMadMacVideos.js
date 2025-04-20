// /netlify/functions/fetchMadMacVideos.js

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

export async function handler(event, context) {
  try {
    const res = await fetch('https://www.youtube.com/@M8DM8C/videos');
    const text = await res.text();

    const dom = new JSDOM(text);
    const document = dom.window.document;

    const scripts = [...document.querySelectorAll('script')];
    const ytInitialDataScript = scripts.find(s => s.textContent.includes('var ytInitialData ='));
    if (!ytInitialDataScript) throw new Error('Cannot find ytInitialData');

    const ytInitialDataText = ytInitialDataScript.textContent;
    const jsonData = JSON.parse(
      ytInitialDataText.match(/var ytInitialData = (.*?);<\/script>/s)?.[1] ||
      ytInitialDataText.replace('var ytInitialData = ', '').slice(0, -1)
    );

    const videoRenderer =
      jsonData.contents
        ?.twoColumnBrowseResultsRenderer
        ?.tabs?.[1]
        ?.tabRenderer
        ?.content
        ?.sectionListRenderer
        ?.contents?.[0]
        ?.itemSectionRenderer
        ?.contents?.[0]
        ?.gridRenderer
        ?.items || [];

    const videos = videoRenderer
      .filter(item => item.gridVideoRenderer)
      .slice(0, 3)
      .map(item => {
        const video = item.gridVideoRenderer;
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
