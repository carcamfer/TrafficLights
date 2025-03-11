
import { useState } from 'react';
import MapView from '@/components/MapView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CiudadJuarezMap = () => {
  // Centro de Ciudad Juárez
  const cityCenter: [number, number] = [31.6904, -106.4245];
  const [captures, setCaptures] = useState<string[]>([]);

  const handleCapture = (imageData: string) => {
    setCaptures(prev => [...prev, imageData]);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Mapa de Ciudad Juárez</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista General</CardTitle>
          <CardDescription>
            Monitoreo en tiempo real de semáforos inteligentes en toda la ciudad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapView 
            center={cityCenter}
            zoom={13}
            onCapture={handleCapture}
          />
        </CardContent>
      </Card>

      {captures.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Capturas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {captures.map((capture, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Captura #{idx + 1}</h3>
                  <img 
                    src={capture} 
                    alt={`Captura #${idx + 1}`} 
                    className="w-full rounded-md"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CiudadJuarezMap;
