import React, { useEffect, useState } from 'react';
import { getTopArtists, getTopTracks, getArtistTags, getTrackTags } from '../api/lastfm';
import { PopularArtistCard } from '../components/PopularArtistCard';
import { PopularTrackCard } from '../components/PopularTrackCard';

export function Home() {
  const [artists, setArtists] = useState<any[]>([]);
  const [artistTags, setArtistTags] = useState<string[][]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [trackTags, setTrackTags] = useState<string[][]>([]);

  useEffect(() => {
    (async () => {
      const arts = await getTopArtists();
      setArtists(arts);
      setArtistTags(await Promise.all(arts.map((a: any) => getArtistTags(a.name))));
      const trks = await getTopTracks();
      setTracks(trks);
      setTrackTags(await Promise.all(trks.map((t: any) => getTrackTags(t.artist.name, t.name))));
    })();
  }, []);

  return (
    <main>
      <h1 className="main-title">Music</h1>
      <section className="hot-artists">
        <h2 className="section-title">Hot right now</h2>
        <div className="artists-grid">
          {artists.length === 0 && <p>No popular artists.</p>}
          {artists.map((artist, idx) => (
            <PopularArtistCard
              key={artist.mbid || artist.name}
              artist={artist}
              tags={artistTags[idx] || []}
            />
          ))}
        </div>
      </section>
      <section className="popular-tracks">
        <h2 className="section-title">Popular tracks</h2>
        <div className="tracks-grid">
          {tracks.length === 0 && <p>No popular tracks.</p>}
          {tracks.map((track, idx) => (
            <PopularTrackCard
              key={track.mbid || track.name + track.artist.name}
              track={track}
              tags={trackTags[idx] || []}
            />
          ))}
        </div>
      </section>
    </main>
  );
}