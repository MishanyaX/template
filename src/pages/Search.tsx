import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getArtists, getAlbums, getTracksWithDuration } from '../api/lastfm';
import { ArtistCard } from '../components/ArtistCard';
import { AlbumCard } from '../components/AlbumCard';
import { TrackCard } from '../components/TrackCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const TABS = ['Top Results', 'Artists', 'Albums', 'Tracks'] as const;
type TabType = typeof TABS[number];

export function Search() {
  const location = useLocation();
  const query = useQuery().get('q') || '';
  const [activeTab, setActiveTab] = useState<TabType>('Top Results');
  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [allAlbums, setAllAlbums] = useState<any[]>([]);
  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // При изменении запроса — обновляем данные и сбрасываем вкладку
  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    (async () => {
      const [artists, albums, tracks] = await Promise.all([
        getArtists(query, 30),
        getAlbums(query, 30),
        getTracksWithDuration(query, 30),
      ]);
      setAllArtists(artists);
      setAllAlbums(albums);
      setAllTracks(tracks);
      setActiveTab('Top Results');
      setLoading(false);
    })();
  }, [query]);

  // Мемоизированные срезы для Top Results
  const topArtists = useMemo(() => allArtists.slice(0, 5), [allArtists]);
  const topAlbums = useMemo(() => allAlbums.slice(0, 5), [allAlbums]);
  const topTracks = useMemo(() => allTracks.slice(0, 8), [allTracks]);

  // Контент для каждой вкладки
  let content: React.ReactNode = null;
  if (activeTab === 'Top Results') {
    content = (
      <>
        <section className="artists">
          <h3>Artists</h3>
          <div className="artist-list">
            {topArtists.length === 0 ? <div>No artists found.</div> : topArtists.map((a: any) => <ArtistCard key={a.mbid || a.name} artist={a} />)}
          </div>
        </section>
        <section className="albums">
          <h3>Albums</h3>
          <div className="album-list">
            {topAlbums.length === 0 ? <div>No albums found.</div> : topAlbums.map((a: any) => <AlbumCard key={a.mbid || a.name + a.artist} album={a} />)}
          </div>
        </section>
        <section className="tracks">
          <h3>Tracks</h3>
          <div className="track-list">
            {topTracks.length === 0 ? <div>No tracks found.</div> : topTracks.map((t: any) => <TrackCard key={t.mbid || t.name + (t.artist?.name || t.artist)} track={t} />)}
          </div>
        </section>
      </>
    );
  }
  if (activeTab === 'Artists') {
    content = (
      <section className="artists">
        <h3>Artists</h3>
        <div className="artist-list">
          {allArtists.length === 0 ? <div>No artists found.</div> : allArtists.map((a: any) => <ArtistCard key={a.mbid || a.name} artist={a} />)}
        </div>
      </section>
    );
  }
  if (activeTab === 'Albums') {
    content = (
      <section className="albums">
        <h3>Albums</h3>
        <div className="album-list">
          {allAlbums.length === 0 ? <div>No albums found.</div> : allAlbums.map((a: any) => <AlbumCard key={a.mbid || a.name + a.artist} album={a} />)}
        </div>
      </section>
    );
  }
  if (activeTab === 'Tracks') {
    content = (
      <section className="tracks">
        <h3>Tracks</h3>
        <div className="track-list">
          {allTracks.length === 0 ? <div>No tracks found.</div> : allTracks.map((t: any) => <TrackCard key={t.mbid || t.name + (t.artist?.name || t.artist)} track={t} />)}
        </div>
      </section>
    );
  }

  return (
    <main>
      <section className="search-results">
        <h2>Search Results for "{query}"</h2>
        <div className="search-nav">
          <ul>
            {TABS.map(tab => (
              <li key={tab}>
                <a
                  href="#"
                  className={activeTab === tab ? 'active' : ''}
                  onClick={e => {
                    e.preventDefault();
                    setActiveTab(tab);
                  }}
                >
                  {tab}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {loading ? <div style={{padding: "2em"}}>Loading...</div> : content}
      </section>
    </main>
  );
}