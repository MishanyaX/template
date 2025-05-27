const API_KEY = '7a652543bdfde61e4e951c39f4b6834c';
const ROOT = 'https://ws.audioscrobbler.com/2.0/';

export async function fetchFromLastApi(method: string, params: Record<string, string | number> = {}) {
  const url = new URL(ROOT);
  url.searchParams.set('method', method);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('format', 'json');
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, String(val)));
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}

export async function getTopArtists() {
  const data = await fetchFromLastApi('chart.gettopartists', { limit: 12 });
  return data?.artists?.artist || [];
}

export async function getTopTracks() {
  const data = await fetchFromLastApi('chart.gettoptracks', { limit: 18 });
  return data?.tracks?.track || [];
}

export async function getArtistTags(artist: string) {
  const data = await fetchFromLastApi('artist.gettoptags', { artist });
  return data?.toptags?.tag?.slice(0, 3).map((tag: any) => tag.name) || [];
}

export async function getTrackTags(artist: string, track: string) {
  const data = await fetchFromLastApi('track.gettoptags', { artist, track });
  return data?.toptags?.tag?.slice(0, 3).map((tag: any) => tag.name) || [];
}

export async function getArtists(query: string, limit = 30) {
  const data = await fetchFromLastApi('artist.search', { artist: query, limit });
  return data?.results?.artistmatches?.artist || [];
}

export async function getAlbums(query: string, limit = 30) {
  const data = await fetchFromLastApi('album.search', { album: query, limit });
  return data?.results?.albummatches?.album || [];
}

export async function getTracks(query: string, limit = 30) {
  const data = await fetchFromLastApi('track.search', { track: query, limit });
  return data?.results?.trackmatches?.track || [];
}

export async function getTrackInfo(artist: string, track: string) {
  const data = await fetchFromLastApi('track.getInfo', { artist, track });
  return data?.track || null;
}

export async function getTracksWithDuration(query: string, limit = 30) {
  const tracks = await getTracks(query, limit);
  const detailedTracks = await Promise.all(tracks.map(async (track: any) => {
    const info = await getTrackInfo(track.artist, track.name);
    return {
      ...track,
      duration: info?.duration ? Number(info.duration) / 1000 : null,
    };
  }));
  return detailedTracks;
}