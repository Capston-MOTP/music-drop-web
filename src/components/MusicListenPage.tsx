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

// 마커 데이터 타입 정의
interface MarkerData {
  data: {
    id: string;
    comment: string;
    dropDate: string;
    releaseDate: string;
    likes: number;
    [key: string]: unknown; // 다른 필드들도 있을 수 있으므로 인덱스 시그니처 추가
  };
}

const MusicListenPage = () => {
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get("trackId");
  const markerId = searchParams.get("markerId");
  const { data } = useQuery({
    queryKey: ["listen", trackId, markerId],
    queryFn: () => apiClient.get(`/api/songs/${trackId}`),
  });
  const { data: markerData } = useQuery<MarkerData>({
    queryKey: ["marker", markerId],
    queryFn: () => apiClient.get(`/api/markers/${markerId}/detail`),
  });

  const queryClient = useQueryClient();

  const { mutate: likeMarker } = useMutation({
    mutationFn: () => apiClient.patch(`/api/markers/${markerId}/likes`),
    onMutate: async () => {
      // 이전 쿼리 데이터를 캐시에서 취소
      await queryClient.cancelQueries({ queryKey: ["marker", markerId] });

      // 이전 데이터를 저장
      const previousMarkerData = queryClient.getQueryData<MarkerData>([
        "marker",
        markerId,
      ]);

      // 낙관적으로 데이터 업데이트
      queryClient.setQueryData<MarkerData>(["marker", markerId], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            likes: (old.data.likes || 0) + 1,
          },
        };
      });

      // 이전 데이터를 반환하여 롤백에 사용
      return { previousMarkerData };
    },
    onError: (_err, _variables, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousMarkerData) {
        queryClient.setQueryData(
          ["marker", markerId],
          context.previousMarkerData
        );
      }
    },
    onSettled: () => {
      // 성공 또는 실패 후 쿼리를 다시 가져옴
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
