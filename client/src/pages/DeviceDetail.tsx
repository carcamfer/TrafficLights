import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DeviceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Device Detail: {id}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>ID:</strong> {id}</p>
            <p><strong>Type:</strong> Traffic Sensor</p>
            <p><strong>Status:</strong> Active</p>
            <p><strong>Last Update:</strong> {new Date().toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Latitude:</strong> 31.6904</p>
            <p><strong>Longitude:</strong> -106.4245</p>
            <p><strong>Address:</strong> Example Street, Ciudad Juárez</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeviceDetail;