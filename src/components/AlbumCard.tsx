import React from 'react';

export function AlbumCard({ album }: { album: any }) {
  return (
    <div className="album" style={{ cursor: 'pointer' }} onClick={() => window.open(`https://www.last.fm/music/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.name)}`, '_blank')}>
      <img src={album.image?.[2]?.['#text'] || 'photo.jpg'} alt={album.name} />
      <div className="album-info">
        <h4>{album.name}</h4>
        <p onClick={e => {e.stopPropagation(); window.open(`https://www.last.fm/music/${encodeURIComponent(album.artist)}`, '_blank');}} style={{ cursor: 'pointer' }}>{album.artist}</p>
      </div>
    </div>
  );
}