import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./common.css";
import "./SearchPage.css";
import backArrow from "../assets/back_space.svg";
import { AILoading } from "../assets";
import Lottie from "react-lottie";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../utils/api/client";

// API 함수들
const searchSongs = async (title: string) => {
  const response = await apiClient.get(
    `/api/songs/search?title=${encodeURIComponent(title)}`
  );
  return response.data;
};

const getRecommendations = async (lat: number, lon: number) => {
  const response = await apiClient.get(
    `/api/songs/recommend?lat=${lat}&lon=${lon}`
  );
  return response.data;
};

// AI 아이콘 SVG 컴포넌트
const AIIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="16"
    height="16"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);

const SearchPage = () => {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lng");

  const [showTooltip, setShowTooltip] = useState(false);

  const { data: recommendations, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["recommendations", lat, lon],
    queryFn: () => getRecommendations(Number(lat) || 33, Number(lon) || 124),
    select: (data) => {
      if (data && Array.isArray(data)) {
        const artists = data.map((item) => item.artist).filter(Boolean);
        return [...new Set(artists)];
      }
      return [
        "뉴진스",
        "아이유",
        "르세라핌",
        "에스파",
        "폴킴",
        "볼빨간사춘기",
        "BLACKPINK",
      ];
    },
  });

  const searchMutation = useMutation({
    mutationFn: searchSongs,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        navigate(
          `/search/results?q=${encodeURIComponent(
            searchInput
          )}&lat=${lat}&lng=${lon}`,
          {
            state: { searchResults: data },
          }
        );
        console.log(data);
      } else {
        alert("검색 결과가 없습니다.");
      }
    },
    onError: (error) => {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 오류가 발생했습니다.");
    },
  });

  const handleSearch = async () => {
    if (searchInput.trim()) {
      searchMutation.mutate(searchInput);
    }
  };

  // 추천 검색어 클릭 처리 함수 추가
  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    // 검색어를 설정한 후 바로 검색 실행
    setTimeout(() => handleSearch(), 10);
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleClear = () => {
    setSearchInput("");
  };

  // 툴팁 토글 함수
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  // 툴팁 외부 클릭 시 닫기
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      showTooltip &&
      e.target instanceof HTMLElement &&
      !e.target.closest(".ai-badge")
    ) {
      setShowTooltip(false);
    }
  };

  return (
    <div className="mobile-container" onClick={handleClickOutside}>
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
          {/*이 부분은 상의 해보고 결정*/}
          {/* <div className="tags-container">
            {recentSearches.map((term, index) => (
              <span key={index} className="search-tag">
                {term} <button className="remove-tag">×</button>
              </span>
            ))}
          </div> */}
        </div>

        <div className="search-question">
          <h2>
            지금 이 주변에
            <br />
            <span className="highlight">드랍하고 싶은 음악</span>은 무엇인가요?
          </h2>
        </div>

        <div className="suggestions-container">
          <div className="suggestions-header">
            <span className="ai-badge" onClick={toggleTooltip}>
              <AIIcon /> AI 추천
              {showTooltip && (
                <div className="ai-tooltip">
                  사용자의 위치를 기반으로 AI가 <br />
                  추천하는 음악입니다.
                </div>
              )}
            </span>
          </div>
          {isLoadingSuggestions ? (
            <div className="loading-suggestions">
              <Lottie
                options={{
                  loop: true,
                  animationData: AILoading,
                }}
              />
            </div>
          ) : (
            <div className="suggestions-grid">
              {recommendations?.map((suggestion, index) => (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
