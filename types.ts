export interface Project {
  id: string;
  name: string;
  description?: string;
  director: string;
  dop: string; // Director of Photography
  scenes: Scene[];
  createdAt: number;
}

export interface Scene {
  id: string;
  number: string; // e.g. "12A"
  title: string;
  location: string;
  timeOfDay: 'INT' | 'EXT';
  lighting: 'DAY' | 'NIGHT' | 'MAGIC HOUR' | 'ARTIFICIAL';
  shots: Shot[];
}

export interface Shot {
  id: string;
  number: number;

  // Cinematic Composition
  size: ShotSize;
  angle: CameraAngle;
  movement: CameraMovement;
  framing: ShotFraming;
  focus: FocusType;

  description: string;
  notes: string;
  imageUrl?: string; // Base64 or URL

  // Technical specs
  lens: string; // e.g., "35mm"
  camera: string; // e.g., "Arri Alexa Mini"
  aperture: string; // e.g., "T2.8"
  fps: number;
  resolution: string; // e.g., "4K"
  colorTemp: string; // e.g., "5600K"

  // Assistant Director fields
  timecode?: string; // Timecode reference
  takes?: number; // Number of takes
  status?: string; // Shot status (e.g., "Complete", "In Progress")
  adNotes?: string; // AD notes/references
}

export enum ShotSize {
  ELS = 'Extreme Long Shot',
  LS = 'Long Shot',
  MLS = 'Medium Long Shot',
  MS = 'Medium Shot',
  MCU = 'Medium Close-Up',
  CU = 'Close-Up',
  ECU = 'Extreme Close-Up'
}

export enum CameraAngle {
  OVERHEAD = "Bird's Eye / Overhead",
  HIGH = 'High Angle',
  EYE_LEVEL = 'Eye Level',
  LOW = 'Low Angle',
  WORMS_EYE = "Worm's Eye",
  DUTCH = 'Dutch Angle'
}

export enum CameraMovement {
  STATIC = 'Static',
  PAN = 'Pan',
  TILT = 'Tilt',
  DOLLY_IN = 'Dolly In',
  DOLLY_OUT = 'Dolly Out',
  ZOOM_IN = 'Zoom In',
  ZOOM_OUT = 'Zoom Out',
  TRACKING = 'Tracking',
  CRANE = 'Crane',
  STEADICAM = 'Steadicam',
  HANDHELD = 'Handheld'
}

export enum ShotFraming {
  SINGLE = 'Single / Standard',
  TWO_SHOT = 'Two-Shot',
  OTS = 'Over the Shoulder',
  POV = 'Point of View',
  INSERT = 'Insert Shot'
}

export enum FocusType {
  STANDARD = 'Standard',
  DEEP = 'Deep Focus',
  RACK = 'Rack Focus',
  SHALLOW = 'Shallow Focus'
}