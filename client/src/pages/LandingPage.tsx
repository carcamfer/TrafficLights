import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Traffic Monitoring System</h1>
        <p className="text-xl mb-8">
          Real-time traffic monitoring and analysis for Ciudad Juárez
        </p>
        
        <div className="flex justify-center gap-4">
          <Link 
            to="/dashboard" 
            className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90 transition"
          >
            Dashboard
          </Link>
          <Link 
            to="/mapa" 
            className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-90 transition"
          >
            View Map
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-2">Real-time Monitoring</h2>
          <p>Monitor traffic conditions in real-time across Ciudad Juárez.</p>
        </div>
        
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-2">Data Analysis</h2>
          <p>Analyze traffic patterns and identify congestion hotspots.</p>
        </div>
        
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-2">Smart Alerts</h2>
          <p>Receive notifications about unusual traffic conditions.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;