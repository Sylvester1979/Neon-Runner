# 🎮 NEON RUNNER - Professional Desktop Game

**An 80s Cyberpunk Endless Runner - Built with Electron + Phaser 3**

A professional desktop application featuring era-shifting mechanics through three distinct visual styles:
- **8-BIT ERA** - Retro pixel art nostalgia
- **16-BIT ERA** - Enhanced console graphics
- **NEON ERA** - Full cyberpunk visual spectacle

![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=for-the-badge)
![Built with](https://img.shields.io/badge/Built%20with-Electron%20%2B%20Phaser%203-blueviolet?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

---

## 🖥️ Desktop Application Features

✅ **Native desktop app** - Not a browser game!
✅ **Cross-platform** - Windows, macOS, Linux
✅ **Professional packaging** - Installers & portable versions
✅ **Application menus** - Full desktop integration
✅ **Keyboard shortcuts** - Desktop-optimized controls
✅ **Offline play** - No internet required
✅ **High performance** - Native window rendering
✅ **Desktop-only** - Optimized for keyboard gameplay

---

## 🚀 Quick Start

### For Users (Play the Game):

1. **Download the installer** for your platform from Releases
2. **Install and run!**
3. **Play!** Use keyboard controls

### For Developers (Build from Source):

```bash
# 1. Clone repository
git clone https://github.com/Sylvester1979/Neon-Runner.git
cd Neon-Runner

# 2. Install dependencies
npm install

# 3. Run in development mode
npm start
```

---

## 🛠️ Build Installers

```bash
# Build for current platform
npm run build

# Build for specific platform
npm run build:win    # Windows (.exe installer + portable)
npm run build:mac    # macOS (.dmg)
npm run build:linux  # Linux (.AppImage + .deb)

# Build for all platforms
npm run build:all
```

**Output:** Installers in `dist/` folder

---

## 🎮 Controls

### Keyboard (Desktop Only)
- `SPACE` or `UP ARROW` - Jump (can double-jump!)
- `DOWN ARROW` - Slide
- `P` - Pause game
- `M` - Mute/unmute audio

### Application Menu Shortcuts
- `Ctrl+N` / `Cmd+N` - New Game
- `F11` - Fullscreen
- `Ctrl+Q` / `Cmd+Q` - Quit
- `H` - Show hitboxes (debug)
- `F` - Show FPS counter
- `I` - Invincibility mode (debug)

---

## 🎨 Game Features

### Era-Shifting Mechanics
Cycles through 3 visual eras every 10 seconds:

**8-BIT ERA** - Game Boy aesthetics, chiptune music
**16-BIT ERA** - Console graphics, FM synthesis
**NEON ERA** - Full cyberpunk, synthwave music

### Scoring
- Distance: +1 per 10 pixels
- Era Survival: +100 per era
- Perfect Dodge: +10 points
- Combos: x2/x3 multiplier

### Difficulty
- Speed increases every 10s (400 → 800 max)
- Obstacles spawn faster over time
- Brief invincibility on era transitions

---

## 🎵 Adding Music (Optional)

1. Create 4 MP3 files (128 BPM, 45-60s each)
2. Place in `game/assets/audio/`:
   - `menu.mp3`
   - `era_8bit.mp3`
   - `era_16bit.mp3`
   - `era_neon.mp3`
3. Restart app

**See `game/assets/audio/README.md` for Suno AI prompts**

---

## 📁 Project Structure

```
NEON-RUNNER/
├── main.js              # Electron main process
├── preload.js          # Electron preload script
├── package.json        # Dependencies & build config
├── build/              # App icons (add your own)
└── game/               # Game files
    ├── index.html
    ├── style.css
    ├── assets/audio/   # Music files (optional)
    └── src/            # Game source code
```

---

## 🔧 Technical Details

**Built With:**
- Electron ^28.0.0
- Phaser 3 ^3.70.0
- Electron Builder

**Requirements:**
- Windows 10+, macOS 10.13+, Ubuntu 18.04+
- 2GB RAM minimum
- WebGL support
- 150MB storage

**Performance:**
- 60 FPS target
- 1280x720 fixed resolution
- <150MB memory usage

---

## 🐛 Troubleshooting

**Game won't start:**
- Install Node.js 16+
- Run `npm install`
- Try `npm start`

**No music:**
- Add MP3 files to `game/assets/audio/`
- Check exact filenames (case-sensitive)

**Performance issues:**
- Update graphics drivers
- Close other apps
- Try windowed mode

---

## 📝 License

MIT License - Free to modify and distribute!

---

## 🙏 Credits

- Phaser 3 by Photon Storm
- Electron by OpenJS Foundation
- 80s cyberpunk inspired design

---

## 🎮 Enjoy!

**Built for desktop gamers. May your reflexes be sharp!** ⚡
