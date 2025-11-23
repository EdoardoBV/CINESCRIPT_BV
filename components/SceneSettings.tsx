import React, { useState } from 'react';
import { Scene } from '../types';
import { TrashIcon } from './ui/Icons';

interface SceneSettingsProps {
  scene: Scene;
  onSave: (updatedScene: Scene) => void;
  onDelete: (sceneId: string) => void;
  onClose: () => void;
}

const SceneSettings: React.FC<SceneSettingsProps> = ({ scene, onSave, onDelete, onClose }) => {
  const [formData, setFormData] = useState({ ...scene });

  const handleChange = (field: keyof Scene, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete Scene ${scene.number}? This will remove all shots in this scene.`)) {
      onDelete(scene.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-xl flex flex-col shadow-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-10">
          <h2 className="text-lg md:text-xl font-bold tracking-wider uppercase text-white truncate max-w-[60%]">
            Scene {scene.number}
          </h2>
          <div className="flex gap-3 md:gap-4">
            <button 
              onClick={onClose}
              className="px-3 py-1.5 md:px-4 md:py-2 text-neutral-400 hover:text-white uppercase text-xs md:text-sm tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(formData)}
              className="px-4 py-1.5 md:px-6 md:py-2 bg-white text-black font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-6 bg-neutral-950">
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">No.</label>
              <input 
                type="text"
                value={formData.number}
                onChange={(e) => handleChange('number', e.target.value)}
                className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono text-sm"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Scene Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Location</label>
            <input 
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Time of Day</label>
              <select 
                value={formData.timeOfDay}
                onChange={(e) => handleChange('timeOfDay', e.target.value)}
                className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono appearance-none text-sm"
              >
                <option value="INT">INT.</option>
                <option value="EXT">EXT.</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Lighting</label>
              <select 
                value={formData.lighting}
                onChange={(e) => handleChange('lighting', e.target.value)}
                className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono appearance-none text-sm"
              >
                <option value="DAY">DAY</option>
                <option value="NIGHT">NIGHT</option>
                <option value="MAGIC HOUR">MAGIC HOUR</option>
                <option value="ARTIFICIAL">ARTIFICIAL</option>
              </select>
            </div>
          </div>

          <hr className="border-neutral-800 my-6" />

          <div className="pt-2">
            <button 
              onClick={handleDelete}
              className="w-full py-4 border border-red-900/50 text-red-500 hover:bg-red-900/10 hover:border-red-500 transition-all uppercase text-xs tracking-widest font-bold flex items-center justify-center gap-2"
            >
              <TrashIcon className="w-4 h-4" /> Delete Scene
            </button>
            <p className="text-center text-[10px] text-neutral-600 mt-2 uppercase tracking-widest">
              Warning: This action cannot be undone.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SceneSettings;