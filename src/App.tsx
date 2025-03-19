import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchPage from "./components/SearchPage";
import MapPage from "./components/MapPage";
import MusicListenPage from "./components/MusicListenPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SearchResultPage from "./components/SearchResultPage";
import SongDetailPage from "./components/SongDetailPage";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listen" element={<MusicListenPage />} />
          <Route path="/search/results" element={<SearchResultPage />} />
          <Route path="/song/:id" element={<SongDetailPage />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
