import React from 'react';

export function TrackCard({ track }: { track: any }) {
  const durationText = track.duration
    ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, '0')}`
    : '';

  const artistName =
    typeof track.artist === 'string'
      ? track.artist
      : track.artist?.name || 'Unknown Artist';

  return (
    <div
      className="song"
      style={{ cursor: 'pointer' }}
      onClick={() =>
        window.open(
          `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(track.name)}`,
          '_blank'
        )
      }
    >
      <span className="play-button">
        <i className="play"></i>
      </span>
      <img src={track.image?.[2]?.['#text'] || 'track.jpeg'} alt={track.name} />
      <div className="song-info">
        <h4>{track.name}</h4>
        <p>{artistName}</p>
        <p>{durationText}</p>
      </div>
    </div>
  );
}