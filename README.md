# 🎬 CineScript BV

<div align="center">
  <img src="public/image.png" alt="CineScript Banner" width="100%" />
  <br/>
  <p>
    <b>Advanced Film Production Management & AI Visualization Tool</b>
  </p>
</div>

---

CineScript BV is a cutting-edge desktop application designed to streamline the pre-production process for filmmakers, directors, and cinematographers. Built with Electron and React, it combines powerful project management tools with advanced AI capabilities to help you visualize and organize your creative vision.

Whether you are planning a short film or a feature-length movie, CineScript BV provides the tools to manage scenes, design detailed shot lists, and leverage Google's Gemini AI for instant visual references.

✨ Key Features

- 🗂️ Project Management: seamless organization of multiple film projects.
- 🎥 Shot Editor: Comprehensive shot planning with customizable fields for:
  - Shot Size (Wide, Close-up, etc.)
  - Shot Type (Static, Pan, Dolly, etc.)
  - Lens Selection
  - Camera Movement
- 🎬 Scene Settings: Detailed configuration for scene parameters.
- 🤖 AI Integration: Powered by Google Gemini 3, enabling:
  - Text-to-Image generation for shot visualization.
  - Intelligent suggestions for shot composition.
- 📤 Export Capabilities: Generate production-ready CSV exports and shot lists.
- 🎨 Modern UI: A sleek, dark-mode interface designed for creative focus, built with Tailwind CSS.

🛠️ Tech Stack

- Core Framework: [Electron]( ) (Desktop Runtime)
- Frontend Library: [React]( )
- Language: [TypeScript]( )
- Build Tool: [Vite]( )
- Styling: [Tailwind CSS]( )
- AI Service: [Google Gemini API]( ) (@google/genai)

 🚀 Installation & Setup

Follow these steps to set up the project locally.

 Prerequisites

- Node.js (v16 or higher recommended)
- npm (Node Package Manager)

1. Clone the Repository

```bash
git clone https://github.com/yourusername/cinescript-bv.git
cd cinescript-bv/CINESCRIPT_DESKTOP
```

 2. Install Dependencies

```bash
npm install
```

3. Run Locally (Development)

To start the application in development mode with hot-reloading:

```bash
npm run electron:dev
```

4. Build for Production

To create a distributable installer for your operating system (Windows/Mac/Linux):

```bash
npm run package
```
The output will be located in the `release/` directory.

📂 Project Structure

```plaintext
CINESCRIPT_DESKTOP/
├── electron/           # 🖥️ Electron main process and preload scripts
│   ├── main.cjs        # Main entry point for Electron
│   └── preload.cjs     # Preload script for IPC communication
├── components/         # 🧩 React UI Components
│   ├── ShotEditor.tsx      # Main shot editing interface
│   ├── ProjectSettings.tsx # Project configuration
│   ├── SceneSettings.tsx   # Scene details
│   └── ...
├── services/           # ⚙️ Business Logic & Services
│   ├── geminiService.ts    # AI integration logic
│   └── exportService.ts    # Data export functionality
├── App.tsx             # ⚛️ Main React Application component
├── types.ts            # 📝 TypeScript type definitions
├── vite.config.ts      # ⚡ Vite configuration
└── package.json        # 📦 Dependencies and scripts
```

📖 Usage Guide

1.  Start a Project: Launch CineScript BV and select "New Project" or open an existing one.
2.  Configure Scenes: Navigate to Scene Settings to define the location, time of day, and script notes.
3.  Create Shots: Go to the Shot Editor. Add new shots and define their technical specifications (Lens, Angle, Movement).
4.  Visualize with AI:
    *   Click the "Generate Image" button in the Shot Editor.
    *   Enter a prompt describing the shot.
    *   Let Gemini AI generate a visual reference for your storyboard.
      
    > Note: You need a valid Google Gemini API key to use the AI features.
    
6.  Export: Use the Project Settings to export your shot list as a CSV file for your crew.

🤝 Contributing
Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch. 
3.  Commit your changes.
4.  Push to the branch. 
5.  Open a Pull Request.

📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by the CineScript Team</sub>
</div>
