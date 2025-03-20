import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import "./common.css";
import "./SearchResultPage.css";
import backArrow from "../assets/back_space.svg";

// API에서 받아오는 데이터 형식에 맞는 인터페이스
interface Song {
  trackId: string;
  songName: string;
  artist: string;
  albumCover: string;
  duration: string;
}

const SearchResultPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lng");

  // API 검색 결과 상태
  const [searchResults, setSearchResults] = useState<Song[]>([]);

  // 페이지 로드시 location.state에서 검색 결과 가져오기
  useEffect(() => {
    if (location.state && location.state.searchResults) {
      setSearchResults(location.state.searchResults);
      console.log(
        "검색 결과 로드됨:",
        location.state.searchResults.length,
        "개"
      );
    } else if (searchInput) {
      // location.state에 검색 결과가 없으면 API 호출
      fetchSearchResults(searchInput);
    }
  }, [location.state, searchInput]);

  // API 호출 함수
  const fetchSearchResults = async (query: string) => {
    try {
      const response = await fetch(
        `https://52.79.113.104:8443/api/songs/search?title=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("API 요청 실패");
      }

      const data = await response.json();
      setSearchResults(data);
      console.log("API 검색 결과:", data.length, "개");
    } catch (error) {
      console.error("검색 결과를 불러오는데 실패했습니다:", error);
    }
  };

  const handleClear = () => {
    setSearchInput("");
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      fetchSearchResults(searchInput);
    }
  };

  // 노래 항목 클릭 처리 - 이제 모든 검색 결과와 현재 인덱스를 함께 전달
  const handleSongClick = (song: Song, index: number) => {
    console.log(`노래 클릭: ${song.songName}, 인덱스: ${index}`);
    navigate(`/song/${song.trackId}?lat=${lat}&lng=${lon}`, {
      state: {
        song: song, // 선택한 노래
        results: searchResults, // 전체 검색 결과 배열
        currentIndex: index, // 현재 선택한 노래의 인덱스
        totalResults: searchResults.length, // 전체 결과 수
      },
    });
  };

  return (
    <div className="mobile-container">
      <div className="search-result-container">
        <header className="search-header">
          <button className="back-button" onClick={() => navigate("/search")}>
            <img src={backArrow} alt="뒤로가기" />
          </button>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="드랍할 음악 검색"
              className="search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-clear-button" onClick={handleClear}>
              ✕
            </button>
          </div>
        </header>

        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map((song, index) => (
              <div
                key={song.trackId}
                className="song-item"
                onClick={() => handleSongClick(song, index)}
              >
                <img
                  src={song.albumCover}
                  alt={`${song.songName} 앨범커버`}
                  className="album-cover"
                />
                <div className="song-info">
                  <h3 className="song-title">{song.songName}</h3>
                  <p className="song-artist">{song.artist}</p>
                </div>
                <span className="song-duration">{song.duration}</span>
              </div>
            ))
          ) : (
            <div className="no-results">검색 결과가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage;
