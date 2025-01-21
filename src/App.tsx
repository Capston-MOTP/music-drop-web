import "./App.css";
import { Route, Routes } from "react-router";
import SearchPage from "./components/SearchPage";
import MapPage from "./components/MapPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}

export default App;
