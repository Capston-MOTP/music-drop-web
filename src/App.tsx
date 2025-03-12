import "./App.css";
import { Route, Routes } from "react-router";
import SearchPage from "./components/SearchPage";
import MapPage from "./components/MapPage";
import MusicListenPage from "./components/MusicListenPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/listen" element={<MusicListenPage />} />
        </Routes>
      </QueryClientProvider>
    </>
  );
}

export default App;
