
import React from 'react';
import MapView from '@/components/MapView';

const CiudadJuarezMap: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mapa de Ciudad Juárez</h1>
      <p className="mb-4 text-muted-foreground">
        Visualiza la ubicación de semáforos inteligentes en Ciudad Juárez. Haz zoom para ver más detalles.
      </p>
      <MapView />
    </div>
  );
};

export default CiudadJuarezMap;
