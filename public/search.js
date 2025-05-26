const key = '7a652543bdfde61e4e951c39f4b6834c';

const root = 'https://ws.audioscrobbler.com/2.0/';

let allArtists = [];
let allAlbums = [];
let allTracks = [];
let query = '';

/**
 * Получает поисковый запрос из параметра URL.
 * @returns {string} Строка поискового запроса или пустая строка.
 */
function getSearchQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

/**
 * Обновляет заголовок результата поиска.
 */
function updateSearchTitle() {
  const h2 = document.querySelector('.search-results h2');
  if (h2) {
    h2.textContent = `Search Results for "${query}"`;
  }
}

/**
 * Fetch-запрос к Last.fm API.
 * @param {string} method - Метод API.
 * @param {object} [params={}] - Дополнительные параметры запроса.
 * @returns {Promise<object|null>} Объект с данными ответа или null.
 */
const fetchFromLastApi = async (method, params = {}) => {
  const url = new URL(root);
  url.searchParams.set('method', method);
  url.searchParams.set('api_key', key);
  url.searchParams.set('format', 'json');
  Object.entries(params).forEach(([key, val]) => url.searchParams.set(key, val));
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error ${response.status}.`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API request error: ${error.message}`);
    return null;
  }
};


/**
 * Получает список артистов по запросу.
 * @param {string} query - Запрос.
 * @param {number} [limit=30] - Максимальное количество артистов.
 * @returns {Promise<Array>} Массив артистов.
 */
async function getArtists(query, limit = 30) {
  const data = await fetchFromLastApi('artist.search', { artist: query, limit });
  return data?.results?.artistmatches?.artist || [];
}

/**
 * Получает список альбомов по запросу.
 * @param {string} query - Запрос.
 * @param {number} [limit=30] - Максимальное количество альбомов.
 * @returns {Promise<Array>} Массив альбомов.
 */
async function getAlbums(query, limit = 30) {
  const data = await fetchFromLastApi('album.search', { album: query, limit });
  return data?.results?.albummatches?.album || [];
}

/**
 * Получает список треков по запросу.
 * @param {string} query - Запрос.
 * @param {number} [limit=30] - Максимальное количество треков.
 * @returns {Promise<Array>} Массив треков.
 */
async function getTracks(query, limit = 30) {
  const data = await fetchFromLastApi('track.search', { track: query, limit });
  return data?.results?.trackmatches?.track || [];
}

/**
 * Получает подробную информацию о треке.
 * @param {string} artist - Имя исполнителя.
 * @param {string} track - Название трека.
 * @returns {Promise<Object|null>} Объект с данными трека или null.
 */
async function getTrackInfo(artist, track) {
  const data = await fetchFromLastApi('track.getInfo', { artist, track });
  return data?.track || null;
}

/**
 * Получает список треков с длительностью для каждого.
 * @param {string} query - Запрос.
 * @param {number} [limit=30] - Максимальное количество треков.
 * @returns {Promise<Array>} Массив треков.
 */
async function getTracksWithDuration(query, limit = 30) {
  const tracks = await getTracks(query, limit);

  const detailedTracks = await Promise.all(tracks.map(async (track) => {
    const info = await getTrackInfo(track.artist, track.name);
    return {
      ...track,
      duration: info?.duration ? Number(info.duration) / 1000 : null,
    };
  }));

  return detailedTracks;
}

/**
 * Создаёт HTML-элемент с указанным классом и текстом.
 * @param {string} tagName - Имя HTML-тега.
 * @param {string} [className] - Класс для элемента.
 * @param {string} [textContent] - Текстовое содержимое.
 * @returns {HTMLElement} Созданный элемент.
 */
const createElement = (tagName, className, textContent) => {
  const el = document.createElement(tagName);
  if (className) {
    el.className = className;
  }
  if (textContent) {
    el.textContent = textContent;
  }
  return el;
};

/**
 * Создаёт карточку артиста.
 * @param {Object} artist - Объект артиста.
 * @returns {HTMLElement} DOM-элемент карточки артиста.
 */
function createArtistCard(artist) {
  const card = createElement('div', 'artist');
  card.style.cursor = 'pointer';

  const img = document.createElement('img');
  img.src = artist.image?.[2]?.['#text'] || 'photo.jpg';
  img.alt = artist.name;

  const artistInfo = createElement('div', 'artist-info');
  const nameEl = createElement('h4', null, artist.name);
  const listenersText = artist.listeners
    ? `${Number(artist.listeners).toLocaleString()} listeners`
    : '';
  const listenersEl = createElement('p', null, listenersText);

  artistInfo.append(nameEl, listenersEl);
  card.append(img, artistInfo);

  card.addEventListener('click', () => {
    window.open(`https://www.last.fm/music/${encodeURIComponent(artist.name)}`, '_blank');
  });

  return card;
}

/**
 * Рендер списка артистов в .artist-list.
 * @param {Array} artists - Массив артистов.
 */
function renderArtists(artists) {
  const list = document.querySelector('.artist-list');
  list.innerHTML = '';

  if (!artists.length) {
    const noArtists = createElement('div', null, 'No artists found.');
    noArtists.style.padding = '1em';
    list.appendChild(noArtists);
    return;
  }

  artists.forEach(artist => {
    const card = createArtistCard(artist);
    list.appendChild(card);
  });
}

