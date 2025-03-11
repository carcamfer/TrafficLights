
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavedView } from '@/components/MapView';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const Dashboard: React.FC = () => {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [selectedView, setSelectedView] = useState<SavedView | null>(null);
  
  // Cargar vistas guardadas del localStorage
  useEffect(() => {
    const storedViews = localStorage.getItem('savedMapViews');
    if (storedViews) {
      setSavedViews(JSON.parse(storedViews));
    }
  }, []);
  
  // Guardar vistas en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('savedMapViews', JSON.stringify(savedViews));
  }, [savedViews]);
  
  const handleDeleteView = (id: string) => {
    setSavedViews(views => views.filter(view => view.id !== id));
  };
  
  // Ejemplos de datos de tráfico (simulados)
  const trafficData = {
    congestionLevel: 'Moderado',
    averageSpeed: '35 km/h',
    incidentsToday: 2,
    activeAlerts: 1
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Monitoreo de Tráfico</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nivel de Congestión</CardTitle>
            <CardDescription>Estado actual general</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.congestionLevel}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Velocidad Promedio</CardTitle>
            <CardDescription>En vías principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.averageSpeed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incidentes hoy</CardTitle>
            <CardDescription>Reportados en Ciudad Juárez</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.incidentsToday}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <CardDescription>Requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trafficData.activeAlerts}</div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Puntos de Monitoreo Guardados</h2>
      
      {savedViews.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">No has guardado ninguna vista del mapa todavía.</p>
            <Link to="/mapa">
              <Button>Ir al Mapa para Guardar Vistas</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {savedViews.map(view => (
            <Card key={view.id} className="overflow-hidden">
              <div 
                className="h-40 bg-muted bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/${view.lng},${view.lat},${view.zoom},0/300x200?access_token=pk.eyJ1IjoiZXhhbXBsZXVzZXIiLCJhIjoiY2xzaDk5Y3AyMXAzZzJrcGl1ZTd0b2tzcyJ9.example)` 
                }}
              ></div>
              <CardHeader>
                <CardTitle>{view.name}</CardTitle>
                <CardDescription>
                  {view.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Guardado el {new Date(view.timestamp).toLocaleDateString()} a las {new Date(view.timestamp).toLocaleTimeString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link to={`/mapa?lat=${view.lat}&lng=${view.lng}&zoom=${view.zoom}`}>
                  <Button variant="outline">Ver en Mapa</Button>
                </Link>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive">Eliminar</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente esta vista guardada.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteView(view.id)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
