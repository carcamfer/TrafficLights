import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import MapView from '../components/MapView';

interface SavedMapView {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [savedViews, setSavedViews] = useState<SavedMapView[]>([]);
  const [selectedView, setSelectedView] = useState<SavedMapView | null>(null);

  const handleSaveMapView = (view: { center: [number, number], zoom: number }) => {
    const newView: SavedMapView = {
      id: `view-${Date.now()}`,
      name: `Vista ${savedViews.length + 1}`,
      center: view.center,
      zoom: view.zoom,
      timestamp: new Date().toLocaleString()
    };

    setSavedViews([...savedViews, newView]);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - left 2/3 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista de Mapa</CardTitle>
              <CardDescription>
                {selectedView 
                  ? `Mostrando: ${selectedView.name} (Guardado: ${selectedView.timestamp})`
                  : 'Vista actual del mapa'}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <MapView 
                center={selectedView?.center || [31.7304, -106.4894]}
                zoom={selectedView?.zoom || 13}
                onSaveView={handleSaveMapView}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Tráfico</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Densidad de tráfico promedio: 45%</p>
                <p>Tiempo de espera promedio: 2.5 min</p>
                <p>Intersecciones congestionadas: 3</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Dispositivos activos: 12/15</p>
                <p>Batería promedio: 78%</p>
                <p>Última actualización: hace 5 minutos</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar - right 1/3 */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Vistas Guardadas</CardTitle>
              <CardDescription>
                Selecciona una vista guardada para mostrarla en el mapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedViews.length === 0 ? (
                <p className="text-muted-foreground">
                  No hay vistas guardadas. Utiliza el botón "Guardar esta vista" 
                  para añadir la vista actual del mapa.
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {savedViews.map((view) => (
                      <div key={view.id} 
                           onClick={() => setSelectedView(view)}
                           className={`p-3 rounded-md cursor-pointer hover:bg-secondary ${
                             selectedView?.id === view.id ? 'bg-secondary' : ''
                           }`}>
                        <p className="font-medium">{view.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {view.timestamp}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {`Lat: ${view.center[0].toFixed(4)}, Lng: ${view.center[1].toFixed(4)}, Zoom: ${view.zoom}`}
                        </p>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;