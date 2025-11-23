
import { useState, useEffect } from 'react';
import { Project, Scene, Shot, ShotSize, CameraAngle, CameraMovement, ShotFraming, FocusType } from './types';
import ShotEditor from './components/ShotEditor';
import ProjectSettings from './components/ProjectSettings';
import ProjectManager from './components/ProjectManager';
import SceneSettings from './components/SceneSettings';
import WelcomeScreen from './components/WelcomeScreen';
import Logo from './components/ui/Logo';
import { FilmIcon, PlusIcon, TrashIcon, EditIcon, SettingsIcon, FolderIcon, ChevronUpIcon, ChevronDownIcon, MenuIcon, XMarkIcon, DesktopDownIcon } from './components/ui/Icons';

// --- Mock Data Generator ---
const createId = () => Math.random().toString(36).substr(2, 9);

const initialProject: Project = {
  id: 'proj_1',
  name: 'NEON PROTOCOL',
  description: 'A high-stakes cyberpunk thriller set in New Tokyo, 2089.',
  director: 'A. Kubrik',
  dop: 'R. Deakins',
  createdAt: Date.now(),
  scenes: [
    {
      id: 'scene_1',
      number: '1A',
      title: 'The Awakening',
      location: 'Cryo Chamber',
      timeOfDay: 'INT',
      lighting: 'ARTIFICIAL',
      shots: [
        {
          id: 'shot_1',
          number: 1,
          size: ShotSize.CU,
          angle: CameraAngle.EYE_LEVEL,
          movement: CameraMovement.STATIC,
          framing: ShotFraming.SINGLE,
          focus: FocusType.SHALLOW,
          description: 'Hero wakes up, eyes opening slowly. Blue flare.',
          notes: 'Use macro lens.',
          lens: '100mm Macro',
          camera: 'Alexa Mini LF',
          aperture: 'T2.8',
          fps: 24,
          resolution: '4K OG',
          colorTemp: '5600K'
        },
        {
          id: 'shot_2',
          number: 2,
          size: ShotSize.LS,
          angle: CameraAngle.HIGH,
          movement: CameraMovement.DOLLY_OUT,
          framing: ShotFraming.SINGLE,
          focus: FocusType.DEEP,
          description: 'Wide shot of the cryo room. Steam rising.',
          notes: 'Haze machine required.',
          lens: '24mm',
          camera: 'Alexa Mini LF',
          aperture: 'T4',
          fps: 24,
          resolution: '4K OG',
          colorTemp: '3200K'
        }
      ]
    }
  ]
};

// Helper to reindex shots sequentially
const reindexShots = (shots: Shot[]): Shot[] => {
  return shots.map((shot, index) => ({
    ...shot,
    number: index + 1
  }));
};

