import React from 'react';
import { Project } from '../types';
import { PlusIcon, TrashIcon, FolderIcon } from './ui/Icons';

interface ProjectManagerProps {
  projects: Project[];
  currentProjectId: string;
  onSelect: (projectId: string) => void;
  onCreate: () => void;
  onDelete: (projectId: string) => void;
  onClose: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ 
  projects, 
  currentProjectId, 
  onSelect, 
  onCreate, 
  onDelete, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-4xl h-[100dvh] md:h-[80vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-800 bg-black shrink-0">
          <div className="flex items-center gap-3">
             <FolderIcon className="w-6 h-6 text-cyan-500" />
             <h2 className="text-lg md:text-xl font-bold tracking-wider uppercase text-white">
               Project Database
             </h2>
          </div>
          <button 
            onClick={onClose}
            className="px-3 py-1 md:px-4 md:py-2 text-neutral-500 hover:text-white uppercase text-xs md:text-sm tracking-widest transition-colors border border-neutral-800 md:border-transparent"
          >
            Close
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
           {projects.map(project => (
             <div 
               key={project.id}
               className={`p-4 md:p-6 border ${project.id === currentProjectId ? 'border-cyan-500 bg-cyan-950/10' : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600'} flex flex-col justify-between transition-all group relative`}
             >
               <div>
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="text-base md:text-lg font-bold text-white uppercase truncate pr-4">{project.name}</h3>
                   {project.id === currentProjectId && (
                     <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 font-bold uppercase shrink-0">Active</span>
                   )}
                 </div>
                 <p className="text-xs text-neutral-400 mb-1 uppercase tracking-wider">Director: {project.director || 'N/A'}</p>
                 <p className="text-xs text-neutral-500 line-clamp-2 font-mono h-8">{project.description || 'No description provided.'}</p>
                 <div className="mt-4 text-[10px] text-neutral-600 uppercase">
                   Created: {new Date(project.createdAt).toLocaleDateString()}
                 </div>
               </div>

               <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-800/50">
                 {project.id !== currentProjectId ? (
                    <button 
                      onClick={() => onSelect(project.id)}
                      className="flex-1 bg-white text-black py-3 md:py-2 text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                    >
                      Open Project
                    </button>
                 ) : (
                   <button className="flex-1 border border-cyan-500/30 text-cyan-500 py-3 md:py-2 text-xs font-bold uppercase tracking-widest cursor-default">
                     Currently Open
                   </button>
                 )}
                 
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     if(window.confirm(`Are you sure you want to delete "${project.name}"? This cannot be undone.`)) {
                       onDelete(project.id);
                     }
                   }}
                   className="p-3 md:p-2 text-neutral-600 hover:text-red-500 transition-colors border border-neutral-800 hover:border-red-500/30"
                   title="Delete Project"
                 >
                   <TrashIcon className="w-4 h-4" />
                 </button>
               </div>
             </div>
           ))}
           
           {/* Create New Card */}
           <button 
             onClick={onCreate}
             className="border-2 border-dashed border-neutral-800 rounded flex flex-col items-center justify-center p-6 text-neutral-500 hover:text-white hover:border-neutral-600 hover:bg-neutral-900/30 transition-all min-h-[150px] md:min-h-[200px]"
           >
             <PlusIcon className="w-10 h-10 mb-3 opacity-50" />
             <span className="uppercase tracking-widest font-bold text-sm">Create New Project</span>
           </button>
        </div>

      </div>
    </div>
  );
};

export default ProjectManager;