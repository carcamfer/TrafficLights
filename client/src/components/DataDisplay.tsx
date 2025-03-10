
import React from 'react';
import { IotData } from '@shared/schema';

interface DataDisplayProps {
  deviceData: IotData[];
}

export function DataDisplay({ deviceData }: DataDisplayProps) {
  if (deviceData.length === 0) {
    return <div className="text-center p-4">No data available for this device.</div>;
  }

  // Sort by timestamp descending
  const sortedData = [...deviceData].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get the latest data point
  const latestData = sortedData[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {latestData.temperature !== null && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Temperature</div>
            <div className="text-2xl font-bold">{latestData.temperature}°C</div>
          </div>
        )}
        
        {latestData.humidity !== null && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Humidity</div>
            <div className="text-2xl font-bold">{latestData.humidity}%</div>
          </div>
        )}
        
        {latestData.batteryLevel !== null && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Battery</div>
            <div className="text-2xl font-bold">{latestData.batteryLevel}%</div>
          </div>
        )}
        
        {latestData.rssi !== null && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">RSSI</div>
            <div className="text-2xl font-bold">{latestData.rssi} dBm</div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">History</h3>
        <div className="border rounded-md overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-2 text-left text-sm font-medium">Timestamp</th>
                {latestData.temperature !== null && (
                  <th className="px-4 py-2 text-left text-sm font-medium">Temp (°C)</th>
                )}
                {latestData.humidity !== null && (
                  <th className="px-4 py-2 text-left text-sm font-medium">Humidity (%)</th>
                )}
                {latestData.batteryLevel !== null && (
                  <th className="px-4 py-2 text-left text-sm font-medium">Battery (%)</th>
                )}
                {latestData.rssi !== null && (
                  <th className="px-4 py-2 text-left text-sm font-medium">RSSI (dBm)</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedData.map((data) => (
                <tr key={data.id}>
                  <td className="px-4 py-2 text-sm">
                    {new Date(data.timestamp).toLocaleString()}
                  </td>
                  {data.temperature !== null && (
                    <td className="px-4 py-2 text-sm">{data.temperature}</td>
                  )}
                  {data.humidity !== null && (
                    <td className="px-4 py-2 text-sm">{data.humidity}</td>
                  )}
                  {data.batteryLevel !== null && (
                    <td className="px-4 py-2 text-sm">{data.batteryLevel}</td>
                  )}
                  {data.rssi !== null && (
                    <td className="px-4 py-2 text-sm">{data.rssi}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
