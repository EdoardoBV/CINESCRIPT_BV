
import React from 'react';
import { PlusIcon, FolderIcon } from './ui/Icons';
import Logo from './ui/Logo';

interface WelcomeScreenProps {
  onNewProject: () => void;
  onManageProjects: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNewProject, onManageProjects }) => {
  return (
    <div className="h-[100dvh] w-full bg-black text-neutral-200 font-mono flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background texture effect (optional) */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center text-center p-6 animate-in fade-in duration-1000">
        
        {/* Logo Section */}
        <div className="mb-10 relative group">
          <div className="absolute -inset-10 bg-cyan-500/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000"></div>
          <Logo className="h-48 w-48 md:h-64 md:w-64 text-white drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-700" animate={true} />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-[0.3em] text-white mb-2">
          CINESCRIPT<span className="text-neutral-600">.BV</span>
        </h1>
        <p className="text-xs md:text-sm uppercase tracking-[0.4em] text-neutral-500 mb-16">
          Industrial Shot Management System
        </p>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={onNewProject}
            className="group flex-1 py-4 px-8 border border-white/20 bg-neutral-900/50 hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-xs md:text-sm font-bold"
          >
            <PlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start New Project
          </button>

          <button 
            onClick={onManageProjects}
            className="group flex-1 py-4 px-8 border border-neutral-800 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest text-xs md:text-sm font-bold"
          >
            <FolderIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Load Project
          </button>
        </div>

        <footer className="absolute bottom-8 text-[10px] text-neutral-700 uppercase tracking-widest">
          v1.0.0 // Production Ready
        </footer>

      </div>
    </div>
  );
};

export default WelcomeScreen;