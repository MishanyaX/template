const key = '7a652543bdfde61e4e951c39f4b6834c';

const root = 'https://ws.audioscrobbler.com/2.0/';

const METHOD = {
  topArtists: 'chart.gettopartists',
  topTracks: 'chart.gettoptracks',
  artistTags: 'artist.gettoptags',
  trackTags: 'track.gettoptags'
};

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
 * Получает список топ-артистов.
 * @returns {Promise<Array>} Массив объектов артистов.
 */
const getTopArtists = async () => {
  const data = await fetchFromLastApi(METHOD.topArtists, { limit: 12 });
  return data?.artists?.artist || [];
};

/**
 * Получает список топ-треков.
 * @returns {Promise<Array>} Массив объектов треков.
 */
const getTopTracks = async () => {
  const data = await fetchFromLastApi(METHOD.topTracks, { limit: 18 });
  return data?.tracks?.track || [];
};

/**
 * Получает топ-теги для артиста.
 * @param {string} artistName - Имя артиста.
 * @returns {Promise<Array>} Массив тегов.
 */
const getArtistTags = async (artistName) => {
  const data = await fetchFromLastApi(METHOD.artistTags, { artist: artistName });
  return data?.toptags?.tag?.slice(0, 3).map(tag => tag.name) || [];
};

/**
 * Получает топ-теги для трека.
 * @param {string} artist - Имя артиста.
 * @param {string} track - Название трека.
 * @returns {Promise<Array>} Массив тегов.
 */
const getTrackTags = async (artist, track) => {
  const data = await fetchFromLastApi(METHOD.trackTags, { artist, track });
  return data?.toptags?.tag?.slice(0, 3).map(tag => tag.name) || [];
};

/**
 * Формирует ссылку на страницу артиста на Last.fm.
 * @param {string} artistName - Имя артиста.
 * @returns {string} URL страницы артиста.
 */
const getArtistUrl = (artistName) =>
  `https://www.last.fm/music/${encodeURIComponent(artistName)}`;

/**
 * Формирует ссылку на страницу трека на Last.fm.
 * @param {string} artistName - Имя артиста.
 * @param {string} trackName - Название трека.
 * @returns {string} URL страницы трека.
 */
const getTrackUrl = (artistName, trackName) =>
  `https://www.last.fm/music/${encodeURIComponent(artistName)}/_/${encodeURIComponent(trackName)}`;

/**
 * Формирует ссылку на страницу тега на Last.fm.
 * @param {string} tag - Название тега.
 * @returns {string} URL страницы тега.
 */
const getTagUrl = (tag) =>
  `https://www.last.fm/tag/${encodeURIComponent(tag)}`;

/**
 * Отображает карточки топ-артистов с тегами.
 * @param {Array} artists - Массив объектов артистов.
 * @returns {Promise<void>}
 */
const displayTopArtists = async (artists) => {
  const container = document.querySelector('.artists');
  if (!artists.length) {
    container.innerHTML = 'No popular artists.';
    return;
  }
  const tagsList = await Promise.all(artists.map(artist => getArtistTags(artist.name)));
  artists.forEach((artist, idx) => {
    const card = createElement('div', 'artist-card');

    card.addEventListener('click', () => {
      window.open(getArtistUrl(artist.name), '_blank');
    });

    const img = createElement('img');
    img.src = artist.image?.[2]?.['#text'] || 'photo.jpg';
    img.alt = artist.name;

    const name = createElement('div', 'artist-name', artist.name);

    const tagsArr = tagsList[idx];
    const tagsDiv = createElement('div', 'artist-tags');
    tagsArr.forEach(tag => {
      const tagEl = createElement('p', 'artist-tag', tag);
      tagEl.style.cursor = 'pointer';
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(getTagUrl(tag), '_blank');
      });
      tagsDiv.appendChild(tagEl);
    });
    card.append(img, name, tagsDiv);
    container.appendChild(card);
  });
};

/**
 * Отображает карточки топ-треков с тегами.
 * @param {Array} tracks - Массив объектов треков.
 * @returns {Promise<void>}
 */
const displayTopTracks = async (tracks) => {
  const container = document.querySelector('.tracks');
  if (!tracks.length) {
    container.innerHTML = 'No popular tracks.';
    return;
  }
  const tagsList = await Promise.all(
    tracks.map(track => getTrackTags(track.artist.name, track.name))
  );
  tracks.forEach((track, idx) => {
    const trackDiv = createElement('div', 'track');
    trackDiv.style.cursor = 'pointer';

    trackDiv.addEventListener('click', () => {
      window.open(getTrackUrl(track.artist.name, track.name), '_blank');
    });

    const img = createElement('img');
    img.src = track.image?.[2]?.['#text'] || 'track.jpeg';
    img.alt = track.name;

    const info = createElement('div', 'track-info');
    const title = createElement('div', 'track-title', track.name);

    const artist = createElement('div', 'track-artist', track.artist.name);
    artist.style.cursor = 'pointer';

    artist.addEventListener('click', (e) => {
      e.stopPropagation();
      window.open(getArtistUrl(track.artist.name), '_blank');
    });

    const tagsArr = tagsList[idx];
    const tagsDiv = createElement('div', 'song-tags');
    tagsArr.forEach(tag => {
      const tagEl = createElement('p', 'song-tag', tag);
      tagEl.style.cursor = 'pointer';
      tagEl.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(getTagUrl(tag), '_blank');
      });
      tagsDiv.appendChild(tagEl);
    });
    info.append(title, artist, tagsDiv);
    trackDiv.append(img, info);
    container.appendChild(trackDiv);
  });
};

/**
 * перебрасывает на search.html с поисковым запросом.
 * @returns {void}
 */
const search = () => {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const phrase = input.value.trim();
    if (phrase) {
      window.location.href = `search.html?q=${encodeURIComponent(phrase)}`;
    }
  });
};

/**
 * Инициализация приложения.
 * @returns {Promise<void>}
 */
document.addEventListener('DOMContentLoaded', async () => {
  search();
  const artists = await getTopArtists();
  const tracks = await getTopTracks();
  await displayTopArtists(artists);
  await displayTopTracks(tracks);
});