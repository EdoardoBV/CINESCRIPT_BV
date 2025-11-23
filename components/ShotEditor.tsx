import React, { useState, useRef, useEffect } from 'react';
import { Shot, ShotSize, CameraAngle, CameraMovement, ShotFraming, FocusType } from '../types';
import { SparklesIcon, UploadIcon, TrashIcon } from './ui/Icons';
import { editImageWithGemini, suggestShotDetails, generateImageWithGemini, generatePromptFromDescription } from '../services/geminiService';

interface ShotEditorProps {
  shot: Shot;
  onSave: (updatedShot: Shot) => void;
  onClose: () => void;
}

const ShotEditor: React.FC<ShotEditorProps> = ({ shot, onSave, onClose }) => {
  const [editedShot, setEditedShot] = useState<Shot>({ ...shot });
  const [promptText, setPromptText] = useState(''); // Used for both generation and editing
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill prompt with description on load if no image exists
  useEffect(() => {
    if (!editedShot.imageUrl && editedShot.description) {
      setPromptText(`Cinematic shot, ${editedShot.description}`);
    }
  }, []);

  const handleChange = (field: keyof Shot, value: any) => {
    setEditedShot(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('imageUrl', reader.result as string);
        setPromptText(''); // Clear prompt after upload to switch mode context
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGeminiAction = async () => {
    if (!promptText) return;
    setIsLoading(true);
    try {
      let newImage;
      if (editedShot.imageUrl) {
        // Edit Mode
        newImage = await editImageWithGemini(editedShot.imageUrl, promptText);
      } else {
        // Generate Mode
        newImage = await generateImageWithGemini(promptText);
      }
      handleChange('imageUrl', newImage);
      // Don't clear prompt immediately in case they want to tweak it, 
      // but maybe for edit mode it's better to clear. 
      if (editedShot.imageUrl) setPromptText('');
    } catch (e: any) {
      alert(`Failed to process image with Gemini. Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeminiSuggestion = async () => {
    setIsLoading(true);
    try {
      const description = editedShot.description || editedShot.notes || "A generic cinematic shot";

      // Only Suggest Metadata
      const suggestions = await suggestShotDetails(description);

      // Map string suggestions to enums safely
      const mapEnum = (obj: any, val: string) => Object.values(obj).includes(val) ? val : undefined;

      setEditedShot(prev => ({
        ...prev,
        ...suggestions,
        // Safely apply suggestions or keep previous if undefined
        lens: suggestions.lens || prev.lens,
        camera: suggestions.camera || prev.camera,
        aperture: suggestions.aperture || prev.aperture,
        size: (mapEnum(ShotSize, suggestions.size) as ShotSize) || prev.size,
        angle: (mapEnum(CameraAngle, suggestions.angle) as CameraAngle) || prev.angle,
        movement: (mapEnum(CameraMovement, suggestions.movement) as CameraMovement) || prev.movement,
        framing: (mapEnum(ShotFraming, suggestions.framing) as ShotFraming) || prev.framing,
        focus: (mapEnum(FocusType, suggestions.focus) as FocusType) || prev.focus,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefinePrompt = async () => {
    if (!promptText && !editedShot.description) return;
    setIsLoading(true);
    try {
      const baseText = promptText || editedShot.description || "";
      const refined = await generatePromptFromDescription(baseText);
      if (refined) {
        setPromptText(refined);
      } else {
        alert("Could not refine prompt. Try again.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearImage = () => {
    if (window.confirm("Remove current image?")) {
      handleChange('imageUrl', undefined);
      setPromptText(editedShot.description ? `Cinematic shot, ${editedShot.description}` : '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm md:p-4">
      {/* Responsive Container: Full screen on mobile, padded modal on desktop */}
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-6xl h-[100dvh] md:h-[95vh] flex flex-col shadow-2xl overflow-hidden rounded-none md:rounded-lg">

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-neutral-800 bg-neutral-950 shrink-0">
          <h2 className="text-lg md:text-xl font-bold tracking-wider uppercase text-white truncate mr-2">
            Shot {editedShot.number} // EDIT
          </h2>
          <div className="flex gap-2 md:gap-4">
            <button
              onClick={onClose}
              className="px-3 py-1.5 md:px-4 md:py-2 text-neutral-400 hover:text-white uppercase text-xs md:text-sm tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editedShot)}
              className="px-4 py-1.5 md:px-6 md:py-2 bg-white text-black font-bold uppercase text-xs md:text-sm tracking-widest hover:bg-neutral-200 transition-colors rounded-sm"
            >
              Save
            </button>
          </div>
        </div>

        {/* Content Area - Responsive Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

          {/* Left Column: Image & AI Tools */}
          <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col bg-black relative">

            {editedShot.imageUrl ? (
              // --- STATE: IMAGE EXISTS (VIEW / EDIT MODE) ---
              <div className="flex flex-col h-full">
                <div className="relative flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden group">
                  <img src={editedShot.imageUrl} alt="Shot" className="w-full h-full object-contain" />

                  {/* Overlay Actions */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleClearImage}
                      className="p-2 bg-black/50 text-red-500 hover:bg-red-900/50 hover:text-white rounded border border-red-500/30 backdrop-blur-sm transition-colors"
                      title="Delete Image"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Gemini Edit Tools */}
                <div className="p-4 bg-neutral-900/80 border-t border-neutral-800 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4" /> Gemini Image Editor
                    </h3>
                    <button
                      onClick={handleRefinePrompt}
                      disabled={isLoading || (!promptText && !editedShot.description)}
                      className="text-[10px] uppercase tracking-widest text-cyan-400 hover:text-white flex items-center gap-1 disabled:opacity-50"
                    >
                      <SparklesIcon className="w-3 h-3" /> Refine
                    </button>
                  </div>
                  <div className="space-y-3">
                    <textarea
                      className="w-full bg-black border border-neutral-700 p-3 text-sm text-neutral-300 focus:border-cyan-500 focus:outline-none resize-none font-mono"
                      rows={2}
                      placeholder="Describe changes (e.g., 'Make it night time', 'Add rain')"
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                    />
                    <button
                      onClick={handleGeminiAction}
                      disabled={!promptText || isLoading}
                      className="w-full py-2 bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 hover:border-cyan-500/50 hover:text-cyan-400 transition-all uppercase text-xs tracking-widest font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Processing...' : 'Apply Edit'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // --- STATE: NO IMAGE (GENERATION MODE) ---
              <div className="flex flex-col h-full p-6 md:p-8 justify-center">
                <div className="mb-6 text-center">
                  <SparklesIcon className="w-12 h-12 text-cyan-500 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest mb-2">AI Visualizer</h3>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide">Powered by Gemini</p>
                </div>

                <div className="space-y-4 w-full max-w-md mx-auto">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase tracking-widest text-cyan-500 font-bold">Image Prompt</label>
                      <button
                        onClick={handleRefinePrompt}
                        disabled={isLoading || (!promptText && !editedShot.description)}
                        className="text-[10px] uppercase tracking-widest text-cyan-400 hover:text-white flex items-center gap-1 disabled:opacity-50"
                      >
                        <SparklesIcon className="w-3 h-3" /> Refine / Translate
                      </button>
                    </div>
                    <textarea
                      className="w-full bg-neutral-900 border border-neutral-700 p-4 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm h-32 resize-none shadow-inner"
                      placeholder="Describe the visual style, subject, lighting..."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleGeminiAction}
                    disabled={!promptText || isLoading}
                    className="w-full py-4 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-500 transition-all uppercase text-sm tracking-widest font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)] disabled:opacity-50 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span> Generating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <SparklesIcon className="w-4 h-4" /> Generate Shot
                      </span>
                    )}
                  </button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-800"></div></div>
                    <div className="relative flex justify-center"><span className="bg-black px-2 text-xs text-neutral-600 uppercase">Or</span></div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 text-neutral-500 hover:text-white border border-neutral-800 hover:border-neutral-600 transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                  >
                    <UploadIcon className="w-4 h-4" /> Upload Reference
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            )}

            {/* Loading Overlay (Global for column) */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-t-2 border-white rounded-full animate-spin direction-reverse"></div>
                </div>
                <p className="text-xs uppercase tracking-widest animate-pulse text-cyan-400 font-bold">
                  Processing with Gemini...
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Data Fields */}
          <div className="w-full md:w-7/12 p-4 md:p-6 overflow-y-auto bg-neutral-950">
            <div className="space-y-6 md:space-y-8 max-w-2xl mx-auto pb-12">

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Description</label>
                <textarea
                  value={editedShot.description}
                  onChange={(e) => {
                    handleChange('description', e.target.value);
                    // If no image, update the generation prompt too to keep them in sync roughly
                    if (!editedShot.imageUrl && !promptText.startsWith("Custom:")) {
                      setPromptText(`Cinematic shot, ${e.target.value}`);
                    }
                  }}
                  className="w-full bg-black border border-neutral-800 p-3 text-white focus:border-white outline-none h-24 font-mono text-sm"
                  placeholder="Describe the action..."
                />
                <button
                  onClick={handleGeminiSuggestion}
                  className="mt-3 md:mt-2 py-2 md:py-0 w-full md:w-auto text-xs text-cyan-500 bg-cyan-950/30 md:bg-transparent border md:border-none border-cyan-900/50 rounded hover:text-cyan-400 flex items-center justify-center md:justify-start gap-2 uppercase tracking-wider"
                >
                  <SparklesIcon className="w-3 h-3" /> Auto-Fill Specs with AI
                </button>
              </div>

              <hr className="border-neutral-800" />

              {/* Cinematography Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-600 mb-4 border-l-2 border-cyan-600 pl-2">Cinematography & Composition</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {[
                    { label: 'Shot Size', field: 'size', options: ShotSize },
                    { label: 'Camera Angle', field: 'angle', options: CameraAngle },
                    { label: 'Movement', field: 'movement', options: CameraMovement },
                    { label: 'Framing', field: 'framing', options: ShotFraming },
                    { label: 'Focus', field: 'focus', options: FocusType }
                  ].map(({ label, field, options }) => (
                    <div key={field} className="col-span-1">
                      <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">{label}</label>
                      <select
                        value={(editedShot as any)[field]}
                        onChange={(e) => handleChange(field as keyof Shot, e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 p-3 md:p-2 text-white focus:border-white outline-none font-mono text-xs"
                      >
                        {Object.values(options).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  ))}

                </div>
              </div>

              {/* Tech Specs Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 border-l-2 border-neutral-600 pl-2">Technical Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['lens', 'camera', 'aperture', 'fps', 'resolution', 'colorTemp'].map((field) => (
                    <div key={field}>
                      <label className="block text-[10px] uppercase tracking-widest text-neutral-600 mb-1">{field}</label>
                      <input
                        type="text"
                        value={(editedShot as any)[field]}
                        onChange={(e) => handleChange(field as keyof Shot, e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 p-3 md:p-2 text-sm text-neutral-300 focus:border-neutral-500 outline-none font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-neutral-800" />

              {/* Assistant Director Fields */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-4 border-l-2 border-amber-600 pl-2">Assistant Director</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Timecode</label>
                    <input
                      type="text"
                      value={editedShot.timecode || ''}
                      onChange={(e) => handleChange('timecode', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 md:p-2 text-sm text-neutral-300 focus:border-neutral-500 outline-none font-mono"
                      placeholder="00:00:00:00"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Takes</label>
                    <input
                      type="number"
                      value={editedShot.takes || ''}
                      onChange={(e) => handleChange('takes', parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 md:p-2 text-sm text-neutral-300 focus:border-neutral-500 outline-none font-mono"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase tracking-widest text-neutral-600 mb-1">Status</label>
                    <select
                      value={editedShot.status || 'Not Started'}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 p-3 md:p-2 text-white focus:border-white outline-none font-mono text-xs"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Complete">Complete</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">AD Notes / References</label>
                  <textarea
                    value={editedShot.adNotes || ''}
                    onChange={(e) => handleChange('adNotes', e.target.value)}
                    className="w-full bg-black border border-neutral-800 p-2 text-neutral-400 focus:border-neutral-600 outline-none h-20 font-mono text-sm"
                    placeholder="Script supervisor notes, continuity, etc..."
                  />
                </div>
              </div>

              <hr className="border-neutral-800" />

              {/* Notes */}
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Production Notes</label>
                <textarea
                  value={editedShot.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full bg-black border border-neutral-800 p-2 text-neutral-400 focus:border-neutral-600 outline-none h-20 font-mono text-sm"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ShotEditor;