function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('cinescript_projects');
    return saved ? JSON.parse(saved) : [initialProject];
  });
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('cinescript_current_project_id');
    return saved || initialProject.id;
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('cinescript_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('cinescript_current_project_id', currentProjectId);
  }, [currentProjectId]);

  // View State
  const [showWelcome, setShowWelcome] = useState(true);
  // New state to track if we should go back to welcome screen on cancel
  const [returnToWelcome, setReturnToWelcome] = useState(false);

  const [activeShot, setActiveShot] = useState<Shot | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(initialProject.scenes[0].id);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isSceneSettingsOpen, setIsSceneSettingsOpen] = useState(false);

  // Sidebar Toggle State for Mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // PWA Install Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

  // Ensure we have a valid active scene when switching projects
  useEffect(() => {
    if (currentProject && currentProject.scenes.length > 0) {
      // If the currently active scene is not in the current project, switch to first scene of current project
      const sceneExists = currentProject.scenes.find(s => s.id === activeSceneId);
      if (!sceneExists) {
        setActiveSceneId(currentProject.scenes[0].id);
      }
    } else {
      setActiveSceneId(null);
    }
    setActiveShot(null);
  }, [currentProjectId, currentProject, activeSceneId]);

  // --- Logic Helpers ---

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleSaveShot = (updatedShot: Shot) => {
    if (!activeSceneId) return;

    const updatedScenes = currentProject.scenes.map(scene => {
      if (scene.id !== activeSceneId) return scene;
      return {
        ...scene,
        shots: scene.shots.map(s => s.id === updatedShot.id ? updatedShot : s)
      };
    });

    updateProject({ ...currentProject, scenes: updatedScenes });
    setActiveShot(null);
  };

  const addShot = (sceneId: string) => {
    const scene = currentProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const newShot: Shot = {
      id: createId(),
      number: scene.shots.length + 1,
      size: ShotSize.MS,
      angle: CameraAngle.EYE_LEVEL,
      movement: CameraMovement.STATIC,
      framing: ShotFraming.SINGLE,
      focus: FocusType.STANDARD,
      description: '',
      notes: '',
      lens: '',
      camera: '',
      aperture: '',
      fps: 24,
      resolution: '1080p',
      colorTemp: ''
    };

    const updatedScenes = currentProject.scenes.map(s => {
      if (s.id !== sceneId) return s;
      // Append new shot, existing order is preserved, numbers are sequential
      return { ...s, shots: [...s.shots, newShot] };
    });

    updateProject({ ...currentProject, scenes: updatedScenes });
    // Immediately open editor
    setActiveSceneId(sceneId);
    setActiveShot(newShot);
  };

  const deleteShot = (sceneId: string, shotId: string) => {
    const updatedScenes = currentProject.scenes.map(s => {
      if (s.id !== sceneId) return s;
      const filteredShots = s.shots.filter(shot => shot.id !== shotId);
      // Automatically renumber remaining shots
      return { ...s, shots: reindexShots(filteredShots) };
    });
    updateProject({ ...currentProject, scenes: updatedScenes });
  };

  const moveShot = (sceneId: string, shotId: string, direction: 'up' | 'down') => {
    const scene = currentProject.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const index = scene.shots.findIndex(s => s.id === shotId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === scene.shots.length - 1) return;

    const newShots = [...scene.shots];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap positions
    [newShots[index], newShots[swapIndex]] = [newShots[swapIndex], newShots[index]];

    // Update scene with reindexed shots (updating numbers to match new positions)
    const updatedScenes = currentProject.scenes.map(s => {
      if (s.id !== sceneId) return s;
      return { ...s, shots: reindexShots(newShots) };
    });

    updateProject({ ...currentProject, scenes: updatedScenes });
  };

  const addScene = () => {
    const newScene: Scene = {
      id: createId(),
      number: `${currentProject.scenes.length + 1}A`,
      title: 'NEW SCENE',
      location: 'TBD',
      timeOfDay: 'EXT',
      lighting: 'DAY',
      shots: []
    };
    updateProject({ ...currentProject, scenes: [...currentProject.scenes, newScene] });
    setActiveSceneId(newScene.id);
    setIsSidebarOpen(false); // Close sidebar on mobile if new scene added
  };

  const handleUpdateScene = (updatedScene: Scene) => {
    const updatedScenes = currentProject.scenes.map(s => s.id === updatedScene.id ? updatedScene : s);
    updateProject({ ...currentProject, scenes: updatedScenes });
    setIsSceneSettingsOpen(false);
  };

  const handleDeleteScene = (sceneId: string) => {
    const updatedScenes = currentProject.scenes.filter(s => s.id !== sceneId);
    updateProject({ ...currentProject, scenes: updatedScenes });

    if (updatedScenes.length > 0) {
      setActiveSceneId(updatedScenes[0].id);
    } else {
      setActiveSceneId(null);
    }
    setIsSceneSettingsOpen(false);
  };

  // --- Project Manager Logic ---

  const createNewProjectObject = (): Project => ({
    id: createId(),
    name: 'UNTITLED PROJECT',
    description: '',
    director: 'TBD',
    dop: 'TBD',
    createdAt: Date.now(),
    scenes: []
  });

  const handleAddProject = () => {
    const newProject = createNewProjectObject();
    setProjects([...projects, newProject]);
    setCurrentProjectId(newProject.id);
    setIsProjectManagerOpen(false);
    return newProject.id;
  };

  const handleStartNewProject = () => {
    handleAddProject();
    setShowWelcome(false);
  };

  const handleOpenManagerFromWelcome = () => {
    // Mark that we came from welcome screen, so we can go back if cancelled
    setReturnToWelcome(true);
    setShowWelcome(false);
    setIsProjectManagerOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    const remaining = projects.filter(p => p.id !== projectId);
    if (remaining.length === 0) {
      // If deleting the last project, create a new blank one or go to welcome?
      // Let's ensure there is always one project or go to welcome
      const newOne = createNewProjectObject();
      setProjects([newOne]);
      setCurrentProjectId(newOne.id);
      return;
    }
    setProjects(remaining);
    if (currentProjectId === projectId) {
      setCurrentProjectId(remaining[0].id);
    }
  };

  const currentScene = currentProject.scenes.find(s => s.id === activeSceneId);

  // --- Conditional Render ---

  if (showWelcome) {
    return (
      <WelcomeScreen
        onNewProject={handleStartNewProject}
        onManageProjects={handleOpenManagerFromWelcome}
      />
    );
  }

  // --- Main UI ---

  return (
    <div className="h-[100dvh] w-full bg-black text-neutral-200 font-mono flex flex-col overflow-hidden">

      {/* TOP BAR */}
      <header className="h-16 shrink-0 border-b border-neutral-800 flex items-center justify-between px-4 md:px-6 bg-neutral-950 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1 text-neutral-400 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <MenuIcon />
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Logo Integration */}
            <div
              onClick={() => setShowWelcome(true)} // Click logo to go home
              title="Back to Welcome Screen"
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Logo className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-[0.2em] text-white truncate hidden sm:block">CINESCRIPT<span className="text-neutral-600">.BV</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs tracking-widest uppercase">

          {/* INSTALL BUTTON (Only visible when prompt is available) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="hidden md:flex items-center gap-2 bg-cyan-900/30 text-cyan-400 border border-cyan-900/50 px-3 py-1.5 rounded hover:bg-cyan-900/50 transition-colors animate-pulse"
            >
              <DesktopDownIcon className="w-4 h-4" />
              <span className="font-bold">Install App</span>
            </button>
          )}

          <div className="flex flex-col text-right hidden lg:flex">
            <span className="text-neutral-500">Project</span>
            <span className="text-white font-bold truncate max-w-[150px]">{currentProject.name}</span>
          </div>
          <div className="flex flex-col text-right hidden xl:flex">
            <span className="text-neutral-500">Director</span>
            <span className="text-white font-bold truncate max-w-[120px]">{currentProject.director}</span>
          </div>
          <div className="flex flex-col text-right hidden xl:flex">
            <span className="text-neutral-500">DOP</span>
            <span className="text-white font-bold truncate max-w-[120px]">{currentProject.dop}</span>
          </div>

          <div className="flex items-center gap-1 md:gap-2 border-l border-neutral-800 pl-4 md:pl-6">
            <button
              onClick={() => setIsProjectManagerOpen(true)}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
              title="Switch / Manage Projects"
            >
              <FolderIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
              title="Project Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* SIDEBAR BACKDROP OVERLAY (Mobile only) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR: SCENES LIST */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-4/5 sm:w-80 bg-black border-r border-neutral-800 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:shadow-none
        `}>
          <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Scene List</h3>
            {/* Mobile Close Button */}
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-neutral-500 hover:text-white">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {currentProject.scenes.map(scene => (
              <div
                key={scene.id}
                onClick={() => {
                  setActiveSceneId(scene.id);
                  setIsSidebarOpen(false); // Close drawer on selection (mobile)
                }}
                className={`p-4 border-b border-neutral-900 cursor-pointer transition-colors group hover:bg-neutral-900 ${activeSceneId === scene.id ? 'bg-neutral-900 border-l-4 border-l-white' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`font-bold text-lg ${activeSceneId === scene.id ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                    {scene.number}
                  </span>
                  <span className="text-[10px] bg-neutral-800 px-1 py-0.5 text-neutral-400 rounded">{scene.shots.length} SHOTS</span>
                </div>
                <h4 className="text-sm font-medium truncate text-neutral-300 uppercase tracking-wide">{scene.title}</h4>
                <div className="flex gap-2 mt-2 text-[10px] text-neutral-600 uppercase tracking-wider">
                  <span>{scene.location}</span>
                  <span>•</span>
                  <span>{scene.timeOfDay}</span>
                </div>
              </div>
            ))}

            <button
              onClick={addScene}
              className="w-full p-4 text-center text-xs uppercase tracking-widest text-neutral-500 hover:text-white hover:bg-neutral-900 transition-colors border-b border-neutral-900 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" /> Add Scene
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT: SHOT LIST */}
        <main className="flex-1 bg-neutral-950 overflow-y-auto p-4 md:p-8 relative w-full">
          {currentScene ? (
            <div className="max-w-7xl mx-auto pb-20">
              {/* Scene Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-widest text-white">{currentScene.number} - {currentScene.title}</h2>
                  <div className="flex gap-4 text-xs text-neutral-500 mt-1 font-mono uppercase tracking-wide">
                    <span>{currentScene.location}</span>
                    <span>{currentScene.timeOfDay}</span>
                    <span>{currentScene.lighting}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSceneSettingsOpen(true)}
                  className="p-2 text-neutral-500 hover:text-white border border-transparent hover:border-neutral-800 rounded transition-all"
                >
                  <EditIcon />
                </button>
              </div>

              {/* SHOTS GRID */}
              <div className="grid gap-4">
                {currentScene.shots.map((shot) => (
                  <div
                    key={shot.id}
                    className="bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors group relative flex flex-col sm:flex-row overflow-hidden"
                  >
                    {/* Shot Image Preview */}
                    <div className="sm:w-48 aspect-video bg-black shrink-0 relative border-b sm:border-b-0 sm:border-r border-neutral-800">
                      {shot.imageUrl ? (
                        <img src={shot.imageUrl} alt={`Shot ${shot.number}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-800">
                          <FilmIcon className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 text-xs font-bold text-white border border-neutral-700">
                        #{shot.number}
                      </div>
                    </div>

                    {/* Shot Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-2 text-[10px] uppercase tracking-wider text-cyan-500 font-bold">
                          <span className="bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-900/50">{shot.size}</span>
                          <span className="bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-900/50">{shot.angle}</span>
                          <span className="bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-900/50">{shot.movement}</span>
                        </div>
                        <p className="text-neutral-300 text-sm mb-2 font-medium">{shot.description || "No description."}</p>
                        <p className="text-neutral-600 text-xs font-mono">{shot.lens} • {shot.camera} • {shot.fps}fps</p>
                      </div>

                      <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveShot(currentScene.id, shot.id, 'up')} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400">
                          <ChevronUpIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveShot(currentScene.id, shot.id, 'down')} className="p-1.5 hover:bg-neutral-800 rounded text-neutral-400">
                          <ChevronDownIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setActiveShot(shot)} className="p-1.5 hover:bg-neutral-800 rounded text-cyan-400">
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this shot?')) deleteShot(currentScene.id, shot.id);
                          }}
                          className="p-1.5 hover:bg-neutral-800 rounded text-red-400"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addShot(currentScene.id)}
                  className="w-full py-8 border-2 border-dashed border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900/20 text-neutral-500 hover:text-white transition-all flex flex-col items-center justify-center gap-2 uppercase text-xs tracking-widest font-bold"
                >
                  <PlusIcon className="w-6 h-6" />
                  Add New Shot
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-600">
              <FilmIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="uppercase tracking-widest text-sm">No Scene Selected</p>
              <button onClick={() => setIsSidebarOpen(true)} className="mt-4 md:hidden text-cyan-500 uppercase text-xs font-bold tracking-widest">
                Select from Menu
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {activeShot && (
        <ShotEditor
          shot={activeShot}
          onSave={handleSaveShot}
          onClose={() => setActiveShot(null)}
        />
      )}

      {isSettingsOpen && (
        <ProjectSettings
          project={currentProject}
          onSave={(p) => { updateProject(p); setIsSettingsOpen(false); }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isProjectManagerOpen && (
        <ProjectManager
          projects={projects}
          currentProjectId={currentProjectId}
          onSelect={(id) => {
            setCurrentProjectId(id);
            setIsProjectManagerOpen(false);
            // If we select a project, we stay in the app, no returning to welcome
            setReturnToWelcome(false);
          }}
          onCreate={() => {
            handleAddProject();
            setReturnToWelcome(false);
          }}
          onDelete={handleDeleteProject}
          onClose={() => {
            setIsProjectManagerOpen(false);
            // Go back to welcome screen only if we came from there
            if (returnToWelcome) {
              setShowWelcome(true);
              setReturnToWelcome(false);
            }
          }}
        />
      )}

      {isSceneSettingsOpen && currentScene && (
        <SceneSettings
          scene={currentScene}
          onSave={handleUpdateScene}
          onDelete={handleDeleteScene}
          onClose={() => setIsSceneSettingsOpen(false)}
        />
      )}

    </div>
  );
}

export default App;