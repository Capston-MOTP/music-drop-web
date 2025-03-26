import { CustomOverlayMap, Map, useKakaoLoader } from "react-kakao-maps-sdk";
import SvgIconLocationActive40 from "../assets/icons/locationActive";
import SvgIconLocation40 from "../assets/icons/IocationInactive";
import { useEffect, useRef, useState } from "react";

import { requestPermission } from "../utils/webviewBridge";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../utils/api/client";
import { useNavigate } from "react-router-dom";

interface Position {
  lat: number;
  lng: number;
}

const MapPage = () => {
  useKakaoLoader({
    appkey: "1439a0da769c13dde3cf12b07193dbdc",
    libraries: ["services"],
  });
  const mapRef = useRef<kakao.maps.Map>(null);
  const [center] = useState<Position>({
    lat: 37.3726,
    lng: 126.6352,
  });
  const [selectedMarker, setSelectedMarker] = useState<{
    id: number;
    latitude: number;
    longitude: number;
    songName: string;
    trackId: string;
    comment: string;
    albumCoverUrl: string;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedMarker || selectedMarker.albumCoverUrl) return;
    const fetchTrack = async () => {
      try {
        const data = await apiClient.get(
          `/api/songs/${selectedMarker.trackId}`
        );
        setSelectedMarker({
          ...selectedMarker,
          albumCoverUrl: data.data.albumCoverUrl,
        });
      } catch (error) {
        console.error(error);
      }
    };
    fetchTrack();
  }, [selectedMarker]);

  const [isGpsActive, setIsGpsActive] = useState(false);
  const [myPosition, setMyPosition] = useState<Position | null>(null);
  const isGpsMarkerClicked = useRef<boolean>(false);
  const watchId = useRef<number | null>(null);
  const [currentAddr, setCurrentAddr] = useState<string>("");

  const getCurrentPosition = () => {
    return new Promise<Position>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve(pos);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
        }
      );
    });
  };

  const startWatchingPosition = () => {
    if (!navigator.geolocation) return;

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setMyPosition(pos);

        if (mapRef.current && isGpsActive) {
          isGpsMarkerClicked.current = true;
          mapRef.current.setCenter(new kakao.maps.LatLng(pos.lat, pos.lng));

          setTimeout(() => {
            isGpsMarkerClicked.current = false;
          }, 300);
        }
      },
      (error) => {
        console.error("Error watching position:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
      }
    );
  };

  const stopWatchingPosition = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const handleGpsClick = async () => {
    try {
      // GPS가 활성화되어 있을 때는 GPS 종료
      if (isGpsActive) {
        setIsGpsActive(false);
        stopWatchingPosition();
        setMyPosition(null);
        return;
      }

      const permission = await requestPermission();
      if (permission.granted === true) {
        const position = await getCurrentPosition();
        setMyPosition(position);
        setIsGpsActive(true);

        if (mapRef.current) {
          isGpsMarkerClicked.current = true;
          mapRef.current.setCenter(
            new kakao.maps.LatLng(position.lat, position.lng)
          );

          setTimeout(() => {
            isGpsMarkerClicked.current = false;
          }, 300);
        }

        startWatchingPosition();
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setIsGpsActive(false);
    }
  };

  const searchAddrFromCoords = (coords: Position) => {
    if (!kakao || !kakao.maps) return;

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.coord2RegionCode(coords.lng, coords.lat, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        // 법정동 마지막 문자열에서 '동' 제외
        const address = result[0].address_name;
        setCurrentAddr(address);
      }
    });
  };

  // 컴포넌트 언마운트 시 위치 추적 중지
  useEffect(() => {
    return () => {
      stopWatchingPosition();
    };
  }, []);

  const { data: markerList } = useQuery({
    queryKey: ["marker-list"],
    queryFn: () => {
      return apiClient.get<
        {
          comment: string;
          dropDate: string;
          id: number;
          latitude: number;
          likes: number;
          longitude: number;
          songName: string;
          trackId: string;
        }[]
      >("/api/markers");
    },
  });

  // const { data: geoInfo } = useQuery({
  //   queryKey: ["geo-info"],
  //   queryFn: () => {
  //     return apiClient.get("/api/geo-info", {
  //       params: {
  //         lat: 37.3726,
  //         lng: 126.6352,
  //       },
  //     });
  //   },
  // });

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Map
        center={{
          lat: center.lat,
          lng: center.lng,
        }}
        style={{ width: "100%", height: "100%" }}
        isPanto={true}
        level={4}
        maxLevel={2}
        ref={mapRef}
        onClick={() => setSelectedMarker(null)}
        onIdle={() => {
          const handleIdle = () => {
            const center = mapRef.current?.getCenter();
            const coords = {
              lat: center?.getLat(),
              lng: center?.getLng(),
            };

            searchAddrFromCoords(coords as Position);
          };
          handleIdle();
        }}
      >
        {markerList &&
          markerList.data.map((data) => (
            <CustomOverlayMap
              position={{ lat: data.latitude, lng: data.longitude }}
              key={data.id}
            >
              <div
                style={{
                  width: selectedMarker?.id === data.id ? "32px" : "24px",
                  height: selectedMarker?.id === data.id ? "32px" : "24px",
                  borderRadius: "100%",
                  overflow: "hidden",
                  border: `2px solid ${
                    selectedMarker?.id === data.id ? "#191919" : "#ffffff"
                  }`,
                  zIndex: selectedMarker?.id === data.id ? 101 : 100,
                  background:
                    selectedMarker?.id === data.id
                      ? "linear-gradient(180deg, #ffffff 0%, #abfbff 100%)"
                      : "#abfbff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${
                    selectedMarker?.id === data.id ? 1.1 : 1
                  })`,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  boxShadow:
                    selectedMarker?.id === data.id
                      ? "0 2px 8px rgba(0,0,0,0.1)"
                      : "none",
                }}
                onClick={() => {
                  setSelectedMarker({
                    id: data.id,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    songName: data.songName,
                    trackId: data.trackId,
                    comment: data.comment,
                    albumCoverUrl: "",
                  });
                }}
              >
                <svg
                  width={selectedMarker?.id === data.id ? "16" : "12"}
                  height={selectedMarker?.id === data.id ? "16" : "12"}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 18.85C8 20.59 9.28 22 10.85 22C12.42 22 13.7 20.59 13.7 18.85C13.7 17.11 12.42 15.7 10.85 15.7C9.28 15.7 8 17.11 8 18.85Z"
                    fill="#2b2b2b"
                  />
                  <path
                    d="M13.7 18.85V4C13.7 3.45 14.15 3 14.7 3C14.92 3 15.13 3.08 15.3 3.22L19.7 6.9"
                    stroke="#2b2b2b"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: `6px solid ${
                    selectedMarker?.id === data.id ? "#191919" : "#ffffff"
                  }`,
                  position: "absolute",
                  left: "50%",
                  bottom: selectedMarker?.id === data.id ? "-6px" : "-4px",
                  transform: "translateX(-50%)",
                  zIndex: selectedMarker?.id === data.id ? 101 : 99,
                }}
              />
            </CustomOverlayMap>
          ))}
        {myPosition && (
          <CustomOverlayMap position={myPosition}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "40px",
                    height: "40px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    backgroundColor: "#22CA72",
                    opacity: 0.2,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "#22CA72",
                    border: "2px solid white",
                  }}
                />
              </div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>
      {/* Location display at top */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          borderRadius: "20px",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 3,
          maxWidth: "80%",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
            fill="#ffffff"
          />
        </svg>
        <span
          style={{
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {currentAddr || "위치 정보 없음"}
        </span>
      </div>
      {/* Top gradient overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* Bottom gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "240px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <div>
        <div>
          {selectedMarker ? (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translate(-50%)",
                bottom: "20px",
                width: "180px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 100,
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#2b2b2b",
                    position: "relative",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    padding: "4px 8px",
                    backgroundColor: "#abfbff",
                    borderRadius: "12px",
                    overflow: "visible",
                  }}
                >
                  {selectedMarker.comment}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-6px",
                      width: "12px",
                      height: "12px",
                      left: "50%",
                      transform: "translate(-50%, 0) rotate(45deg)",
                      backgroundColor: "#abfbff",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "2px solid rgba(0, 0, 0, 0.15)",
                }}
              >
                <img
                  onClick={() =>
                    navigate("/listen?trackId=" + selectedMarker.trackId)
                  }
                  src={selectedMarker.albumCoverUrl || "placeholder-image-url"}
                  alt={selectedMarker.songName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "white",
                    padding: "0 4px",
                  }}
                >
                  {selectedMarker.songName}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: "24px",
                zIndex: 100,
              }}
            >
              <button
                style={{
                  backgroundColor: isGpsActive ? "#abfbff" : "#e0e0e0",
                  borderRadius: "100px",
                  padding: "12px 24px",
                  border: "none",
                  color: isGpsActive ? "#2b2b2b" : "#999999",
                  fontSize: "15px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: isGpsActive ? "pointer" : "default",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  opacity: isGpsActive ? 1 : 0.7,
                  transition: "all 0.2s ease",
                }}
                onClick={() => {
                  navigate(
                    "/search?lat=" +
                      (myPosition?.lat || 37.3726) +
                      "&lng=" +
                      (myPosition?.lng || 126.6352)
                  );
                }}
                // disabled={!isGpsActive}
              >
                뮤직 드랍하기
              </button>
            </div>
          )}
        </div>
        <button
          style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            zIndex: 100,
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            border: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "transform 0.2s ease",
            padding: 0,
          }}
          onClick={handleGpsClick}
        >
          {isGpsActive ? (
            <SvgIconLocationActive40 width={46} height={46} />
          ) : (
            <SvgIconLocation40 width={46} height={46} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MapPage;