/**
 * Создаёт карточку альбома.
 * @param {Object} album - Объект альбома.
 * @returns {HTMLElement} DOM-элемент карточки альбома.
 */
function createAlbumCard(album) {
  const card = createElement('div', 'album');
  card.style.cursor = 'pointer';

  const img = document.createElement('img');
  img.src = album.image?.[2]?.['#text'] || 'photo.jpg';
  img.alt = album.name;

  const albumInfo = createElement('div', 'album-info');
  const nameEl = createElement('h4', null, album.name);
  const artistEl = createElement('p', null, album.artist);

  albumInfo.append(nameEl, artistEl);
  card.append(img, albumInfo);

  card.addEventListener('click', () => {
    const url = `https://www.last.fm/music/${encodeURIComponent(album.artist)}/${encodeURIComponent(album.name)}`;
    window.open(url, '_blank');
  });

  artistEl.addEventListener('click', (e) => {
    e.stopPropagation(); // чтобы клик не "всплывал" на карточку
    const artistUrl = `https://www.last.fm/music/${encodeURIComponent(album.artist)}`;
    window.open(artistUrl, '_blank');
  });

  return card;
}

/**
 * Рендер списка альбомов в .album-list.
 * @param {Array} albums - Массив альбомов.
 */
function renderAlbums(albums) {
  const list = document.querySelector('.album-list');
  list.innerHTML = '';

  if (!albums.length) {
    const noAlbums = createElement('div', null, 'No albums found.');
    noAlbums.style.padding = '1em';
    list.appendChild(noAlbums);
    return;
  }

  albums.forEach(album => {
    const card = createAlbumCard(album);
    list.appendChild(card);
  });
}

/**
 * Создаёт карточку трека.
 * @param {Object} track - Объект трека.
 * @returns {HTMLElement} DOM-элемент карточки трека.
 */
function createTrackCard(track) {
  const card = createElement('div', 'song');

  const playButton = createElement('span', 'play-button');
  const playIcon = createElement('i', 'play');
  playButton.appendChild(playIcon);

  const img = document.createElement('img');
  img.src = track.image?.[2]?.['#text'] || 'track.jpeg';
  img.alt = track.name;

  const songInfo = createElement('div', 'song-info');
  const title = createElement('h4', null, track.name);
  const artist = createElement('p', null, track.artist);

  const durationText = track.duration
    ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`
    : '';
  const duration = createElement('p', null, durationText);

  songInfo.append(title, artist, duration);
  card.append(playButton, img, songInfo);

  const openTrackPage = () => {
    const url = `https://www.last.fm/music/${encodeURIComponent(track.artist)}/_/${encodeURIComponent(track.name)}`;
    window.open(url, '_blank');
  };

  card.addEventListener('click', openTrackPage);
  playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    openTrackPage();
  });

  return card;
}

/**
 * Рендер списка треков в .track-list.
 * @param {Array} tracks - Массив треков.
 */
function renderTracks(tracks) {
  const list = document.querySelector('.track-list');
  list.innerHTML = '';

  if (!tracks.length) {
    const noTracks = createElement('div', null, 'No tracks found.');
    noTracks.style.padding = '1em';
    list.appendChild(noTracks);
    return;
  }

  tracks.forEach(track => {
    const card = createTrackCard(track);
    list.appendChild(card);
  });
}

/**
 * Настраивает навигацию по вкладкам поиска.
 */
function setupSearchNav() {
  const navLinks = document.querySelectorAll('.search-nav ul li a');
  const sections = {
    'Top Results': ['.artists', '.albums', '.tracks'],
    'Artists': ['.artists'],
    'Albums': ['.albums'],
    'Tracks': ['.tracks']
  };
  navLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const text = link.textContent.trim();

      document.querySelectorAll('.artists, .albums, .tracks').forEach(sec => {
        sec.style.display = 'none';
      });
      (sections[text] || []).forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.display = '';
      });

      if (text === 'Artists') {
        allArtists = await getArtists(query, 30);
        renderArtists(allArtists);
      }
      if (text === 'Albums') {
        allAlbums = await getAlbums(query, 30);
        renderAlbums(allAlbums);
      }
      if (text === 'Tracks') {
        allTracks = await getTracksWithDuration(query, 30);
        renderTracks(allTracks);
      }
      if (text === 'Top Results') {
        renderArtists(allArtists.slice(0, 5));
        renderAlbums(allAlbums.slice(0, 5));
        renderTracks(allTracks.slice(0, 10));
      }
    });
  });
}

/**
 * Начальная инициализация страницы.
 */
document.addEventListener('DOMContentLoaded', async () => {
  query = getSearchQuery();
  updateSearchTitle();
  setupSearchNav();
  document.querySelectorAll('.artists, .albums, .tracks').forEach(sec => sec.style.display = '');
  const firstNav = document.querySelector('.search-nav ul li a');
  if (firstNav) firstNav.classList.add('active');
  if (query) {
    [allArtists, allAlbums, allTracks] = await Promise.all([
      getArtists(query, 30),
      getAlbums(query, 30),
      getTracksWithDuration(query, 30)
    ]);
    renderArtists(allArtists.slice(0, 5));
    renderAlbums(allAlbums.slice(0, 5));
    renderTracks(allTracks.slice(0, 8));
  }
});
