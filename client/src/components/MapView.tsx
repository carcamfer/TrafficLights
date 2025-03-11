
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// Corregir el problema con los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapViewProps {
  devices?: any[];
  selectedDevice?: any;
  onSaveView?: (view: SavedView) => void;
}

export interface SavedView {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  zoom: number;
  timestamp: string;
}

const MapView: React.FC<MapViewProps> = ({ devices = [], selectedDevice, onSaveView }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [currentView, setCurrentView] = useState<{lat: number, lng: number, zoom: number} | null>(null);
  const [viewName, setViewName] = useState('');
  const [viewDescription, setViewDescription] = useState('');
  
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Inicializar el mapa con la vista de Ciudad Juárez
      const map = L.map(mapContainerRef.current).setView([31.6904, -106.4245], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapRef.current = map;
      
      // Agregar eventos para actualizar la vista actual
      map.on('moveend zoomend', () => {
        const center = map.getCenter();
        setCurrentView({
          lat: center.lat,
          lng: center.lng,
          zoom: map.getZoom()
        });
      });
      
      // Inicializar la vista actual
      const center = map.getCenter();
      setCurrentView({
        lat: center.lat,
        lng: center.lng,
        zoom: map.getZoom()
      });
    }
    
    // Agregar marcadores para dispositivos si existen
    if (mapRef.current && devices.length > 0) {
      devices.forEach(device => {
        if (device.latitude && device.longitude) {
          const marker = L.marker([device.latitude, device.longitude])
            .addTo(mapRef.current!)
            .bindPopup(`<b>${device.name}</b><br>${device.description || ''}`);
          
          if (selectedDevice && selectedDevice.id === device.id) {
            marker.openPopup();
            mapRef.current!.setView([device.latitude, device.longitude], 15);
          }
        }
      });
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [devices, selectedDevice]);
  
  const handleSaveView = () => {
    if (currentView && onSaveView) {
      const savedView: SavedView = {
        id: `view-${Date.now()}`,
        name: viewName || `Vista ${new Date().toLocaleTimeString()}`,
        description: viewDescription || 'Punto de interés en Ciudad Juárez',
        lat: currentView.lat,
        lng: currentView.lng,
        zoom: currentView.zoom,
        timestamp: new Date().toISOString()
      };
      
      onSaveView(savedView);
      setViewName('');
      setViewDescription('');
    }
  };
  
  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full rounded-md"></div>
      
      {currentView && currentView.zoom >= 15 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              className="absolute bottom-4 right-4 z-[1000]"
              variant="default"
            >
              Guardar esta vista
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Guardar vista del mapa</AlertDialogTitle>
              <AlertDialogDescription>
                Esta vista se guardará en tu dashboard para monitoreo. Puedes asignarle un nombre y descripción.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="Intersección Principal"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="description"
                  value={viewDescription}
                  onChange={(e) => setViewDescription(e.target.value)}
                  placeholder="Punto de monitoreo para tráfico"
                  className="col-span-3"
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleSaveView}>Guardar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default MapView;
