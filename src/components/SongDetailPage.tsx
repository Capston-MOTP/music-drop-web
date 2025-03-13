import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./common.css";
import "./SongDetailPage.css";
import backArrow from "../assets/back_space.svg";
import firstCover from "../assets/1.jpg"; // 임시 앨범 커버 이미지

// API 노래 데이터 인터페이스로 Song 재정의
// interface Song {
//   trackId: string;
//   songName: string;
// }

const SongDetailPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // 전달된 상태 가져오기
  const { id } = useParams<{ id: string }>(); // URL에서 id 파라미터 가져오기
  const [message, setMessage] = useState("");

  // 전달된 노래 정보 사용
  const songDetail = (() => {
    if (state?.song) {
      // API 검색 결과로 전달된 경우
      return {
        id: state.song.trackId,
        title: state.song.songName,
        artist: "아티스트 정보 없음", // API에서 제공하지 않음
        albumCover: firstCover, // 임시 이미지
        duration: "-:--", // API에서 제공하지 않음
      };
    } else {
      // 상태가 없는 경우 기본값
      return {
        id: id || "",
        title: "알 수 없는 노래",
        artist: "알 수 없는 아티스트",
        albumCover: firstCover,
        duration: "-:--",
      };
    }
  })();

  const handleClearMessage = () => {
    setMessage("");
  };

  return (
    <div className="mobile-container">
      <div className="song-detail-container">
        <header className="detail-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <img src={backArrow} alt="뒤로가기" />
          </button>
          <span className="header-title">MOTP</span>
        </header>

        <div className="song-detail-content">
          <div className="album-cover-large">
            <img
              src={songDetail.albumCover}
              alt={`${songDetail.title} 앨범커버`}
            />
          </div>

          <div className="song-info-detail">
            <h2 className="song-title">{songDetail.title}</h2>
            <p className="song-artist">{songDetail.artist}</p>
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
