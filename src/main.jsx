// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Admin from './components/Admin'
import PrintRoadmap from './components/PrintRoadmap' // 👈 新しく追加

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* 生徒用メインページ */}
        <Route path="/" element={<App />} />
        
        {/* 管理者ページ */}
        <Route path="/admin" element={<Admin />} />
        
        {/* 印刷用スタンプラリーページ (:gameId は動的に変わる) */}
        <Route path="/print/:gameId" element={<PrintRoadmap />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)