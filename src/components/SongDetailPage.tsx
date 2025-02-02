import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './common.css';
import './SongDetailPage.css';
import backArrow from '../assets/back_space.svg';

interface Song {
  id: string;
  title: string;
  artist: string;
  albumCover: string;
  duration: string;
}

const SongDetailPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // 전달된 상태 가져오기
  const [message, setMessage] = useState('');
  
  // 전달된 앨범 정보 사용
  const songDetail: Song = state?.song || {
    id: '1',
    title: "Can't Control Myself",
    artist: "태연",
    albumCover: backArrow, // 기본값
    duration: "3:37"
  };

  const handleClearMessage = () => {
    setMessage('');
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
            <img src={songDetail.albumCover} alt={`${songDetail.title} 앨범커버`} />
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
              <button className="clear-button" onClick={handleClearMessage}>✕</button>
            )}
          </div>

          <button className="drop-button">드랍하기</button>
        </div>
      </div>
    </div>
  );
};

export default SongDetailPage; 