import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import html2canvas from 'html2canvas';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom traffic light icon
const trafficLightIcon = new L.Icon({
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAkCAYAAACJ8xqgAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxsbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc3R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTQyAyMDE5IChXaW5kb3dzKSkiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA2LTE1VDEyOjAwOjAwWiIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDYtMTVUMTI6MDA6MDBaIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzLTA2LTE1VDEyOjAwOjAwWiIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiMDc2ZmUzYS0xZGY1LTRlMzEtOTRhMC01OTkzM2FkY2NlOGYiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDpiMDc2ZmUzYS0xZGY1LTRlMzEtOTRhMC01OTkzM2FkY2NlOGYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiMDc2ZmUzYS0xZGY1LTRlMzEtOTRhMC01OTkzM2FkY2NlOGYiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmIwNzZmZTNhLTFkZjUtNGUzMS05NGEwLTU5OTMzYWRjY2U4ZiIgc3RFdnQ6d2hlbj0iMjAyMy0wNi0xNVQxMjowMDowMFoiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7/LQoSAAAAx0lEQVR4nO3VMQrCQBCF4T9sOjmCYG+plU3IAQR7CxtPYJHCK3iKgKWdRdILQtItFl6xUEFkYcEi+2DKmed9sxP4I2VZ5ozJYOK9r/jFzYw4jrdZliXA4E0sL/MkSQ4isiqKYtm2bd8fVFV1zPP83DTNGbgBF2BuZqdPQDN7BGU9DOOFJI2pN1f+TQGWQNC4DTGP+xYUQD8QUxkR5nEooAB6gZjKJsx/FAoogF4gpjI8rGtXQAHUn4pVdwUFUBfZf0Rf6QnV+uCGYZ/eiQAAAABJRU5ErkJggg==',
  iconSize: [20, 36],
  iconAnchor: [10, 36],
  popupAnchor: [0, -36]
});

interface MapViewProps {
  defaultLocation?: [number, number];
  defaultZoom?: number;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onScreenshot?: (screenshotData: string, location: { lat: number; lng: number }) => void;
}

const MapView: React.FC<MapViewProps> = ({
  defaultLocation = [31.7349, -106.4477], // Ciudad Juárez
  defaultZoom = 14,
  onLocationSelect,
  onScreenshot
}) => {
  const mapRef = useRef<L.Map>(null);
  const [markers, setMarkers] = useState<Array<{ position: [number, number]; type: string }>>([
    { position: [31.7354, -106.4485], type: 'trafficLight' }, // Example traffic light
    { position: [31.7360, -106.4470], type: 'trafficLight' }, // Another example
  ]);

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        console.log(`Selected location: ${lat}, ${lng}`);
        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        }

        // Add traffic light marker at click location
        setMarkers(prev => [...prev, { position: [lat, lng], type: 'trafficLight' }]);

        // Capture screenshot
        captureMapSection(lat, lng);
      },
    });
    return null;
  };

  // Function to capture map section around clicked point
  const captureMapSection = async (lat: number, lng: number) => {
    if (!mapRef.current || !onScreenshot) return;

    // Center on clicked point
    mapRef.current.setView([lat, lng], 18);

    // Wait for the map to settle after zoom
    setTimeout(async () => {
      try {
        const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
        if (!mapContainer) return;

        const canvas = await html2canvas(mapContainer, {
          useCORS: true,
          allowTaint: true,
          logging: true,
          backgroundColor: null
        });

        const screenshot = canvas.toDataURL('image/png');
        console.log('Screenshot captured:', screenshot.substring(0, 100) + '...');

        if (onScreenshot) {
          onScreenshot(screenshot, { lat, lng });
        }
      } catch (error) {
        console.error('Error capturing screenshot:', error);
      }
    }, 1000);
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultLocation}
        zoom={defaultZoom}
        style={{ height: "500px", width: "100%" }}
        whenCreated={(map) => { (mapRef as any).current = map; }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler />

        {markers.map((marker, index) => (
          <Marker 
            key={index}
            position={marker.position}
            icon={marker.type === 'trafficLight' ? trafficLightIcon : new L.Icon.Default()}
          >
            <Popup>
              <div>
                <strong>Traffic Light #{index + 1}</strong>
                <div>Position: {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}</div>
                <div className="mt-2">
                  <div className="bg-green-500 p-1 text-white text-xs rounded mb-1">
                    Green: 30s
                  </div>
                  <div className="bg-red-500 p-1 text-white text-xs rounded mb-1">
                    Red: 45s
                  </div>
                  <div className="bg-blue-500 p-1 text-white text-xs rounded">
                    IoT Device: Connected
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;