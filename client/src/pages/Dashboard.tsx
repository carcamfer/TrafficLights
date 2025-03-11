import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MapView from '@/components/MapView';

// Interface for traffic light captures
interface TrafficLightCapture {
  id: number;
  image: string; 
  location: { lat: number; lng: number };
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const [captures, setCaptures] = useState<TrafficLightCapture[]>([]);

  // Handle screenshot captured from MapView
  const handleScreenshot = (screenshotData: string, location: { lat: number; lng: number }) => {
    const newCapture: TrafficLightCapture = {
      id: Date.now(),
      image: screenshotData,
      location,
      timestamp: new Date()
    };

    setCaptures(prev => [...prev, newCapture]);
    console.log('Capture added to collection:', newCapture.id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Traffic Control Dashboard</h1>

      <Tabs defaultValue="map">
        <TabsList className="mb-4">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="captures">Traffic Light Captures</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Map</CardTitle>
              <CardDescription>
                Click on the map to add traffic lights and capture snapshots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapView onScreenshot={handleScreenshot} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="captures">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Light Captures</CardTitle>
              <CardDescription>
                {captures.length 
                  ? `${captures.length} traffic light locations captured` 
                  : 'No captures yet. Go to the Map View tab to capture traffic lights.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {captures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {captures.map((capture) => (
                    <div key={capture.id} className="border rounded-lg overflow-hidden shadow-sm">
                      <div className="p-2 bg-secondary text-secondary-foreground text-sm">
                        Traffic Light at {capture.location.lat.toFixed(4)}, {capture.location.lng.toFixed(4)}
                      </div>

                      <div className="relative aspect-video bg-muted">
                        {capture.image ? (
                          <img 
                            src={capture.image} 
                            alt={`Traffic light at ${capture.location.lat.toFixed(4)}, ${capture.location.lng.toFixed(4)}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            Image not available
                          </div>
                        )}
                      </div>

                      <div className="p-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-green-100 p-2 rounded text-center">
                            <span className="block font-semibold">Green</span>
                            <span>30s</span>
                          </div>
                          <div className="bg-red-100 p-2 rounded text-center">
                            <span className="block font-semibold">Red</span>
                            <span>45s</span>
                          </div>
                          <div className="bg-blue-100 p-2 rounded text-center">
                            <span className="block font-semibold">Status</span>
                            <span>Online</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Captured on: {capture.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No traffic light captures available. Go to the Map tab and click on traffic light locations.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Analytics</CardTitle>
              <CardDescription>
                Traffic flow and pattern analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
                Analytics dashboard coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;