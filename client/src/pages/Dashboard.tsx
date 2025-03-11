import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, BarChart3, MapPin, Trash2 } from 'lucide-react';

// Importación del componente MapView
import MapView from '@/components/MapView';

interface Capture {
  imageData: string;
  date: Date;
}

const Dashboard: React.FC = () => {
  const [captures, setCaptures] = useState<Capture[]>([]);

  const handleCapture = (imageData: string) => {
    const newCapture: Capture = {
      imageData,
      date: new Date()
    };
    setCaptures(prev => [...prev, newCapture]);
  };

  const handleDeleteCapture = (index: number) => {
    setCaptures(prev => prev.filter((_, i) => i !== index));
  };

  // Datos de ejemplo de semáforos para mostrar junto a las capturas
  const semaphoreData = [
    { id: "S-001", greenTime: 30, redTime: 45, deviceId: "IoT-TL-001" },
    { id: "S-002", greenTime: 25, redTime: 40, deviceId: "IoT-TL-002" },
    { id: "S-003", greenTime: 35, redTime: 50, deviceId: "IoT-TL-003" }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="captures">Capturas de Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Semáforos Activos</CardTitle>
                <CardDescription>Total en funcionamiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Intersecciones Monitoreadas</CardTitle>
                <CardDescription>Puntos de control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">8</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Alertas Recientes</CardTitle>
                <CardDescription>Últimas 24 horas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Tráfico</CardTitle>
                <CardDescription>Últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart3 className="h-16 w-16 text-gray-300" />
                <p className="ml-4 text-muted-foreground">Datos de tráfico no disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ubicaciones Principales</CardTitle>
                <CardDescription>Zonas con mayor congestión</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>Av. Tecnológico y Av. de las Américas</span>
                    </div>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>Paseo Triunfo y Av. López Mateos</span>
                    </div>
                    <span className="text-sm text-muted-foreground">72%</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      <span>Av. 16 de Septiembre y Av. Juárez</span>
                    </div>
                    <span className="text-sm text-muted-foreground">65%</span>
                  </li>
                </ul>
                <div className="mt-4">
                  <Link to="/mapa">
                    <Button variant="outline" className="w-full">
                      Ver mapa completo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Ciudad Juárez</CardTitle>
              <CardDescription>
                Monitoreo en tiempo real de los semáforos inteligentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapView
                center={[31.6904, -106.4245]}
                zoom={18}
                onCapture={handleCapture}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captures">
          <Card>
            <CardHeader>
              <CardTitle>Capturas Guardadas</CardTitle>
              <CardDescription>
                Capturas de pantalla del mapa de semáforos con información en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              {captures.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No hay capturas guardadas</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ve a la pestaña "Mapa" y haz clic en "Capturar Vista" para guardar una imagen.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {captures.map((capture, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="relative">
                          <img 
                            src={capture.imageData} 
                            alt={`Captura ${index + 1}`} 
                            className="w-full h-auto"
                          />
                          <button
                            onClick={() => handleDeleteCapture(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            title="Eliminar captura"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="p-4 bg-secondary">
                          <h3 className="font-bold text-lg mb-3">Información de Semáforos</h3>
                          <div className="space-y-4">
                            {semaphoreData.map((semaphore, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-md shadow-sm">
                                <div className="flex items-center mb-2">
                                  <img 
                                    src="/attached_assets/semaforo.PNG" 
                                    alt="Semáforo" 
                                    className="w-5 h-5 mr-2" 
                                  />
                                  <h4 className="font-medium">Semáforo {semaphore.id}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="bg-green-100 p-2 rounded">
                                    <span className="font-medium">Verde:</span> {semaphore.greenTime}s
                                  </div>
                                  <div className="bg-red-100 p-2 rounded">
                                    <span className="font-medium">Rojo:</span> {semaphore.redTime}s
                                  </div>
                                  <div className="col-span-2 bg-gray-100 p-2 rounded">
                                    <span className="font-medium">Dispositivo:</span> {semaphore.deviceId}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4">
                            <p className="text-sm text-muted-foreground">
                              Capturado el: {capture.date.toLocaleString()}
                            </p>
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