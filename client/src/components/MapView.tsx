import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import html2canvas from 'html2canvas';

// Definir icono de semáforo
const trafficLightIcon = new L.Icon({
  iconUrl: '../../../attached_assets/semaforo.PNG',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -10]
});

// Definir ubicaciones de semáforos (ejemplo)
const trafficLights = [
  {
    id: 1,
    position: [31.6904, -106.4245],
    greenTime: 30,
    redTime: 45,
    deviceId: "IoT-TL-001"
  },
  {
    id: 2,
    position: [31.6910, -106.4250],
    greenTime: 25,
    redTime: 40,
    deviceId: "IoT-TL-002"
  },
  {
    id: 3,
    position: [31.6898, -106.4240],
    greenTime: 35,
    redTime: 50,
    deviceId: "IoT-TL-003"
  }
];

interface MapViewProps {
  center: [number, number];
  zoom: number;
  onCapture?: (imageData: string) => void;
}

const SetView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const TrafficLightMarkers: React.FC = () => {
  return (
    <>
      {trafficLights.map(light => (
        <Marker 
          key={light.id} 
          position={light.position as [number, number]} 
          icon={trafficLightIcon}
        >
          <Popup>
            <div>
              <h3 className="font-bold">Semáforo {light.id}</h3>
              <p>Tiempo Verde: {light.greenTime}s</p>
              <p>Tiempo Rojo: {light.redTime}s</p>
              <p>Dispositivo: {light.deviceId}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const MapView: React.FC<MapViewProps> = ({ center, zoom, onCapture }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const captureMap = () => {
    if (!mapContainerRef.current || !onCapture) return;

    html2canvas(mapContainerRef.current).then(canvas => {
      const imageData = canvas.toDataURL('image/png');
      
      // Crear elementos de información de semáforos para mostrar junto a la captura
      const trafficLightInfo = trafficLights.map(light => ({
        id: light.id,
        greenTime: light.greenTime,
        redTime: light.redTime,
        deviceId: light.deviceId
      }));

      // Pasar la imagen capturada
      onCapture(imageData);
    });
  };);
  };

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="map-container">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '500px', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <SetView center={center} zoom={zoom} />
          <TrafficLightMarkers />
        </MapContainer>
      </div>
      {onCapture && (
        <button
          onClick={captureMap}
          className="absolute bottom-4 right-4 bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90"
        >
          Capturar Vista
        </button>
      )}
    </div>
  );
};

export default MapView;