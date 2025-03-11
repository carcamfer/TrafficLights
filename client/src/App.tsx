import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;