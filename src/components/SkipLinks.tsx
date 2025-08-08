import React from 'react';

export const SkipLinks: React.FC = () => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute top-4 left-4 z-50 bg-primary text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary transition-all"
      >
        Pular para conteúdo principal
      </a>
      <a
        href="#navigation"
        className="absolute top-4 left-36 z-50 bg-primary text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary transition-all"
      >
        Pular para navegação
      </a>
    </div>
  );
};

export default SkipLinks;