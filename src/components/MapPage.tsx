import { CustomOverlayMap, Map } from "react-kakao-maps-sdk";
import SvgIconLocationActive40 from "../assets/icons/locationActive";
import SvgIconLocation40 from "../assets/icons/IocationInactive";
import { useEffect, useRef, useState } from "react";

import { requestPermission } from "../utils/webviewBridge";

const MOCK_DATA = [
  {
    lat: 33.55635,
    lng: 126.795841,
    id: 1,
    img: "https://picsum.photos/200/300",
  },
  {
    lat: 33.53635,
    lng: 126.795841,
    id: 2,
    img: "https://picsum.photos/200/300",
  },
  {
    lat: 33.54635,
    lng: 126.795841,
    id: 3,
    img: "https://picsum.photos/200/300",
  },
  {
    lat: 33.57635,
    lng: 126.795841,
    id: 4,
    img: "https://picsum.photos/200/300",
  },
  {
    lat: 33.59635,
    lng: 126.795841,
    id: 5,
    img: "https://picsum.photos/200/300",
  },
  {
    lat: 33.58635,
    lng: 126.795841,
    id: 6,
    img: "https://picsum.photos/200/300",
  },
  {
    lat: 33.65635,
    lng: 126.795841,
    id: 7,
    img: "https://picsum.photos/200/300",
  },
];

interface Position {
  lat: number;
  lng: number;
}

const MapPage = () => {
  const mapRef = useRef<kakao.maps.Map>(null);
  const [center, setCenter] = useState<Position>({
    lat: 33.5563,
    lng: 126.79581,
  });

  const handleCenterChange = (center: Position) => {
    setCenter(center);
  };
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [myPosition, setMyPosition] = useState<Position | null>(null);
  const isGpsMarkerClicked = useRef<boolean>(false);
  const watchId = useRef<number | null>(null);

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
          handleCenterChange(position);
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

  // 지도 이동 시 GPS 비활성화
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const handleIdle = () => {
      setTimeout(() => {
        if (!isGpsMarkerClicked.current) {
          setIsGpsActive(false);
          setMyPosition(null);
        }
      }, 20);
    };

    kakao.maps.event.addListener(map, "idle", handleIdle);

    return () => {
      kakao.maps.event.removeListener(map, "idle", handleIdle);
    };
  }, [mapRef.current]);

  // 컴포넌트 언마운트 시 위치 추적 중지
  useEffect(() => {
    return () => {
      stopWatchingPosition();
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Map
        center={center}
        style={{ width: "100%", height: "100%" }}
        level={4}
        minLevel={10}
        maxLevel={3}
      >
        {MOCK_DATA.map((data) => (
          <CustomOverlayMap
            position={{ lat: data.lat, lng: data.lng }}
            key={data.id}
          >
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "100%",
                overflow: "hidden",
                border: "2px solid #ffffff",
                zIndex: 100,
              }}
            >
              <img src={data.img} width="24px" height="24px" alt="" />
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid #ffffff",
                position: "absolute",
                left: "50%",
                bottom: "-4px",
                transform: "translateX(-50%)",
                zIndex: 99,
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
                    width: "30px",
                    height: "30px",
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
      <div>
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
