
import React from 'react';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[#f5f5f7] opacity-80" />
      
      {/* Gradient blobs */}
      <div className="absolute top-0 -right-10 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-70" />
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-70 animation-delay-2000" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-float opacity-70 animation-delay-4000" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]" />
    </div>
  );
};

export default AnimatedBackground;
