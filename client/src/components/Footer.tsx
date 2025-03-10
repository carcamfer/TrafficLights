import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary py-4 text-primary-foreground">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Traffic Monitor. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;