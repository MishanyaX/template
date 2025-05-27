import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('q') || '');
  }, [location.search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="head-logo" onClick={() => navigate('/')}>last.fm</div>
      <div className="search-form">
        <form id="search-form" onSubmit={handleSubmit}>
          <input
            type="search"
            id="search-input"
            name="q"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">
            <i className="icon-search"><img src="1.svg" width={18} height={18} alt="Search" /></i>
          </button>
        </form>
      </div>
      <nav className="main-nav">
        <ul>
          <li><a href="#">Live</a></li>
          <li><a href="#" onClick={e => {e.preventDefault(); navigate('/');}}>Music</a></li>
          <li><a href="#">Charts</a></li>
          <li><a href="#">Events</a></li>
        </ul>
      </nav>
    </header>
  );
}