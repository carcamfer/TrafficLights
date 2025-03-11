import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface SavedMapView {
  id: number;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  mapImage?: string;
  trafficLights?: {
    id: number;
    deviceId: string;
    greenTime: number;
    redTime: number;
    status: string;
    lat: number;
    lng: number;
  }[];
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

      <h2 className="text-2xl font-bold mt-8 mb-4">Intersecciones Guardadas</h2>
      {savedViews.length === 0 ? (
        <p className="text-muted-foreground">No hay intersecciones guardadas. Ve al mapa, haz zoom en una intersección y guárdala para verla aquí.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedViews.map(view => (
            <Card key={view.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{view.name}</CardTitle>
                <CardDescription>Coordenadas: {view.lat.toFixed(6)}, {view.lng.toFixed(6)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {view.mapImage && (
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={view.mapImage} 
                      alt={`Vista de ${view.name}`} 
                      className="w-full h-auto"
                    />
                  </div>
                )}
                
                {view.trafficLights && view.trafficLights.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Semáforos en esta intersección</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {view.trafficLights.map(light => (
                        <div key={light.id} className="border rounded-md p-4 bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">Dispositivo: {light.deviceId}</div>
                            <div className={`text-xs px-2 py-1 rounded ${light.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {light.status === 'online' ? 'En línea' : 'Desconectado'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex flex-col items-center justify-center p-3 rounded-md bg-green-100">
                              <span className="text-xs text-green-800">Luz Verde</span>
                              <span className="text-2xl font-bold text-green-600">{light.greenTime}s</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 rounded-md bg-red-100">
                              <span className="text-xs text-red-800">Luz Roja</span>
                              <span className="text-2xl font-bold text-red-600">{light.redTime}s</span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground mt-2">
                            Actualizando en tiempo real...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay semáforos detectados en esta área</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;