import React from "react";
import MapView from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CiudadJuarezMap: React.FC = () => {
  // Coordenadas de Ciudad Juárez
  const center: [number, number] = [31.6904, -106.4245];
  const zoom = 18;
  const [captures, setCaptures] = useState<string[]>([]);

  const handleCapture = (imageData: string) => {
    setCaptures(prev => [...prev, imageData]);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar al Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Mapa de Ciudad Juárez</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vista General</CardTitle>
          <CardDescription>
            Monitoreo en tiempo real de semáforos inteligentes en toda la ciudad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <small className="flex items-center text-sm text-muted-foreground">
              <img src="/attached_assets/semaforo.PNG" alt="Semáforo" className="w-4 h-4 mr-1" />
              Ícono de semáforo en el mapa
            </small>
          </div>
          <MapView
            center={center}
            zoom={zoom}
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