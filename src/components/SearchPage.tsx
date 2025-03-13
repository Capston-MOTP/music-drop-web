import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./common.css";
import "./SearchPage.css";
import backArrow from "../assets/back_space.svg";

const SearchPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const [recentSearches] = useState(["에스파", "랜덤음악"]);
  const [suggestions] = useState([
    "뉴진스",
    "아이유",
    "르세라핌",
    "에스파",
    "폴킴",
    "볼빨간사춘기",
    "BLACKPINK",
  ]);

  const handleSearch = async () => {
    if (searchInput.trim()) {
      try {
        // API 호출
        const response = await fetch(
          `https://52.79.113.104:8443/api/songs/search?title=${encodeURIComponent(
            searchInput
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `API 요청 실패: ${response.status} ${response.statusText}`,
            errorText
          );
          throw new Error(
            `API 요청 실패: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // 검색 결과가 있으면 결과 페이지로 이동
        if (data && data.length > 0) {
          navigate(`/search/results?q=${encodeURIComponent(searchInput)}`, {
            state: { searchResults: data },
          });
          console.log(data);
        } else {
          alert("검색 결과가 없습니다.");
        }
      } catch (error) {
        console.error("검색 중 오류 발생:", error);
        alert("검색 중 오류가 발생했습니다.");
      }
    }
  };

  // 추천 검색어 클릭 처리 함수 추가
  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    // 검색어를 설정한 후 바로 검색 실행
    setTimeout(() => handleSearch(), 10);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleClear = () => {
    setSearchInput("");
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchInput && (
              <button className="clear-button" onClick={handleClear}>
                ✕
              </button>
            )}
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
          <h2>
            지금 이 주변에
            <br />
            <span className="highlight">드랍하고 싶은 음악</span>은 무엇인가요?
          </h2>
        </div>

        <div className="suggestions-grid">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className={`suggestion-tag ${
                index === 0 || index === 2 ? "active" : ""
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
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
