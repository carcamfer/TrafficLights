import React from 'react';
import Home from './pages/home';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Home />
      </main>
      <Toaster />
    </div>
  );
}

export default App;