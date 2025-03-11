import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MapView from '@/components/MapView';

const Dashboard = () => {
  const [captures, setCaptures] = useState<string[]>([]);

  const handleCapture = (imageData: string) => {
    setCaptures(prev => [...prev, imageData]);
  };

  // Coordenadas de cruces importantes en Ciudad Juárez
  const intersections = [
    { name: 'Av. Tecnológico y Av. de las Torres', coords: [31.6686, -106.4258] },
    { name: 'Av. Paseo Triunfo y Av. Ejército Nacional', coords: [31.7139, -106.4421] },
    { name: 'Blvd. Zaragoza y Av. de las Torres', coords: [31.6731, -106.3968] }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Control de Semáforos</h1>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="map">Mapa en Vivo</TabsTrigger>
          <TabsTrigger value="captures">Capturas ({captures.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Ciudad Juárez</CardTitle>
              <CardDescription>
                Monitoreo en tiempo real de semáforos inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                {intersections.map((intersection, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{intersection.name}</h3>
                    <MapView 
                      center={intersection.coords as [number, number]} 
                      zoom={18}
                      onCapture={handleCapture}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captures">
          <Card>
            <CardHeader>
              <CardTitle>Capturas Guardadas</CardTitle>
              <CardDescription>Visualizaciones capturadas para análisis</CardDescription>
            </CardHeader>
            <CardContent>
              {captures.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay capturas guardadas. Haz clic en "Capturar Vista" en el mapa para guardar una visualización.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {captures.map((capture, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Captura #{idx + 1}</h3>
                      <div className="relative">
                        <img 
                          src={capture} 
                          alt={`Captura #${idx + 1}`} 
                          className="w-full rounded-md"
                        />
                        <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md">
                          <div className="text-xs">
                            <p className="font-bold">Semáforo #{idx + 1}</p>
                            <p>Verde: 30s</p>
                            <p>Rojo: 45s</p>
                            <p>Dispositivo: Conectado</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;