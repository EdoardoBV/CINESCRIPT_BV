import React from 'react';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", animate = false }) => {
  return (
    <div className={`${className} flex items-center justify-center ${animate ? 'animate-pulse' : ''}`}>
      <img
        src="image.png"
        alt="Cinescript Logo"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;