
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface DeviceFormProps {
  onSubmit: (device: any) => void;
}

export function DeviceForm({ onSubmit }: DeviceFormProps) {
  const [deviceData, setDeviceData] = useState({
    deviceEUI: '',
    name: '',
    location: {
      lat: 0,
      lng: 0
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setDeviceData({
        ...deviceData,
        location: {
          ...deviceData.location,
          [name]: parseFloat(value) || 0
        }
      });
    } else {
      setDeviceData({
        ...deviceData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(deviceData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Device Name</Label>
        <Input
          id="name"
          name="name"
          value={deviceData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deviceEUI">Device EUI</Label>
        <Input
          id="deviceEUI"
          name="deviceEUI"
          value={deviceData.deviceEUI}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lat">Latitude</Label>
        <Input
          id="lat"
          name="lat"
          type="number"
          step="0.000001"
          value={deviceData.location.lat}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lng">Longitude</Label>
        <Input
          id="lng"
          name="lng"
          type="number"
          step="0.000001"
          value={deviceData.location.lng}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" className="w-full">Register Device</Button>
    </form>
  );
}
