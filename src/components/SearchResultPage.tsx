import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import './common.css';
import './SearchResultPage.css';
import backArrow from '../assets/back_space.svg'
import firstCover from '../assets/1.jpg'; // 임시 앨범 커버 이미지

// API에서 받아오는 데이터 형식에 맞는 인터페이스
interface Song {
  trackId: string;
  songName: string;
}

const SearchResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  
  // API 검색 결과 상태
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  
  // 페이지 로드시 location.state에서 검색 결과 가져오기
  useEffect(() => {
    if (location.state && location.state.searchResults) {
      setSearchResults(location.state.searchResults);
    }
  }, [location.state]);

  // DB 연동을 위한 데이터 페치 함수
  const fetchSearchResults = async (query: string) => {
    try {
      // const response = await fetch(`/api/search?q=${query}`);
      // const data = await response.json();
      // setSearchResults(data);
    } catch (error) {
      console.error('검색 결과를 불러오는데 실패했습니다:', error);
    }
  };

  const handleClear = () => {
    setSearchInput('');
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      navigate(`/search/results?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <div className="mobile-container">
      <div className="search-result-container">
        <header className="search-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <img src={backArrow} alt="뒤로가기" />
          </button>
          <div className="search-input-container">
            <input 
              type="text" 
              placeholder="드랍할 음악 검색" 
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="search-clear-button" onClick={handleClear}>
              ✕
            </button>
          </div>
        </header>

        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((song) => (
              <div 
                key={song.trackId} 
                className="song-item"
                onClick={() => navigate(`/song/${song.trackId}`, { 
                  state: { song: song } 
                })}
              >
                <img src={firstCover} alt={`${song.songName} 앨범커버`} className="album-cover" />
                <div className="song-info">
                  <h3 className="song-title">{song.songName}</h3>
                  <p className="song-artist">아티스트 정보 없음</p>
                </div>
                <span className="song-duration">-:--</span>
              </div>
            ))
          ) : (
            <div className="no-results">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage; 