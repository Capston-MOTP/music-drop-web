import "./MusicListenPage.css";
import { YTMusic } from "../assets";
import Header from "./Header";
import { FaHeart } from "react-icons/fa";

const MusicListenPage = () => {
  return (
    <div className="mobile-container">
      <Header />
      <div className="content">
        <div className="album-cover2">
          <img
            src="https://image.bugsm.co.kr/album/images/500/3220/322075.jpg"
            alt="Album Cover"
          />
        </div>
        <div className="song-info">
          <div className="song-title">Can't Control Myself</div>
          <p className="artist">taeyeon</p>
        </div>
        <div className="memory">
          <div className="tags-container">
            <span className="tag">케이팝</span>
            <span className="tag">발라드</span>
          </div>
          <p className="description">
            친구랑 공원에서 같이 이어폰 끼고 노래 들었던 게 추억이네요!
          </p>
          <div className="timestamp">23.07.22</div>
        </div>
        <div className="actions">
          <button className="play-now">
            <img
              src={YTMusic}
              style={{
                width: 24,
                height: 24,
                marginRight: 10,
              }}
              alt="YouTube Music"
            />
            바로 듣기
          </button>
          <div className="likes">
            <FaHeart /> 143
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicListenPage;
