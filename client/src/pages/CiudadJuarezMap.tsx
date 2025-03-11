
import React from 'react';
import MapView from '../components/MapView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';

const CiudadJuarezMap: React.FC = () => {
  const { toast } = useToast();
  
  const handleSaveView = (view: { center: [number, number], zoom: number }) => {
    // Aquí implementaremos la lógica para guardar la vista
    // Por ahora, solo mostramos un toast de confirmación
    toast({
      title: "Vista guardada",
      description: "La vista actual del mapa ha sido guardada en el dashboard",
    });
    
    // En una aplicación real, esto podría enviar datos a una API
    console.log("Vista guardada:", view);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Mapa de Ciudad Juárez</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content - Map */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vista del Mapa</CardTitle>
              <CardDescription>
                Explora el mapa de la ciudad y sus intersecciones
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              <MapView onSaveView={handleSaveView} />
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Este mapa muestra las principales intersecciones de Ciudad Juárez
                donde se han instalado dispositivos de monitoreo de tráfico.
              </p>
              <p>
                Zoom en una intersección y usa el botón "Guardar esta vista" para
                añadirla a tu dashboard personalizado.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Leyenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span>Tráfico fluido</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Tráfico moderado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span>Tráfico congestionado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                  <span>Sin datos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CiudadJuarezMap;
