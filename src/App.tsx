import "./App.css";
import { Route, Routes } from "react-router";
import SearchPage from "./components/SearchPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}

export default App;
