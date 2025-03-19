
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-8 flex items-center justify-between animate-fade-in">
      <Link 
        to="/" 
        className="flex items-center space-x-2 group transition-all duration-300"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
          <span className="text-white font-semibold text-lg">TX</span>
        </div>
        <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80 group-hover:from-primary/90 group-hover:to-primary transition-all duration-300">
          TransactLinker
        </span>
      </Link>
      
      <nav className="flex space-x-8 items-center">
        <Link to="/" className="text-foreground/80 hover:text-primary transition-colors duration-200">
          Home
        </Link>
        <Link to="/analytics" className="text-foreground/80 hover:text-primary transition-colors duration-200 flex items-center gap-1">
          <BarChart2 className="h-4 w-4" />
          Analytics
        </Link>
        <a href="https://docs.metakeep.xyz/reference/blockchain-sdk-101" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary transition-colors duration-200 hidden md:block">
          Documentation
        </a>
      </nav>
    </header>
  );
};

export default Header;
