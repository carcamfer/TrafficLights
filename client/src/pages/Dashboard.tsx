import React, { useEffect, useState } from 'react';
import { MapView } from '../components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface SavedView {
  id: string;
  center: [number, number];
  zoom: number;
  name: string;
}

const Dashboard: React.FC = () => {
  const [savedViews, setSavedViews] = useState<SavedView[]>(() => {
    const saved = localStorage.getItem('savedMapViews');
    return saved ? JSON.parse(saved) : [];
  });
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    // Guardar las vistas en localStorage cuando cambien
    localStorage.setItem('savedMapViews', JSON.stringify(savedViews));
  }, [savedViews]);

  useEffect(() => {
    // Cargar los dispositivos IoT
    fetch('/api/devices')
      .then(response => response.json())
      .then(data => setDevices(data))
      .catch(error => console.error('Error cargando dispositivos:', error));
  }, []);

  const handleSaveView = (view: Omit<SavedView, 'id'>) => {
    const newView = {
      ...view,
      id: Date.now().toString() // Generar un ID único
    };
    setSavedViews(prev => [...prev, newView]);
  };

  const handleDeleteView = (id: string) => {
    setSavedViews(prev => prev.filter(view => view.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[500px]">
            <CardHeader>
              <CardTitle>Mapa de Ciudad Juárez</CardTitle>
            </CardHeader>
            <CardContent className="h-[420px]">
              <MapView devices={devices} selectedDevice={null} onSaveView={handleSaveView} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vistas Guardadas</CardTitle>
            </CardHeader>
            <CardContent>
              {savedViews.length === 0 ? (
                <p className="text-muted-foreground">
                  No hay vistas guardadas. Haz zoom en el mapa y guarda una vista para verla aquí.
                </p>
              ) : (
                <ul className="space-y-3">
                  {savedViews.map(view => (
                    <li key={view.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{view.name}</h3>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteView(view.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {view.center[0].toFixed(4)}, {view.center[1].toFixed(4)} (Zoom: {view.zoom})
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Dispositivos IoT</CardTitle>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <p className="text-muted-foreground">No hay dispositivos registrados.</p>
              ) : (
                <ul className="space-y-2">
                  {devices.map((device: any) => (
                    <li key={device.id} className="border rounded p-2 text-sm">
                      <div className="font-medium">{device.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;