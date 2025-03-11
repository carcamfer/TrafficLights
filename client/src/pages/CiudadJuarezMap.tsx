
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MapView, { SavedView } from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const CiudadJuarezMap: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Obtener parámetros de URL si existen
  const initialLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const initialLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const initialZoom = searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : undefined;
  
  const handleSaveView = (view: SavedView) => {
    // Obtener vistas existentes
    const existingViews = localStorage.getItem('savedMapViews');
    let savedViews: SavedView[] = [];
    
    if (existingViews) {
      savedViews = JSON.parse(existingViews);
    }
    
    // Agregar nueva vista
    const updatedViews = [...savedViews, view];
    
    // Guardar en localStorage
    localStorage.setItem('savedMapViews', JSON.stringify(updatedViews));
    
    // Mostrar notificación
    toast({
      title: "Vista guardada",
      description: `La vista "${view.name}" se ha guardado en tu dashboard.`,
    });
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mapa de Ciudad Juárez</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Vista en tiempo real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <MapView 
              onSaveView={handleSaveView} 
              initialView={initialLat && initialLng ? { lat: initialLat, lng: initialLng, zoom: initialZoom || 15 } : undefined}
            />
          </div>
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
};

export default CiudadJuarezMap;
