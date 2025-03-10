
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeviceList } from '@/components/DeviceList';
import { DeviceForm } from '@/components/DeviceForm';
import { MapView } from '@/components/MapView';
import { DataDisplay } from '@/components/DataDisplay';
import { IotDevice, IotData } from '@shared/schema';

export default function Dashboard() {
  const [devices, setDevices] = useState<IotDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IotDevice | null>(null);
  const [deviceData, setDeviceData] = useState<IotData[]>([]);
  const [showAddDevice, setShowAddDevice] = useState(false);

  // Fetch devices on component mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Fetch device data when a device is selected
  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData(selectedDevice.id);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const fetchDeviceData = async (deviceId: number) => {
    try {
      const response = await fetch(`/api/data?deviceId=${deviceId}`);
      const data = await response.json();
      setDeviceData(data);
    } catch (error) {
      console.error('Error fetching device data:', error);
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
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">IoT &amp; Waze Integration Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Devices</span>
                <Button onClick={() => setShowAddDevice(!showAddDevice)}>
                  {showAddDevice ? 'Cancel' : 'Add Device'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showAddDevice ? (
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Map View</CardTitle>
            </CardHeader>
            <CardContent>
              <MapView 
                devices={devices} 
                selectedDevice={selectedDevice} 
              />
            </CardContent>
          </Card>
          
          {selectedDevice && (
            <Card>
              <CardHeader>
                <CardTitle>Device Data: {selectedDevice.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <DataDisplay deviceData={deviceData} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
