import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SearchPage from './components/SearchPage'
import SearchResultPage from './components/SearchResultPage'
import SongDetailPage from './components/SongDetailPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/results" element={<SearchResultPage />} />
        <Route path="/song/:id" element={<SongDetailPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
