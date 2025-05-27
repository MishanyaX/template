import React from 'react';

export function PopularTrackCard({
  track,
  tags,
}: {
  track: { name: string; image?: { '#text': string }[]; artist: { name: string } };
  tags: string[];
}) {
  const getTrackUrl = (artistName: string, trackName: string) =>
    `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}`;
  const getArtistUrl = (artistName: string) =>
    `https://www.last.fm/music/${encodeURIComponent(artistName)}`;
  const getTagUrl = (tag: string) =>
    `https://www.last.fm/tag/${encodeURIComponent(tag)}`;

  return (
    <div
      className="track"
      style={{ cursor: 'pointer' }}
      onClick={() => window.open(getTrackUrl(track.artist.name, track.name), '_blank')}
    >
      <img
        src={track.image?.[2]?.['#text'] || 'track.jpeg'}
        alt={track.name}
      />
      <div className="track-info">
        <div className="track-title">{track.name}</div>
        <div
          className="track-artist"
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            window.open(getArtistUrl(track.artist.name), '_blank');
          }}
        >
          {track.artist.name}
        </div>
        <div className="song-tags">
          {tags.map(tag => (
            <p
              key={tag}
              className="song-tag"
              style={{ cursor: 'pointer', display: 'inline-block', marginRight: 6 }}
              onClick={e => {
                e.stopPropagation();
                window.open(getTagUrl(tag), '_blank');
              }}
            >
              {tag}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}