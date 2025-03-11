
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mapa" element={
            <Suspense fallback={<div>Cargando mapa...</div>}>
              {React.createElement(React.lazy(() => import('./pages/CiudadJuarezMap')))}
            </Suspense>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
