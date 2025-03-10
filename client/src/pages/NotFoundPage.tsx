import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl mb-8">Page Not Found</p>
      <p className="mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/" 
        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:opacity-90 transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;