import React from 'react';

export function PopularArtistCard({
  artist,
  tags,
}: {
  artist: { name: string; image?: { '#text': string }[] };
  tags: string[];
}) {
  const getArtistUrl = (artistName: string) =>
    `https://www.last.fm/music/${encodeURIComponent(artistName)}`;
  const getTagUrl = (tag: string) =>
    `https://www.last.fm/tag/${encodeURIComponent(tag)}`;

  return (
    <div
      className="artist-card"
      style={{ cursor: 'pointer' }}
      onClick={() => window.open(getArtistUrl(artist.name), '_blank')}
    >
      <img
        src={artist.image?.[2]?.['#text'] || 'photo.jpg'}
        alt={artist.name}
      />
      <div className="artist-name">{artist.name}</div>
      <div className="artist-tags">
        {tags.map(tag => (
          <p
            key={tag}
            className="artist-tag"
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
  );
}