import React, { useState, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import DeviceDetail from './pages/DeviceDetail';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/device/:id" element={<DeviceDetail />} />
            <Route path="/mapa" element={
              <Suspense fallback={<div className="p-4 text-center">Cargando mapa...</div>}>
                {React.createElement(React.lazy(() => import('./pages/CiudadJuarezMap')))}
              </Suspense>
            } />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;