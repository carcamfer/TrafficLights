import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface SavedMapView {
  id: number;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

const Dashboard: React.FC = () => {
  const [savedViews, setSavedViews] = useState<SavedMapView[]>([]);

  useEffect(() => {
    // Cargar las vistas guardadas
    const views = JSON.parse(localStorage.getItem('savedMapViews') || '[]');
    setSavedViews(views);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos IoT</CardTitle>
            <CardDescription>Resumen de dispositivos conectados</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Total: 24 dispositivos</p>
            <p>Activos: 18 dispositivos</p>
            <p>Inactivos: 6 dispositivos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tráfico</CardTitle>
            <CardDescription>Estadísticas de tráfico recientes</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Promedio: 45 vehículos/min</p>
            <p>Pico: 78 vehículos/min (15:30)</p>
            <p>Mínimo: 12 vehículos/min (03:00)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Sistema</CardTitle>
            <CardDescription>Información sobre el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Estado: Operativo</p>
            <p>Última actualización: {new Date().toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Vistas de Mapa Guardadas</h2>
      {savedViews.length === 0 ? (
        <p className="text-muted-foreground">No hay vistas guardadas. Ve al mapa y guarda algunas vistas para verlas aquí.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedViews.map(view => (
            <Card key={view.id}>
              <CardHeader>
                <CardTitle>{view.name}</CardTitle>
                <CardDescription>Coordenadas: {view.lat.toFixed(6)}, {view.lng.toFixed(6)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Zoom: {view.zoom}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;