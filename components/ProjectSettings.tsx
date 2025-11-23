import React, { useState } from 'react';
import { Project } from '../types';
import { exportProjectToCSV } from '../services/exportService';
import { DesktopDownIcon } from './ui/Icons';

interface ProjectSettingsProps {
  project: Project;
  onSave: (updatedProject: Project) => void;
  onClose: () => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({ ...project });
  const [apiKey, setApiKey] = useState('');

  React.useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-xl flex flex-col shadow-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-800 bg-neutral-950 sticky top-0 z-10">
          <h2 className="text-lg md:text-xl font-bold tracking-wider uppercase text-white">
            Project Settings
          </h2>
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 md:px-4 md:py-2 text-neutral-400 hover:text-white uppercase text-xs md:text-sm tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 md:px-6 md:py-2 bg-white text-black font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-neutral-200 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-6 bg-neutral-950">

          {/* API Key Section */}
          <div className="bg-neutral-900 p-4 border border-neutral-800 rounded-sm">
            <label className="block text-xs uppercase tracking-widest text-cyan-400 mb-2 font-bold">Google Gemini API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key here..."
              className="w-full bg-black border border-neutral-700 p-3 text-white focus:border-cyan-500 outline-none font-mono text-sm"
            />
            <p className="text-[10px] text-neutral-500 mt-2">
              Leave empty to use the system default key (if configured). Key is saved locally in your browser.
            </p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Project Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono h-32 resize-none text-sm"
              placeholder="Brief synopsis or logline..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Director</label>
            <input
              type="text"
              value={formData.director}
              onChange={(e) => handleChange('director', e.target.value)}
              className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Director of Photography (DOP)</label>
            <input
              type="text"
              value={formData.dop}
              onChange={(e) => handleChange('dop', e.target.value)}
              className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none font-mono text-sm"
            />
          </div>

          <hr className="border-neutral-800" />

          {/* Export Section */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-3">Export Shot Chart</label>
            <button
              onClick={() => exportProjectToCSV(project)}
              className="w-full flex items-center justify-center gap-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 px-4 py-3 hover:bg-cyan-500 hover:text-black transition-all uppercase text-xs tracking-widest font-bold"
            >
              <DesktopDownIcon className="w-4 h-4" />
              Download Shot Chart (CSV)
            </button>
            <p className="text-[10px] text-neutral-600 mt-2 uppercase tracking-wide">
              Exports all shots with technical specs and AD fields
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;