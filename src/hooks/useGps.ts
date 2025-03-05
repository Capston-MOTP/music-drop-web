import { useEffect, useRef, useState } from "react";
import { requestPermission } from "../utils/webviewBridge";

interface Position {
  lat: number;
  lng: number;
}

export const useGps = (mapRef: React.RefObject<kakao.maps.Map>) => {
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

  return {
    isGpsActive,
    myPosition,
    handleGpsClick,
  };
};
