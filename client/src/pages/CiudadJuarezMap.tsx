
import React, { useState } from 'react';
import MapView from '@/components/MapView';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CiudadJuarezMap: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    console.log('Selected location in Juarez Map:', location);
  };

  const handleScreenshot = (screenshot: string, location: { lat: number; lng: number }) => {
    setCapturedImage(screenshot);
    setSelectedLocation(location);
    console.log('Screenshot captured in Juarez Map');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Ciudad Juarez Traffic Map</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Traffic Map</CardTitle>
              <CardDescription>
                Click on traffic light locations to view real-time data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapView 
                defaultLocation={[31.7349, -106.4477]}
                defaultZoom={14}
                onLocationSelect={handleLocationSelect}
                onScreenshot={handleScreenshot}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Traffic Light Information</CardTitle>
              <CardDescription>
                {selectedLocation 
                  ? `Location: ${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}` 
                  : 'Select a traffic light on the map'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capturedImage ? (
                <div className="space-y-4">
                  <div className="border rounded overflow-hidden">
                    <img 
                      src={capturedImage} 
                      alt="Traffic light capture" 
                      className="w-full"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-green-100 p-3 rounded">
                      <div className="font-semibold">Green Light Duration</div>
                      <div className="text-2xl">30 seconds</div>
                    </div>
                    
                    <div className="bg-red-100 p-3 rounded">
                      <div className="font-semibold">Red Light Duration</div>
                      <div className="text-2xl">45 seconds</div>
                    </div>
                    
                    <div className="bg-blue-100 p-3 rounded">
                      <div className="font-semibold">IoT Device Status</div>
                      <div className="text-2xl">Connected</div>
                      <div className="text-xs text-muted-foreground">Last update: 2 minutes ago</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted rounded text-muted-foreground">
                  Click on a traffic light on the map to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CiudadJuarezMap;
