import "./App.css";
import { Route, Routes } from "react-router";
import SearchPage from "./components/SearchPage";
import MapPage from "./components/MapPage";
import MusicListenPage from "./components/MusicListenPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/listen" element={<MusicListenPage />} />
      </Routes>
    </>
  );
}

export default App;
