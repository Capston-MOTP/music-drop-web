import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './common.css';
import './SearchResultPage.css';
import backArrow from '../assets/back_space.svg'

import firstCover from '../assets/1.jpg'; //임시 조치 , 나중에 api로 받아오면 바꿔줘야 함
import secondCover from '../assets/2.jpg'; //임시 조치 , 나중에 api로 받아오면 바꿔줘야 함
import thirdCover from '../assets/3.jpg'; //임시 조치 , 나중에 api로 받아오면 바꿔줘야 함
import fourthCover from '../assets/4.jpg'; //임시 조치 , 나중에 api로 받아오면 바꿔줘야 함
import fifthCover from '../assets/5.jpg'; //임시 조치 , 나중에 api로 받아오면 바꿔줘야 함
import sixthCover from '../assets/6.jpg'; //임시 조치 , 나중에 api로 받아오면 바꿔줘야 함

interface Song {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  duration: string;
}

const SearchResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<Song[]>([
    {
      id: '1',
      title: "봄여름가을겨울",
      artist: "빅뱅",
      albumCover: firstCover,
      duration: "3:37"
    },
    {
      id: '2',
      title: "내가 제일 잘 나가",
      artist: "2NE1",
      albumCover: secondCover,
      duration: "3:26"
    },
    {
      id: '3',
      title: "LOVE DIVE",
      artist: "IVE",
      albumCover: thirdCover,
      duration: "2:59"
    },
    {
      id: '4',
      title: "뱅뱅뱅",
      artist: "빅뱅",
      albumCover: fourthCover,
      duration: "3:41"
    },
    {
      id: '5',
      title: "FIRE",
      artist: "2NE1",
      albumCover: fifthCover,
      duration: "3:37"
    },
    {
      id: '6',
      title: "11:11",
      artist: "태연",
      albumCover: sixthCover,
      duration: "3:29"
    }
  ]);

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
          {searchResults.map((song) => (
            <div 
              key={song.id} 
              className="song-item"
              onClick={() => navigate(`/song/${song.id}`, { state: { song } })}
            >
              <img src={song.albumCover} alt={`${song.title} 앨범커버`} className="album-cover" />
              <div className="song-info">
                <h3 className="song-title">{song.title}</h3>
                <p className="song-artist">{song.artist}</p>
              </div>
              <span className="song-duration">{song.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage; 