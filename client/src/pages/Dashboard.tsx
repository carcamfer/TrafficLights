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
                {view.mapImage ? (
                  <div className="w-full h-40 bg-muted rounded-md overflow-hidden mb-4 relative">
                    <img 
                      src={view.mapImage} 
                      alt={`Vista de ${view.name}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Error al cargar la imagen");
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-muted rounded-md overflow-hidden mb-4 flex items-center justify-center">
                    <span className="text-muted-foreground">Sin imagen disponible</span>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Latitud:</span>
                    <span className="text-sm ml-1">{view.lat.toFixed(6)}</span>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Longitud:</span>
                    <span className="text-sm ml-1">{view.lng.toFixed(6)}</span>
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-sm font-medium">Zoom:</span>
                    <span className="text-sm ml-1">{view.zoom}</span>
                  </div>
                </div>

                {view.trafficLights && view.trafficLights.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Semáforos en esta intersección:</h4>
                    <div className="space-y-3">
                      {view.trafficLights.map(light => (
                        <div key={light.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">ID: {light.deviceId}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${light.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {light.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm">{light.greenTime}s</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              <span className="text-sm">{light.redTime}s</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
                            </div>
                            <div className="text-xs text-right mt-1">Ciclo actual</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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