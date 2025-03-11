
import React, { useEffect, useRef } from 'react';
import { IotDevice } from '@shared/schema';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  devices: IotDevice[];
  selectedDevice: IotDevice | null;
}

export function MapView({ devices, selectedDevice }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (mapRef.current && !mapInstanceRef.current) {
      // Configuración inicial del mapa centrada en Ciudad Juárez
      const map = L.map(mapRef.current).setView([31.7300, -106.4850], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapInstanceRef.current = map;
    }
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when devices change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};
    
    // Add markers for all devices
    devices.forEach(device => {
      const { lat, lng } = device.location;
      
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${device.name}</b><br>EUI: ${device.deviceEUI}`);
      
      markersRef.current[device.id] = marker;
    });
    
    // If we have devices, fit bounds to show all of them
    if (devices.length > 0) {
      const bounds = L.latLngBounds(devices.map(d => [d.location.lat, d.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [devices]);
  
  // Update selected marker
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedDevice) return;
    
    // Reset all markers
    Object.values(markersRef.current).forEach(marker => {
      marker.setIcon(L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      }));
    });
    
    // Highlight selected marker
    const selectedMarker = markersRef.current[selectedDevice.id];
    if (selectedMarker) {
      selectedMarker.openPopup();
      // Note: For a custom highlight we would need to define a custom icon
    }
  }, [selectedDevice]);

  return <div ref={mapRef} className="w-full h-full" />;
}
