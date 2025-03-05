import { useState } from "react";
import { requestPermission } from "../utils/webviewBridge";

interface Position {
  lat: number;
  lng: number;
}

export const useGps = (mapRef: React.RefObject<kakao.maps.Map>) => {
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [myPosition, setMyPosition] = useState<Position | null>(null);

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
        }
      );
    });
  };

  const handleGpsClick = async () => {
    try {
      const permission = await requestPermission();
      if (permission.granted === true) {
        const position = await getCurrentPosition();
        setMyPosition(position);
        setIsGpsActive(true);

        // 지도 중심을 내 위치로 이동
        if (mapRef.current) {
          mapRef.current.setCenter(
            new kakao.maps.LatLng(position.lat, position.lng)
          );
        }
      }
    } catch (error) {
      console.error("Error getting location:", error);
      setIsGpsActive(false);
    }
  };

  return {
    isGpsActive,
    myPosition,
    handleGpsClick,
  };
};
