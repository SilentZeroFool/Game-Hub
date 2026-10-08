# 🎮 Game Hub - Centralized Game Launcher & Analytics Dashboard

A modern, feature-rich game launcher dashboard built with React, TypeScript, and Tailwind CSS. **Game Hub** provides a unified platform to organize, launch, and track your gaming sessions across multiple platforms (Steam, Epic Games, GOG, and standalone executables).

> **Current Status**: This is a web prototype. For a production desktop application with true executable launching capabilities, deploy via **Tauri** framework.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Data Flow](#architecture--data-flow)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Desktop Deployment with Tauri](#desktop-deployment-with-tauri)
- [Contributing](#contributing)

---

## 🎯 Overview

**Game Hub** is a centralized gaming hub that solves the fragmentation problem of having games across multiple platforms. Instead of jumping between Steam, Epic Games Launcher, GOG Galaxy, and random standalone folders, Game Hub brings everything into one beautiful, organized dashboard.

### What's Actually Happening

```
┌─────────────────────────────────────────────────────────────┐
│                      GAME HUB                               │
│           (React + TypeScript Web Application)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Library    │  │   Statistics │  │   Settings   │     │
│  │    View      │  │   Dashboard  │  │    Panel     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                   STATE MANAGEMENT                          │
│                  (React Context API)                        │
│            Stores: Games | Sessions | Settings             │
├─────────────────────────────────────────────────────────────┤
│                   LOCAL STORAGE                             │
│         (Browser LocalStorage for Data Persistence)        │
│                                                             │
│  ├─ launcher_games    (Game library metadata)              │
│  ├─ launcher_sessions (Play session history)               │
│  ├─ launcher_theme    (User theme preference)              │
│  └─ launcher_settings (User app settings)                  │
└─────────────────────────────────────────────────────────────┘
```

**In the browser web version:**
- Games are stored in browser's LocalStorage (survives page refreshes)
- Game launching is **simulated** (shows a notification instead of actually running the executable)
- Full UI/UX functionality is available for testing

**In the Tauri desktop version:**
- All data is synced to the desktop application's secure storage
- **True executable launching** using the Tauri shell API
- Native desktop integration (taskbar, system tray, file dialogs)

---

## ✨ Key Features

### 📚 Game Library Management
- ✅ **Add/Edit/Delete Games** - Manage your entire game collection
- ✅ **Drag & Drop Reorganization** - Reorder games using intuitive drag-and-drop (powered by `@dnd-kit`)
- ✅ **Multi-Platform Support** - Steam, Epic Games, GOG, and standalone executables
- ✅ **Cover Art Display** - Add custom cover images for each game
- ✅ **Categories** - Organize games by genre (RPG, Action, Simulation, etc.)
- ✅ **Favorites System** - Star your most-played games for quick access

### ⏱️ Playtime Tracking & Analytics
- ✅ **Session Recording** - Automatically track when you start and stop playing
- ✅ **Playtime Statistics** - Visual charts showing:
  - Total hours played per game
  - Playtime trends over time (recharts visualization)
  - Most-played games ranking
  - Weekly/monthly gaming activity
- ✅ **Active Session Monitoring** - See which game is currently running

### 🎨 Customization & UX
- ✅ **Multiple Themes** - System, Light, Dark, and Neon themes
- ✅ **Responsive Design** - Works on desktop and tablet
- ✅ **Smooth Animations** - Modern UI with Framer Motion
- ✅ **User Settings**:
  - Show playtime on game cards
  - Close on launch (Tauri only)
  - Start with Windows (Tauri only)

### 🔌 Extensibility
- ✅ **Tauri Integration** - Ready for desktop deployment with native system APIs
- ✅ **AI-Ready** - Includes Gemini AI API integration points for future smart features
- ✅ **TypeScript** - Full type safety across the codebase

---

## 🏗️ Architecture & Data Flow

### Component Hierarchy

```
App (AppProvider wrapper)
├── Dashboard (Main container)
│   ├── Sidebar (Navigation)
│   │   └── Tab buttons (Library, Stats, Settings)
│   │
│   └── Main Content Area
│       ├── [LIBRARY VIEW]
│       │   ├── GameGrid
│       │   │   ├── GameCard (Draggable items)
│       │   │   │   ├── Cover image
│       │   │   │   ├── Title + Platform badge
│       │   │   │   ├── Playtime display (conditional)
│       │   │   │   ├── Favorite button
│       │   │   │   └── Action buttons (Edit, Delete, Play)
│       │   │   └── Empty state (if no games)
│       │   │
│       │   └── GameModal (Add/Edit form)
│       │       ├── Title input
│       │       ├── Platform selector
│       │       ├── Category input
│       │       ├── Cover URL input
│       │       ├── Executable path input (with file browse)
│       │       └── Launch method selector
│       │
│       │
│       ├── [STATS VIEW]
│       │   └── StatsDashboard
│       │       ├── Total playtime card
│       │       ├── Most played game card
│       │       ├── Bar chart (Hours per game)
│       │       ├── Line chart (Playtime trend)
│       │       └── Recent sessions list
│       │
│       └── [SETTINGS VIEW]
│           ├── Preferences toggles
│           └── About & Setup instructions
│
└── ActiveSessionModal
    └── Shows live session timer when game is running
```

### Data Flow (State Management)

```
┌─────────────────────┐
│   User Actions      │
│ (Click, Input, etc) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│     React Context API                   │
│     (AppContext.tsx)                    │
│                                         │
│  State:                                 │
│  ├─ games: Game[]                       │
│  ├─ sessions: PlaySession[]             │
│  ├─ theme: Theme                        │
│  ├─ userSettings: UserSettings          │
│  ├─ activeSession: Current session      │
│  └─ editingGame: Game being edited      │
│                                         │
│  Functions:                             │
│  ├─ addGame()         Add new game      │
│  ├─ updateGame()      Modify existing   │
│  ├─ removeGame()      Delete game       │
│  ├─ reorderGames()    Update order      │
│  ├─ startGame()       Begin session     │
│  ├─ stopGame()        End session       │
│  ├─ setTheme()        Change theme      │
│  └─ updateUserSettings() Prefs          │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│     Browser LocalStorage                │
│                                         │
│  Persisted Data:                        │
│  └─ launcher_games                      │
│  └─ launcher_sessions                   │
│  └─ launcher_theme                      │
│  └─ launcher_settings                   │
│                                         │
│  (Survives page refresh)                │
└─────────────────────────────────────────┘
```

### Data Types

```typescript
// A game in your library
interface Game {
  id: string;                    // Unique identifier
  title: string;                 // Game name
  platform: 'steam' | 'epic' | 'gog' | 'other';
  coverUrl: string;              // URL to cover art
  executablePath: string;        // Path or URI to launcher
  launchMethod?: LaunchMethod;   // How to launch the game
  addedAt: number;              // Timestamp when added
  isFavorite?: boolean;         // Starred/favorited?
  category?: string;            // Genre classification
}

// A recorded play session
interface PlaySession {
  id: string;
  gameId: string;               // Links to a Game
  startTime: number;            // When you started
  endTime: number;              // When you stopped
  duration: number;             // Total seconds played
}

// User preferences
interface UserSettings {
  closeOnLaunch: boolean;        // Close app when launching game
  startWithWindows: boolean;     // Auto-start on boot (Tauri)
  showPlaytimeOnCard: boolean;   // Display hours on cards
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** 16+ and **npm** or **bun** package manager
- **Bun** (recommended for faster builds, or use npm/yarn)

### Quick Start

#### 1. Clone the Repository
```bash
git clone https://github.com/SilentZeroFool/Game-Hub.git
cd Game-Hub
```

#### 2. Install Dependencies
```bash
# Using bun (faster)
bun install

# OR using npm
npm install
```

#### 3. Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your configuration
# For web version, these are optional
# For Tauri/Cloud deployment, these are required
```

**Environment variables:**
- `GEMINI_API_KEY` - For AI-powered features (optional for web version)
- `APP_URL` - Base URL of deployed app (needed for Tauri)

#### 4. Run Development Server
```bash
# Start dev server on http://localhost:3000
bun run dev

# OR with npm
npm run dev
```

The app will open at `http://localhost:3000` and hot-reload on file changes.

#### 5. Build for Production
```bash
# Build optimized bundle
bun run build

# OR with npm
npm run build

# Preview the production build locally
bun run preview
```

---

## 📖 Usage Guide

### 🎮 Managing Your Game Library

#### **Adding a Game**
1. Click the **"Add Game"** button (top right of Library view)
2. Fill in the game details:
   - **Title** - Game name (required)
   - **Platform** - Where it's available (Steam, Epic, GOG, Other)
   - **Category** - Genre for organization (RPG, Action, etc.)
   - **Cover Image URL** - Link to game art (optional)
   - **Executable Path** - Path to launcher (optional in web, required for Tauri)
   - **Launch Method** - How to launch (see below)
3. Click **"Add Game"**

**Launch Methods Explained:**
- **Standard (cmd start)** ⭐ Recommended for most games
- **Direct Process** - For Unity games or problematic launchers
- **Explorer Shell** - Alternative method using Windows Explorer
- **Tauri Shell** - For Tauri desktop builds

#### **Editing a Game**
1. Hover over a game card and click **Edit** (pencil icon)
2. Modify any field
3. Click **"Save Changes"**

#### **Deleting a Game**
1. Hover over a game card and click **Delete** (trash icon)
2. Confirm deletion

#### **Reordering Games**
- **Drag & Drop** any game card to reorder your library
- Order is automatically saved to LocalStorage

#### **Marking Favorites**
- Click the **star icon** on any game card to mark as favorite
- Favorites appear at the top of your library

---

### 📊 Viewing Statistics

Navigate to the **Statistics** tab to see:

1. **Overview Cards**
   - Total playtime across all games (sum of all sessions)
   - Most-played game with total hours
   - Total number of games in library
   - Total sessions recorded

2. **Hours per Game** (Bar Chart)
   - Shows ranking of games by playtime
   - Hover to see exact hours

3. **Playtime Trend** (Line Chart)
   - Visual representation of your gaming activity over time
   - Helps identify patterns and trends

4. **Recent Sessions** (Table)
   - List of last 10 play sessions
   - Date, game title, duration
   - Most recent first

---

### ⚙️ Customizing Settings

Navigate to **Settings** to adjust:

#### **Preferences**
- **Show Playtime on Cards** - Display total hours on game cards in library view
- **Close on Launch** - Automatically close Game Hub when starting a game (Tauri desktop only)
- **Start with Windows** - Auto-launch Game Hub on system startup (Tauri desktop only)

#### **Theme Selection**
Via the Sidebar (currently supports: System, Light, Dark, Neon)

#### **About Section**
Contains important information about:
- What this app does in browser vs. desktop versions
- Instructions for local testing with Tauri
- Links to relevant documentation

---

### ▶️ Playing Games

#### **In Web Version (Browser)**
1. Click the **"Play"** button on any game card (in Library view)
2. A **session modal** appears showing:
   - Game title and cover
   - "Game launched!" message
   - Live timer showing session duration
   - "Stop Playing" button
3. Click **"Stop Playing"** to end the session
4. Session is recorded and visible in Statistics

> **Note**: The web version simulates launching. It doesn't actually run executables (because browsers can't for security reasons).

#### **In Tauri Desktop Version**
1. Click the **"Play"** button
2. The Tauri shell API launches the actual game executable
3. Session timer starts in Game Hub
4. When you close the game, click "Stop Playing" to log the session
5. (Optional) If "Close on Launch" is enabled, Game Hub minimizes automatically

---

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **React Context API** - State management
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization charts
- **Framer Motion** - Smooth animations
- **dnd-kit** - Drag-and-drop functionality

### Backend / Desktop
- **Tauri** - Desktop app framework (for production builds)
- **Express** - Potential backend API server
- **Gemini AI API** - For future AI features

### Development
- **TypeScript** - Type checking
- **ESBuild** - Fast bundler
- **Tailwind CSS** - Styling
- **Vite** - Dev server and build tool

### Storage
- **Browser LocalStorage** - Client-side persistence (web version)
- **Tauri Storage** - Secure desktop storage (Tauri version)

---

## 📁 Project Structure

```
Game-Hub/
├── src/
│   ├── main.tsx                 # React entry point
│   ├── App.tsx                  # Main app component & dashboard layout
│   ├── index.css               # Global styles
│   ├── types.ts                # TypeScript type definitions
│   │
│   ├── context/
│   │   └── AppContext.tsx       # State management (games, sessions, settings)
│   │
│   ├── components/
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── GameGrid.tsx         # Grid layout with dnd-kit support
│   │   ├── GameCard.tsx         # Individual game card component
│   │   ├── GameModal.tsx        # Add/Edit game form modal
│   │   ├── StatsDashboard.tsx   # Charts and statistics view
│   │   └── ActiveSessionModal.tsx # Live session tracker
│   │
│   └── lib/
│       └── utils.ts            # Utility functions
│
├── index.html                   # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies & scripts
├── .env.example                # Environment variables template
├── README.md                   # This file
└── assets/                     # Static assets (if any)
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main dashboard component, tab routing, UI layout |
| `src/context/AppContext.tsx` | Centralized state management using React Context |
| `src/components/GameGrid.tsx` | Renders draggable game cards grid |
| `src/components/GameModal.tsx` | Form for adding/editing games with file browser |
| `src/components/StatsDashboard.tsx` | Charts and analytics visualizations |
| `vite.config.ts` | Build tool configuration |
| `package.json` | Dependencies and NPM scripts |

---

## ⚙️ Configuration

### Vite Config
The `vite.config.ts` includes:
- React Fast Refresh plugin
- TypeScript support
- Optimized build settings

### TypeScript Config
`tsconfig.json` specifies:
- ES2020 target
- React JSX mode
- Strict type checking

### Environment Variables (.env)
Create a `.env` file in the root:
```dotenv
# Gemini AI API Key (for future AI features)
GEMINI_API_KEY=your_api_key_here

# App URL (for Tauri/Cloud deployments)
APP_URL=https://your-app-domain.com
```

---

## 🖥️ Desktop Deployment with Tauri

### What is Tauri?

**Tauri** is a framework that wraps a web app (like this one) into a native desktop application with system APIs. Unlike Electron, it's much lighter and more secure.

### Why Use Tauri?

In the web version, launching games is simulated (security sandbox). With Tauri, you get:
- ✅ **Real executable launching** - Actually run game executables
- ✅ **Native integration** - Taskbar, system tray, file dialogs
- ✅ **Smaller app size** - ~40MB vs ~200MB (Electron)
- ✅ **Better performance** - Uses system WebView
- ✅ **Secure APIs** - Only enabled features are available

### Setting Up Tauri Locally

#### Prerequisites
- Rust toolchain installed ([https://www.rust-lang.org/](https://www.rust-lang.org/))
- Windows/macOS/Linux development environment

#### Step 1: Initialize Tauri
```bash
# From the Game-Hub directory
npx tauri init \
  --app-name 'GameHub' \
  --window-title 'Game Hub' \
  --frontend-dist '../dist' \
  --dev-url 'http://localhost:3000' \
  --before-build-command 'npm run build'
```

#### Step 2: Add Required Plugins
```bash
# Dialog plugin for file browsing
npx tauri add dialog

# Shell plugin for launching games
npx tauri add shell
```

#### Step 3: Configure Capabilities
Edit `src-tauri/capabilities/default.json` to enable shell access:
```json
{
  "identifier": "shell:allow-open",
  "allow": [{ "path": "**" }]
}
```

#### Step 4: Run in Development
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run Tauri dev
npm run tauri dev
```

This opens the native desktop window connected to your dev server with hot-reload.

#### Step 5: Build for Distribution
```bash
npm run tauri build
```

Creates an installer in `src-tauri/target/release/bundle/`.

#### 🤖 Automated Builds via GitHub Actions
We've set up two automated CI/CD pipelines using GitHub Actions so you can test both approaches:

1. **Option A: Pure Native Windows (.NET 8 & WebView2 - No Tauri / No Rust)**
   - Located at: `.github/workflows/build-pure-exe.yml`
   - Produces two single-file executables:
     - `GameHub-Standalone.exe`: Self-contained with zero runtime dependencies.
     - `GameHub-Lightweight.exe`: Ultra-compact executable using the OS .NET runtime.
   - Built with Microsoft Edge WebView2, native Windows file dialogs, and isolated shell execution.
   - Download artifact: **`GameHub-Pure-Native-Standalone`** or **`GameHub-Pure-Native-Lightweight`**

2. **Option B: Tauri v2 Windows (.exe)**
   - Located at: `.github/workflows/build-exe.yml`
   - Built with Tauri v2 and Rust backend.
   - Download artifact: **`GameHub-Tauri-Exe`**

To download either build:
1. Go to the **Actions** tab on your GitHub repository.
2. Select either **"Build Pure Native Windows Executable (.exe)"** or **"Build Windows Executables (.exe)"**.
3. Click the latest run and download the corresponding artifact! You can also trigger the Native workflow manually with the "Publish as a GitHub Release draft" checkbox enabled to draft a release.

---

## 📝 Available Scripts

### Development
```bash
npm run dev          # Start dev server (port 3000)
npm run lint         # TypeScript type check
npm run tauri        # Access tauri CLI
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview prod build locally
npm run clean        # Remove dist/ and build artifacts
```

---

## 🎯 Use Cases

### For Gamers
- 🎮 Consolidate games from multiple platforms into one launcher
- 📊 Track your gaming habits and identify most-played games
- 🎨 Customize themes and organize by category
- ⚡ Quick game launching from one place

### For Developers
- 💻 Learn React, TypeScript, and Tauri integration
- 🏗️ Use as a boilerplate for desktop applications
- 🔧 Extend with custom game APIs or analytics backends
- 📚 Study state management patterns with React Context

### For Game Publishers
- 🎯 Integrate with custom game launching protocols
- 📈 Collect anonymized gameplay statistics
- 🔗 Create branded versions for your platform

---

## 🐛 Troubleshooting

### Games won't launch in web version
✅ **Expected behavior** - The web version simulates launching for security reasons. Use Tauri for real launching.

### Settings/Games lost after refresh
❌ **Issue**: Browser data cleared or incognito mode
✅ **Solution**: 
- Use normal browsing mode (not private/incognito)
- Check browser storage settings
- Export/backup your game list

### Executable path not working in Tauri
❌ **Issue**: Wrong launch method or insufficient permissions
✅ **Solutions**:
1. Try different launch methods (cmd_start, direct, explorer, tauri_shell)
2. Ensure the executable path is correct and accessible
3. Run Tauri as Administrator (if needed)
4. Check `src-tauri/capabilities/default.json` includes shell:allow-open

### Windows Defender flags the Game Hub .exe
❌ **Issue**: Windows Defender SmartScreen blocks the application or flags it as malicious.
✅ **Solution**: 
- This is entirely normal for custom `.exe` files built from GitHub Actions that aren't digitally signed with an EV Code Signing certificate.
- Click **"More info"** and then **"Run anyway"** in the SmartScreen prompt.
- If Windows Defender quarantines the file, go to Windows Security > Virus & threat protection > Protection history, restore the file, and add it to your exclusions list.

### Drag-and-drop not working
❌ **Issue**: dnd-kit needs proper DOM structure
✅ **Solution**: 
- Clear browser cache
- Check browser console for errors
- Ensure you're on a supported browser (Chrome, Firefox, Safari)

### Slow performance with many games
⚡ **Optimization tips**:
- Reduce number of games in library (test with 50 or fewer)
- Disable animations in Settings (if available in future updates)
- Use a modern browser (Chrome 90+, Firefox 88+)
- Clear LocalStorage if corrupted

---

## 📈 Future Roadmap

Planned features for future versions:

- 🤖 **AI Game Recommendations** - Using Gemini API
- ☁️ **Cloud Sync** - Sync library across devices
- 🎮 **Game News Integration** - In-app game news
- 🏆 **Achievement Tracking** - Platform integration
- 🎥 **Screenshot/Video Capture** - Built-in game captures
- 🌐 **Multiplayer Session Invites** - Invite friends to play
- 🔌 **Plugin System** - Community extensions

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Tips
- Follow TypeScript and React best practices
- Use Tailwind CSS for styling
- Test with multiple games before submitting PR
- Update type definitions in `src/types.ts` if adding features

---

## 📄 License

This project is part of the Google AI Studio template repository. See LICENSE for details.

---

## 🎓 Learning Resources

- **Tauri Docs**: https://v2.tauri.app/
- **React Context API**: https://react.dev/reference/react/useContext
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev/

---

## 📧 Support & Questions

- **Issues**: [GitHub Issues](https://github.com/SilentZeroFool/Game-Hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/SilentZeroFool/Game-Hub/discussions)
- **Email**: Contact via GitHub profile

---

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) and [React 19](https://react.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Desktop framework [Tauri](https://tauri.app/)
- Charts powered by [Recharts](https://recharts.org/)

---

**Made with ❤️ for gamers and developers**

*Game Hub - Your Gaming, Organized.*
