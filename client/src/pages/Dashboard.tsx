
import React, { useEffect, useState } from 'react';
import MapView from '../components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

interface SavedView {
  id: number;
  name: string;
  center: [number, number];
  zoom: number;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [selectedView, setSelectedView] = useState<SavedView | null>(null);
  
  useEffect(() => {
    // Cargar vistas guardadas desde localStorage
    const loadedViews = JSON.parse(localStorage.getItem('savedMapViews') || '[]');
    setSavedViews(loadedViews);
  }, []);
  
  const handleDeleteView = (id: number) => {
    const updatedViews = savedViews.filter(view => view.id !== id);
    setSavedViews(updatedViews);
    localStorage.setItem('savedMapViews', JSON.stringify(updatedViews));
    
    if (selectedView && selectedView.id === id) {
      setSelectedView(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Tráfico</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedView ? `Vista: ${selectedView.name}` : 'Mapa de Tráfico'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedView ? (
                <MapView center={selectedView.center} zoom={selectedView.zoom} />
              ) : (
                <div className="bg-muted h-96 flex items-center justify-center">
                  <p className="text-muted-foreground">Selecciona una vista guardada para visualizarla</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Tráfico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground mb-1">Tráfico Promedio</p>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-yellow-500 rounded-full w-3/5"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Congestión Actual</p>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-red-500 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Velocidad Promedio</p>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-green-500 rounded-full w-2/5"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos IoT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Sensores Activos</span>
                    <span className="font-semibold">24/30</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Conexión</span>
                    <span className="text-green-500 font-semibold">Estable</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Batería Promedio</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Última Actualización</span>
                    <span className="text-sm">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Vistas Guardadas</CardTitle>
            </CardHeader>
            <CardContent>
              {savedViews.length === 0 ? (
                <p className="text-muted-foreground">
                  No hay vistas guardadas. Ve al mapa y guarda una vista para visualizarla aquí.
                </p>
              ) : (
                <div className="space-y-4">
                  {savedViews.map(view => (
                    <div key={view.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{view.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(view.timestamp)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedView(view)}
                          >
                            Ver
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteView(view.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
