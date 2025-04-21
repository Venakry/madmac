async function fetchVideos() {
  const videosDiv = document.getElementById('videos');
  const loader = document.getElementById('loader');

  try {
    let videos = [];

    if (location.protocol === 'file:') {
      // opened from file explorer, fetch youtube page directly
      console.log('opened locally, scraping youtube from browser...');

      const res = await fetch('https://corsproxy.io/?https://www.youtube.com/@M8DM8C/videos');
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      const scripts = [...doc.querySelectorAll('script')];
      const ytDataScript = scripts.find(s => s.textContent.includes('var ytInitialData'));

      if (!ytDataScript) throw new Error('could not find ytInitialData in local mode');

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

      videos = videoItems
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

    } else {
      // online mode (netlify), fetch from serverless
      console.log('running online, fetching videos from serverless...');

      const response = await fetch('/.netlify/functions/fetchMadMacVideos');
      videos = await response.json();
    }

    // clean the ui and put the videos
    videosDiv.innerHTML = '';
    loader.style.display = 'none';
    videosDiv.style.display = 'flex';

    videos.forEach(video => {
      const videoItem = document.createElement('div');
      videoItem.className = 'video-item';
      videoItem.onclick = () => window.open(video.link, '_blank');

      videoItem.innerHTML = `
        <div class="video-arrow">&#10148;</div>
        <div class="video-info">
          <img src="${video.thumbnail}" alt="Thumbnail">
          <span>${video.title}</span>
        </div>
      `;

      videosDiv.appendChild(videoItem);
    });

  } catch (error) {
    console.error('fucked up fetching videos:', error);
    videosDiv.innerHTML = '<div>Failed to load videos.</div>';
  }
}

fetchVideos();
setInterval(fetchVideos, 10 * 60 * 1000); // refresh every 10 minutes
