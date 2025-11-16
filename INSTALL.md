# 📦 Installation Guide - NEON RUNNER

## For End Users (Playing the Game)

### Windows

**Option 1: Installer (Recommended)**
1. Download `NEON-RUNNER-Setup-1.0.0.exe` from Releases
2. Run the installer
3. Follow installation wizard
4. Launch from Start Menu or Desktop shortcut

**Option 2: Portable**
1. Download `NEON-RUNNER-1.0.0-portable.exe`
2. Place it anywhere on your computer
3. Run directly (no installation needed)

**Note:** Windows may show SmartScreen warning (app is unsigned). Click "More info" → "Run anyway"

---

### macOS

1. Download `NEON-RUNNER-1.0.0.dmg` from Releases
2. Open the DMG file
3. Drag "NEON RUNNER" to Applications folder
4. First launch: Right-click → "Open" (bypass Gatekeeper)
5. Subsequent launches: Normal double-click

**Requirements:** macOS 10.13 or newer

---

### Linux

**Option 1: AppImage (Universal)**
1. Download `NEON-RUNNER-1.0.0.AppImage`
2. Make it executable:
   ```bash
   chmod +x NEON-RUNNER-1.0.0.AppImage
   ```
3. Run:
   ```bash
   ./NEON-RUNNER-1.0.0.AppImage
   ```

**Option 2: Debian/Ubuntu (.deb)**
1. Download `neon-runner_1.0.0_amd64.deb`
2. Install:
   ```bash
   sudo dpkg -i neon-runner_1.0.0_amd64.deb
   ```
3. Run from Applications menu or:
   ```bash
   neon-runner
   ```

---

## For Developers (Building from Source)

### Prerequisites

1. **Node.js** 16 or higher
   - Windows: Download from https://nodejs.org/
   - macOS: `brew install node`
   - Linux: `sudo apt install nodejs npm`

2. **Git**
   - Windows: https://git-scm.com/download/win
   - macOS: `brew install git`
   - Linux: `sudo apt install git`

### Clone & Install

```bash
# 1. Clone repository
git clone https://github.com/Sylvester1979/Neon-Runner.git
cd Neon-Runner

# 2. Install dependencies
npm install

# This will download:
# - Electron (~200MB)
# - Electron Builder
# - Other dependencies
```

### Run in Development Mode

```bash
npm start
```

The game will open in an Electron window.

### Build Installers

```bash
# Build for your current platform
npm run build

# Platform-specific builds
npm run build:win     # Windows (requires Windows or Wine)
npm run build:mac     # macOS (requires macOS)
npm run build:linux   # Linux (works on any platform)

# Build all platforms (requires platform-specific tools)
npm run build:all
```

**Build outputs:** `dist/` folder

### Platform-Specific Build Requirements

**Building for Windows on non-Windows:**
- Install Wine: `brew install wine-stable` (macOS)

**Building for macOS on non-macOS:**
- Not possible without macOS or macOS VM

**Building for Linux:**
- Works on all platforms

---

## First Time Setup

### Adding Music (Optional)

1. Navigate to `game/assets/audio/`
2. Add these MP3 files:
   - `menu.mp3` - Main menu music
   - `era_8bit.mp3` - 8-bit era music
   - `era_16bit.mp3` - 16-bit era music
   - `era_neon.mp3` - Neon era music

3. Restart the app

**No music?** Game works perfectly without it!

### Customizing Icons (Developers)

1. Create your icons:
   - `build/icon.ico` (Windows) - 256x256
   - `build/icon.icns` (macOS) - 512x512
   - `build/icon.png` (Linux) - 512x512

2. Rebuild:
   ```bash
   npm run build
   ```

---

## Troubleshooting

### Installation Failed

**Windows:**
- Disable antivirus temporarily
- Run installer as Administrator
- Check disk space (need 200MB+)

**macOS:**
- Check Security & Privacy settings
- Allow apps from "App Store and identified developers"

**Linux:**
- Check dependencies: `ldd NEON-RUNNER-1.0.0.AppImage`
- Install missing libraries

### npm install Fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Build Fails

**Check Node.js version:**
```bash
node --version  # Should be 16+
```

**Update npm:**
```bash
npm install -g npm@latest
```

**Platform-specific issues:**
- Windows: Run as Administrator
- macOS: Install Xcode Command Line Tools
- Linux: Install build essentials (`sudo apt install build-essential`)

---

## Uninstallation

### Windows
- Control Panel → Programs → Uninstall "NEON RUNNER"
- Or portable: Just delete the .exe

### macOS
- Drag "NEON RUNNER" from Applications to Trash

### Linux
- AppImage: Delete the file
- Deb: `sudo apt remove neon-runner`

---

## Next Steps

✅ Installed? Great!
✅ Add music files (optional)
✅ Launch and play!

**Controls:**
- SPACE/UP - Jump
- DOWN - Slide
- P - Pause
- M - Mute

**Enjoy the game!** 🎮⚡
