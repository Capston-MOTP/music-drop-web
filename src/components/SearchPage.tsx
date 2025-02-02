import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './common.css';
import './SearchPage.css';
import backArrow from '../assets/back_space.svg'

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [recentSearches] = useState(['에스파', "랜덤음악"]);
  const [suggestions] = useState([
    '뉴진스',
    '아이유',
    '르세라핌',
    '에스파',
    '폴킴',
    '볼빨간사춘기',
    'BLACKPINK'
  ]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/search/results?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="mobile-container">
      <div className="search-container">
        <header className="search-header">
          <button className="back-button" onClick={handleBack}>
            <img src={backArrow} alt="뒤로가기" />
          </button>
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="드랍할 음악 검색" 
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-button" onClick={handleSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </header>

        <div className="recent-searches">
          <div className="tags-container">
            {recentSearches.map((term, index) => (
              <span key={index} className="search-tag">
                {term} <button className="remove-tag">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="search-question">
          <h2>지금 이 주변에<br />
            <span className="highlight">드랍하고 싶은 음악</span>은 무엇인가요?</h2>
        </div>

        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <button 
              key={index} 
              className={`suggestion-tag ${index === 0 || index === 2 ? 'active' : ''}`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 