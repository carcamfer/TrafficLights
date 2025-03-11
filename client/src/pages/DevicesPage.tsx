
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviceList } from '@/components/DeviceList';
import { IotDevice } from '@shared/schema';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { DeviceForm } from '@/components/DeviceForm';
import { MapView } from '@/components/MapView';

export default function DevicesPage() {
  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IotDevice | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/devices');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setDevices(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setError('No se pudieron cargar los dispositivos. Usando datos de muestra.');
      
      // Datos de muestra en caso de error
      setDevices([
        {
          id: 1,
          deviceEUI: 'A8610A3335697121',
          name: 'Sensor Tráfico Norte',
          location: { lat: 31.7308, lng: -106.4371 },
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          deviceEUI: 'B9720B4446798232',
          name: 'Sensor Tráfico Centro',
          location: { lat: 31.7226, lng: -106.4572 },
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          deviceEUI: 'C0830C5557809343',
          name: 'Sensor Tráfico Sur',
          location: { lat: 31.7019, lng: -106.4265 },
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceSelect = (device: IotDevice) => {
    setSelectedDevice(device);
  };

  const handleAddDevice = async (newDevice: any) => {
    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });

      if (response.ok) {
        const device = await response.json();
        setDevices([...devices, device]);
        setShowAddDevice(false);
      }
    } catch (error) {
      console.error('Error adding device:', error);
      // Agregar dispositivo a datos locales en caso de error
      const mockDevice = {
        ...newDevice,
        id: devices.length + 1,
        createdAt: new Date().toISOString()
      };
      setDevices([...devices, mockDevice as IotDevice]);
      setShowAddDevice(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dispositivos IoT</h1>
        
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Dispositivos</span>
                  <Button onClick={() => setShowAddDevice(!showAddDevice)}>
                    {showAddDevice ? 'Cancelar' : 'Agregar Dispositivo'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center p-4">Cargando dispositivos...</div>
                ) : showAddDevice ? (
                  <DeviceForm onSubmit={handleAddDevice} />
                ) : (
                  <DeviceList 
                    devices={devices} 
                    selectedDevice={selectedDevice} 
                    onSelectDevice={handleDeviceSelect} 
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Ubicación de Dispositivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <MapView devices={devices} selectedDevice={selectedDevice} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
