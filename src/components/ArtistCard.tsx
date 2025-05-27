import React from 'react';

export function ArtistCard({ artist }: { artist: any }) {
  return (
    <div className="artist" style={{ cursor: 'pointer' }} onClick={() => window.open(`https://www.last.fm/music/${encodeURIComponent(artist.name)}`, '_blank')}>
      <img src={artist.image?.[2]?.['#text'] || 'photo.jpg'} alt={artist.name} />
      <div className="artist-info">
        <h4>{artist.name}</h4>
        {artist.listeners && (
          <p>{Number(artist.listeners).toLocaleString()} listeners</p>
        )}
      </div>
    </div>
  );
}

