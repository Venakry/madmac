import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';

export async function handler(event, context) {
  try {
    const res = await fetch('https://www.youtube.com/feeds/videos.xml?channel_id=UC0ud4nQPzZo4PMBVdKTSP5Q');
    const xmlText = await res.text();

    const parser = new XMLParser();
    const jsonData = parser.parse(xmlText);

    const entries = jsonData.feed.entry || [];

    const videos = entries.slice(0, 3).map(entry => ({
      title: entry.title,
      videoId: entry['yt:videoId'],
      thumbnail: `https://i.ytimg.com/vi/${entry['yt:videoId']}/hqdefault.jpg`,
      link: entry.link?.["@_href"]
    }));

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
