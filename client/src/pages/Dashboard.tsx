
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2 } from "lucide-react";
import MapView from "@/components/MapView";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const [captures, setCaptures] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Coordenadas de Ciudad Juárez
  const center: [number, number] = [31.6904, -106.4245];
  const zoom = 16;

  const handleCapture = (imageData: string) => {
    setCaptures(prev => [...prev, imageData]);
    toast({
      title: "Captura guardada",
      description: "La vista del mapa ha sido guardada correctamente.",
    });
  };

  const handleDeleteCapture = (index: number) => {
    setCaptures(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Captura eliminada",
      description: "La captura ha sido eliminada correctamente.",
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/map">
          <Button className="flex items-center gap-2">
            <MapPin size={16} />
            Ver Mapa Completo
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="captures">Capturas</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Vista Rápida de Ciudad Juárez</CardTitle>
              <CardDescription>Visualiza el estado actual de los semáforos</CardDescription>
            </CardHeader>
            <CardContent>
              <MapView center={center} zoom={zoom} onCapture={handleCapture} />
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
                    <div key={idx} className="border rounded-lg p-4 relative">
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
                            <p>Latencia: 120ms</p>
                            <p>Último reporte: hace 2 min</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeleteCapture(idx)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Gestiona las preferencias de la aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Apariencia</h3>
                  <p className="text-sm text-gray-500">Personaliza la apariencia de la aplicación</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Notificaciones</h3>
                  <p className="text-sm text-gray-500">Configura las alertas y notificaciones</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Datos</h3>
                  <p className="text-sm text-gray-500">Gestiona el almacenamiento y la sincronización</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
