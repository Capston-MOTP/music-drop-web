import "./MusicListenPage.css";
import { YTMusic } from "../assets";
import Header from "./Header";
import { FaHeart } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import apiClient from "../utils/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(date.getDate()).padStart(2, "0")}`;
};

const MusicListenPage = () => {
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get("trackId");
  const markerId = searchParams.get("markerId");
  const { data } = useQuery({
    queryKey: ["listen", trackId, markerId],
    queryFn: () => apiClient.get(`/api/songs/${trackId}`),
  });
  const { data: markerData } = useQuery({
    queryKey: ["marker", markerId],
    queryFn: () => apiClient.get(`/api/markers/${markerId}/detail`),
  });

  const queryClient = useQueryClient();

  const { mutate: likeMarker } = useMutation({
    mutationFn: () => apiClient.patch(`/api/markers/${markerId}/likes`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marker", markerId] });
    },
  });

  return (
    <div className="mobile-container">
      <Header />
      <div className="content">
        <div className="album-cover2">
          <img src={data?.data.albumCoverUrl} alt="Album Cover" />
        </div>
        <div className="song-info">
          <div className="song-title">{data?.data.songName}</div>
          <p className="artist">{data?.data.artistName}</p>
        </div>

        <div className="memory">
          <div className="tags-container">
            <span className="tag">{markerData?.data.releaseDate}</span>
            <span className="tag">{data?.data.duration}</span>
          </div>
          <p className="description">{markerData?.data.comment}</p>
          <div className="timestamp">
            {markerData?.data.dropDate
              ? formatDate(markerData.data.dropDate)
              : ""}
          </div>
        </div>

        <div className="actions">
          <button
            className="play-now"
            onClick={() => {
              window.open(data?.data.youtubeLink, "_blank");
            }}
          >
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
          <div className="likes" onClick={() => likeMarker()}>
            <FaHeart /> {markerData?.data.likes}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicListenPage;
