import React from 'react';
import MapView from './components/MapView';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Semáforos</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <MapView />
      </main>
    </div>
  );
}

export default App;