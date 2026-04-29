export function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function extractPlaylistId(url) {
  if (!url) return null;
  const m = url.match(/[?&]list=([\w-]+)/);
  return m ? m[1] : null;
}

export function youtubeEmbedUrl(videoUrl) {
  const playlistId = extractPlaylistId(videoUrl);
  const videoId = extractYouTubeId(videoUrl);
  if (videoId && playlistId) return `https://www.youtube.com/embed/${videoId}?list=${playlistId}`;
  if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  if (playlistId) return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
  return null;
}

export function youtubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
