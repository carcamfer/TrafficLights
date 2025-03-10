
import React from 'react';
import { IotDevice } from '@shared/schema';

interface DeviceListProps {
  devices: IotDevice[];
  selectedDevice: IotDevice | null;
  onSelectDevice: (device: IotDevice) => void;
}

export function DeviceList({ devices, selectedDevice, onSelectDevice }: DeviceListProps) {
  if (devices.length === 0) {
    return <div className="text-center p-4">No devices registered yet.</div>;
  }

  return (
    <div className="space-y-2">
      {devices.map((device) => (
        <div
          key={device.id}
          className={`p-3 rounded-md cursor-pointer border ${
            selectedDevice?.id === device.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
          onClick={() => onSelectDevice(device)}
        >
          <div className="font-medium">{device.name}</div>
          <div className="text-sm opacity-80">EUI: {device.deviceEUI}</div>
          <div className="text-sm opacity-80">
            Location: {device.location.lat.toFixed(6)}, {device.location.lng.toFixed(6)}
          </div>
        </div>
      ))}
    </div>
  );
}
