
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function Dashboard() {
  const [savedViews, setSavedViews] = useState<SavedMapView[]>([]);
  
  useEffect(() => {
    // Cargar vistas guardadas del localStorage
    const loadedViews = JSON.parse(localStorage.getItem('savedMapViews') || '[]');
    setSavedViews(loadedViews);
  }, []);

  const handleDeleteView = (id: number) => {
    const updatedViews = savedViews.filter(view => view.id !== id);
    setSavedViews(updatedViews);
    localStorage.setItem('savedMapViews', JSON.stringify(updatedViews));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Tabs defaultValue="saved-views">
        <TabsList className="mb-4">
          <TabsTrigger value="saved-views">Intersecciones Guardadas</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="saved-views">
          {savedViews.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium">No hay intersecciones guardadas</h3>
                  <p className="text-muted-foreground mt-2">
                    Ve al mapa y guarda alguna intersección para visualizarla aquí
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedViews.map(view => (
                <Card key={view.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{view.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleDeleteView(view.id)}
                      >
                        <span className="sr-only">Eliminar</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </Button>
                    </div>
                    <CardDescription>
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
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {view.mapImage && (
                        <div className="border rounded-md overflow-hidden h-[200px] bg-muted relative">
                          <img 
                            src={view.mapImage} 
                            alt={`Vista de ${view.name}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/600x400/EEE/31343C?text=Vista+no+disponible';
                            }}
                          />
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Semáforos en esta intersección ({view.trafficLights?.length || 0})</h4>
                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                          {view.trafficLights?.map(light => (
                            <div key={light.id} className="border p-3 rounded-md">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">{light.deviceId}</span>
                                <Badge variant={light.status === 'operational' ? 'default' : 'destructive'}>
                                  {light.status === 'operational' ? 'Activo' : 'Mantenimiento'}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                  <span className="text-sm">{light.greenTime}s</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                  <span className="text-sm">{light.redTime}s</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Semáforos totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{
                  Array.from(new Set(
                    savedViews.flatMap(view => view.trafficLights?.map(light => light.deviceId) || [])
                  )).length
                }</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Intersecciones guardadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{savedViews.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estado de red</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Sistema operativo</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
