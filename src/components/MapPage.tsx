import { CustomOverlayMap, Map } from "react-kakao-maps-sdk";

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

const MapPage = () => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Map
        center={{ lat: 33.5563, lng: 126.79581 }}
        style={{ width: "100%", height: "100%" }}
        level={4}
        minLevel={10}
        maxLevel={3}
      >
        {MOCK_DATA.map((data) => (
          //  동그랗고 아래에 꼭지점이 있는 형태의 마커
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
                borderTop: "6px solid #ffffff", // Change color as needed
                position: "absolute",
                left: "50%",
                bottom: "-4px", // Adjust position as needed
                transform: "translateX(-50%)",
                zIndex: 99,
              }}
            />
          </CustomOverlayMap>
        ))}
      </Map>
    </div>
  );
};

export default MapPage;
