import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21H9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 21a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m15 16.5 1.5 1.5 3-3" />
    </svg>
  );
};

export default Logo;