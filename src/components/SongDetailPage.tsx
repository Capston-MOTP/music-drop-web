import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./common.css";
import "./SongDetailPage.css";

// API 노래 데이터 인터페이스로 Song 재정의
interface Song {
  trackId: string;
  songName: string;
  artist: string;
  albumCover: string;
  duration: string;
}

const SongDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setTotalSongs] = useState(0);
  const [songList, setSongList] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 스와이프 관련 상태
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  // 스와이프 속도 관련 상태 추가
  const [swipeTimes, setSwipeTimes] = useState<
    { time: number; position: number }[]
  >([]);
  const [, setSwipeVelocity] = useState(0);

  // 최소 스와이프 거리와 속도 설정
  const minSwipeDistance = 50; // 더 짧게 설정하여 민감도 향상
  const minSwipeVelocity = 0.3; // 최소 스와이프 속도 (px/ms)
  const maxSwipeTime = 300; // 속도 계산 시 고려할 최대 시간 (ms)

  // 컨텐츠 컨테이너 참조
  const contentRef = useRef<HTMLDivElement>(null);
  const screenWidth = useRef(window.innerWidth);

  // 화면 너비 업데이트
  useEffect(() => {
    const handleResize = () => {
      screenWidth.current = window.innerWidth;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 페이지 로드 시 최상단으로 스크롤 및 상태 초기화
  useEffect(() => {
    window.scrollTo(0, 0);

    // 스와이프 상태 초기화
    setTouchStart(null);
    setTouchEnd(null);
    setSwiping(false);
    setSwipeDirection(null);
    setSwipeOffset(0);
    setSwipeTimes([]);
    setSwipeVelocity(0);

    // 상태 정보 설정
    if (location.state && typeof location.state === "object") {
      if ("currentIndex" in location.state) {
        setCurrentIndex(location.state.currentIndex);
      }

      if ("totalResults" in location.state) {
        setTotalSongs(location.state.totalResults);
      }

      if (
        "results" in location.state &&
        Array.isArray(location.state.results)
      ) {
        setSongList(location.state.results);
      }

      if ("searchQuery" in location.state) {
        setSearchQuery(location.state.searchQuery);
      }
    }
  }, [location]);

  // 이전/다음 노래 이동 가능 여부 확인
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext =
    songList.length > 0 && currentIndex < songList.length - 1;

  // 터치 시작 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.targetTouches[0].clientX;
    setTouchStart(x);
    setTouchEnd(x); // 초기값 설정
    setSwiping(true);

    // 시간 기록 시작
    const now = Date.now();
    setSwipeTimes([{ time: now, position: x }]);

    // 강제 스타일 계산하여 애니메이션 즉시 시작
    if (contentRef.current) {
      contentRef.current.classList.add("swiping");
    }
  };

  // 터치 이동 처리 - 비례 이동 구현
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping || touchStart === null) return;

    const currentX = e.targetTouches[0].clientX;
    const diff = touchStart - currentX; // 양수: 왼쪽 스와이프, 음수: 오른쪽 스와이프
    setTouchEnd(currentX);

    // 현재 시간과 위치 기록 (최근 300ms 이내 기록만 유지)
    const now = Date.now();
    setSwipeTimes((prev) => {
      const updated = [...prev, { time: now, position: currentX }].filter(
        (item) => now - item.time <= maxSwipeTime
      );
      return updated;
    });

    // 스와이프 방향 결정
    const isLeftSwipe = diff > 5;
    const isRightSwipe = diff < -5;

    // 스와이프 진행 조건 체크
    const canLeftSwipe = isLeftSwipe && canNavigateNext;
    const canRightSwipe = isRightSwipe && canNavigatePrev;

    if (canLeftSwipe || canRightSwipe) {
      // 비율 계산 (화면 너비의 최대 60%까지 이동)
      const maxMoveRatio = 0.6;
      const moveRatio = Math.min(
        Math.abs(diff) / screenWidth.current,
        maxMoveRatio
      );

      // 저항 추가 (멀리 이동할수록 이동 비율 감소)
      const resistanceRatio = 1 - moveRatio * 0.6;
      const finalDiff = diff * resistanceRatio;

      // 방향 결정 및 오프셋 설정 (반대 방향으로 이동)
      if (canLeftSwipe) {
        setSwipeDirection("left");
        setSwipeOffset(-finalDiff); // 왼쪽 스와이프 → 오른쪽으로 이동
      } else {
        setSwipeDirection("right");
        setSwipeOffset(-finalDiff); // 오른쪽 스와이프 → 왼쪽으로 이동
      }
    } else {
      setSwipeDirection(null);

      // 이동 가능한 방향이 없을 때는 제한된 움직임 (25% 정도만 허용)
      const limitedOffset = -diff * 0.25;
      setSwipeOffset(limitedOffset);
    }
  };

  // 터치 종료 처리 - 속도 기반 관성 효과 추가
  const handleTouchEnd = () => {
    if (!swiping || touchStart === null || touchEnd === null) {
      resetSwipeState();
      return;
    }

    if (contentRef.current) {
      contentRef.current.classList.remove("swiping");
    }

    // 스와이프 속도 계산
    const now = Date.now();
    const recentSwipes = swipeTimes.filter((item) => now - item.time <= 100);

    let velocity = 0;
    if (recentSwipes.length > 1) {
      const first = recentSwipes[0];
      const last = recentSwipes[recentSwipes.length - 1];
      const timeDiff = last.time - first.time;
      const distanceDiff = last.position - first.position;

      // 속도 계산 (px/ms)
      if (timeDiff > 0) {
        velocity = distanceDiff / timeDiff;
      }
    }

    setSwipeVelocity(velocity);

    // 이동 거리 및 방향 확인
    const distance = touchStart - touchEnd;
    const absDistance = Math.abs(distance);
    const absVelocity = Math.abs(velocity);

    // 최종 의사 결정 (거리 또는 속도가 충분한 경우)
    const isSwipeGesture =
      absDistance > minSwipeDistance || absVelocity > minSwipeVelocity;

    if (isSwipeGesture) {
      const isLeftSwipe = distance > 0 || (distance === 0 && velocity < 0);
      const isRightSwipe = distance < 0 || (distance === 0 && velocity > 0);

      // 속도에 비례한 애니메이션 시간 설정 (빠를수록 짧게)
      const baseTime = 300; // 기본 시간 (ms)
      const velocityFactor = Math.min(Math.abs(velocity) * 500, baseTime * 0.7);
      const finalTime = Math.max(baseTime - velocityFactor, 100); // 최소 100ms는 보장

      if (isLeftSwipe && canNavigateNext) {
        // 왼쪽 스와이프 완료: 애니메이션으로 화면 밖으로 이동
        const finalOffset = -screenWidth.current * 1.2;
        animateToPosition(finalOffset, finalTime);
        setTimeout(() => handleNextSong(), finalTime);
      } else if (isRightSwipe && canNavigatePrev) {
        // 오른쪽 스와이프 완료: 애니메이션으로 화면 밖으로 이동
        const finalOffset = screenWidth.current * 1.2;
        animateToPosition(finalOffset, finalTime);
        setTimeout(() => handlePrevSong(), finalTime);
      } else {
        // 조건 미충족: 원래 위치로 복귀
        snapBack();
      }
    } else {
      // 스와이프 제스처 기준 미달: 원래 위치로 복귀
      snapBack();
    }

    setSwiping(false);
  };

  // 특정 위치로 애니메이션
  const animateToPosition = (
    targetPosition: number,
    duration: number = 300
  ) => {
    if (!contentRef.current) return;

    contentRef.current.style.transition = `transform ${duration}ms cubic-bezier(0.19, 1, 0.22, 1)`;
    contentRef.current.style.transform = `translateX(${targetPosition}px)`;
  };

  // 원래 위치로 복귀
  const snapBack = () => {
    animateToPosition(0);
    setTimeout(resetSwipeState, 300);
  };

  // 스와이프 상태 초기화
  const resetSwipeState = () => {
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeDirection(null);
    setSwipeOffset(0);
    setSwipeTimes([]);
    setSwipeVelocity(0);
    setSwiping(false);
  };

  // 이전 노래로 이동
  const handlePrevSong = () => {
    if (canNavigatePrev && songList.length > 0) {
      const prevIndex = currentIndex - 1;
      const prevSong = songList[prevIndex];

      navigate(`/song/${prevSong.trackId}`, {
        state: {
          song: prevSong,
          results: songList,
          currentIndex: prevIndex,
          totalResults: songList.length,
          searchQuery,
        },
        replace: true,
      });
    } else {
      console.log("이전 노래가 없습니다.");
    }
  };

  // 다음 노래로 이동
  const handleNextSong = () => {
    if (canNavigateNext && songList.length > 0) {
      const nextIndex = currentIndex + 1;
      const nextSong = songList[nextIndex];

      navigate(`/song/${nextSong.trackId}`, {
        state: {
          song: nextSong,
          results: songList,
          currentIndex: nextIndex,
          totalResults: songList.length,
          searchQuery,
        },
        replace: true,
      });
    } else {
      console.log("다음 노래가 없습니다.");
    }
  };

  // 뒤로가기 버튼 처리
  const handleBack = () => {
    if (songList.length > 0) {
      navigate("/search/results", {
        state: {
          searchResults: songList,
          searchQuery: searchQuery,
        },
      });
    } else {
      navigate(-1);
    }
  };

  // 메시지 지우기
  const handleClearMessage = () => {
    setMessage("");
  };

  // 전달된 노래 정보 사용
  const songDetail = (() => {
    if (state?.song) {
      return {
        id: state.song.trackId,
        title: state.song.songName,
        artist: state.song.artist,
        albumCover: state.song.albumCover,
        duration: state.song.duration,
      };
    } else {
      return {
        id: id || "",
        title: "알 수 없는 노래",
        artist: "알 수 없는 아티스트",
        albumCover: "https://via.placeholder.com/300",
        duration: "0:00",
      };
    }
  })();

  // 인라인 스타일로 변환 (직접적인 조작을 위해)
  const contentStyle = swiping
    ? { transform: `translateX(${swipeOffset}px)`, transition: "none" }
    : { transform: `translateX(${swipeOffset}px)` };

  // 스와이프 힌트 표시 여부
  const showLeftSwipeHint = canNavigatePrev;
  const showRightSwipeHint = canNavigateNext;

  return (
    <div className="song-detail-container">
      <div
        className={`song-detail-content ${swiping ? "swiping" : ""}`}
        ref={contentRef}
        style={contentStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="back-button-container">
          <button
            className="back-button"
            onClick={handleBack}
            aria-label="뒤로 가기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <div className="motp-logo-container">
          <div className="motp-logo">MOTP</div>
        </div>

        <div className="song-detail">
          {/* 앨범 커버와 스와이프 힌트 */}
          <div className="album-section">
            {showLeftSwipeHint && (
              <div className="swipe-hint swipe-left-hint">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </div>
            )}

            <div className="album-cover-container">
              <img
                src={songDetail.albumCover}
                alt={`${songDetail.title} 앨범 커버`}
                className="album-cover-large"
              />
            </div>

            {showRightSwipeHint && (
              <div className="swipe-hint swipe-right-hint">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            )}
          </div>

          {/* 노래 정보 영역 - 버튼 제거됨 */}
          <div className="song-info-section">
            {/* 노래 정보 */}
            <div className="song-info-detail">
              <h2 className="song-title">{songDetail.title}</h2>
              <p className="song-artist">{songDetail.artist}</p>
            </div>
          </div>

          <div className="message-input-container">
            <textarea
              className="message-input"
              placeholder="이 곳에 음악과 함께 남기고 싶은 메시지를 적어주세요."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={100}
            />
            <span className="character-count">{message.length}/100</span>
            {message && (
              <button className="clear-button" onClick={handleClearMessage}>
                ✕
              </button>
            )}
          </div>

          <button className="drop-button">드랍하기</button>
        </div>
      </div>
    </div>
  );
};

export default SongDetailPage;
