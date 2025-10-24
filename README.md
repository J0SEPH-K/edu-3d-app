# 3D Educational Model Generator

A cross-platform educational application built with React and Electron that provides interactive 3D visualization of chemical compounds and molecules. The application is designed for chemistry education and allows users to explore molecular structures in a 3D environment.

## Features

- **Interactive 3D Molecular Visualization**: View chemical compounds in 3D with smooth rotation animations
- **Multiple Data Sources**: Fetches molecular data from PubChem and ChemSpider databases
- **GIF Export**: Create animated GIFs of rotating molecules for presentations and sharing
- **Cross-Platform Desktop App**: Runs on Windows, macOS, and Linux via Electron
- **Real-time Search**: Search for compounds by name, formula, or chemical structure
- **Educational Interface**: Clean, user-friendly interface designed for educational use

## Quick Start

### Prerequisites

The following software must be installed before setting up the project:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/J0SEPH-K/edu-3d-app.git
   cd edu-3d-app
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Install server dependencies** (if using the express server)
   ```bash
   cd server
   npm install
   cd ..
   ```

## Running the Application

### Development Mode

To run the application in development mode with hot reloading:

```bash
npm start
```

This command will:
- Start the React development server on `http://localhost:3000`
- Launch the Electron desktop application
- Enable hot reloading for both React and Electron

### Individual Components

You can also run components separately:

**React Frontend Only:**
```bash
npm run react-start
```

**Electron Only:** (after building the React app)
```bash
npm run electron
```

**Express Server:** (optional, for additional backend features)
```bash
cd server
node index.js
```

## Building for Production

### Build React App
```bash
cd frontend
npm run build
cd ..
```

### Create Desktop Distribution
```bash
npm run dist
```

This will create platform-specific installers in the `dist/` folder:
- **macOS**: `.dmg` file
- **Windows**: `.exe` installer (if built on Windows)
- **Linux**: `.AppImage` (if built on Linux)

## Project Structure

```
edu-3d-app/
├── electron-main/           # Electron main process
│   └── main.js             # Main Electron configuration
├── frontend/               # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # React source code
│   │   ├── App.js         # Main React component
│   │   ├── ChemistryViewer.jsx  # 3D molecular viewer
│   │   └── ...
│   ├── build/             # Production build output
│   └── package.json       # Frontend dependencies
├── server/                # Optional Express server
│   ├── index.js          # Server entry point
│   └── routes/           # API routes
├── package.json          # Root dependencies and scripts
└── README.md            # This file
```

## Usage Instructions

1. **Launch the Application**
   - Run `npm start` for development
   - Or open the built desktop application

2. **Search for a Molecule**
   - Enter a chemical name (e.g., "caffeine", "water", "glucose")
   - Or enter a chemical formula (e.g., "H2O", "C8H10N4O2")
   - The app will search multiple databases to find the compound

3. **Interact with the 3D Model**
   - The molecule will automatically rotate
   - View the 3D structure with stick and sphere representation
   - Different colors represent different elements

4. **Export as GIF**
   - Click the "Save as GIF" button
   - The app will generate an animated GIF of the rotating molecule
   - Suitable for presentations or sharing

## Technologies Used

### Frontend
- **React 19.1.0** - UI framework
- **3Dmol.js** - 3D molecular visualization library
- **Three.js & React Three Fiber** - 3D graphics and rendering
- **GIF.js** - GIF generation and export

### Desktop Application
- **Electron 30.5.1** - Cross-platform desktop framework
- **Electron Builder** - Application packaging and distribution

### Backend (Optional)
- **Express.js** - Web server framework
- **CORS** - Cross-origin resource sharing

### Data Sources
- **PubChem API** - Chemical compound database
- **ChemSpider API** - Chemical structure database
- **CACTUS NCI** - Chemical identifier resolver

## Configuration

### Electron Configuration
The Electron configuration is in `electron-main/main.js`. You can modify:
- Window size and properties
- Security settings
- File associations

### React Configuration
The React app configuration is in `frontend/package.json`. Key settings:
- Build output directory
- Dependencies and scripts
- Electron builder settings

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   # Clean install all dependencies
   rm -rf node_modules frontend/node_modules
   npm install
   cd frontend && npm install
   ```

2. **Electron not starting**
   ```bash
   # Ensure React build exists
   cd frontend
   npm run build
   cd ..
   npm run electron
   ```

3. **3D models not loading**
   - Check internet connection (required for chemical database APIs)
   - Try searching with different compound names or formulas
   - Some compounds may not be available in the databases

4. **GIF export not working**
   - Ensure the `gif.worker.js` file is in the `public` folder
   - Check browser console for errors
   - Try with simpler molecular structures first

### Network Requirements

The application requires internet access to:
- Fetch molecular data from PubChem and ChemSpider APIs
- Download 3D molecular structures
- Resolve chemical names and formulas


## Acknowledgments

- **3Dmol.js** - 3D molecular visualization library
- **PubChem** - Chemical database
- **React and Electron communities** - Framework support
- **Educational community** - Feedback and requirements