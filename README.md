# 🎮 NEON RUNNER

**An 80s Cyberpunk Endless Runner with Era-Shifting Mechanics**

Experience a thrilling endless runner that cycles through three distinct visual eras every 10 seconds:
- **8-BIT ERA** - Retro pixel art with limited colors
- **16-BIT ERA** - Enhanced sprites with richer palettes
- **NEON ERA** - Full vector graphics with stunning glow effects

![Game Banner](https://img.shields.io/badge/Built%20with-Phaser%203-blueviolet?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Playable-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🚀 Quick Start

### Play Now!

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd Neon-Runner
   ```

2. **Open the game**
   - Navigate to `game/index.html`
   - Open it in a modern web browser (Chrome, Firefox, Safari, Edge)
   - **OR** use a local server:
     ```bash
     cd game
     python -m http.server 8000
     # Then open http://localhost:8000
     ```

3. **Play!**
   - The game works perfectly without music files
   - See below to add music for the full experience

---

## 🎵 Adding Music (Optional)

The game runs perfectly WITHOUT music files. To add the full audio experience:

### Option 1: Use Suno AI (Recommended)

1. Go to [Suno.ai](https://suno.ai)
2. Create 4 tracks using these prompts:

**Menu Track:**
```
atmospheric ambient synthwave, soft pads, inviting cyberpunk theme, 128 BPM, perfect loop
```

**8-Bit Era Track:**
```
chiptune arcade music, square wave synth, energetic retro gaming, Mega Man style, 128 BPM, perfect loop
```

**16-Bit Era Track:**
```
16-bit console music, FM synthesis, groovy bassline, Streets of Rage style, 128 BPM, perfect loop
```

**Neon Era Track:**
```
synthwave outrun, heavy bass, lush synths, Kavinsky style, euphoric cyberpunk, 128 BPM, perfect loop
```

3. **Download** each track as MP3
4. **Rename** them to:
   - `menu.mp3`
   - `era_8bit.mp3`
   - `era_16bit.mp3`
   - `era_neon.mp3`
5. **Place** them in `game/assets/audio/` folder
6. **Refresh** the game - music plays automatically!

### Option 2: Use Your Own Tracks

- All tracks must be **128 BPM** for smooth transitions
- Format: **MP3, 192kbps** recommended
- Length: **45-60 seconds** each
- Must **loop perfectly** (end connects seamlessly to start)

---

## 🎮 How to Play

### Controls

**Keyboard:**
- `SPACE` or `UP ARROW` - Jump
- `DOWN ARROW` - Slide
- `P` - Pause
- `M` - Toggle music

**Mobile:**
- Tap left side of screen - Jump
- Tap right side of screen - Slide

**Advanced:**
- **Double Jump** - Press jump again while in mid-air
- **Combo System** - Chain dodges to increase score multiplier

### Game Mechanics

1. **Survive** through constantly shifting eras
2. **Dodge** obstacles by jumping or sliding
3. **Build combos** by avoiding obstacles consecutively
4. **Speed increases** as you progress
5. **Era transitions** give brief invincibility

### Scoring

- **Distance**: +1 point per 10 pixels
- **Era Survival Bonus**: +100 points per era completed
- **Perfect Dodge**: +10 points (pass obstacle without jumping)
- **Combo Multiplier**: x2 after 5 dodges, x3 after 10 dodges

---

## 🎨 Visual Eras

### 8-BIT ERA (Retro Gaming)
- 4-color Game Boy palette
- Chunky pixel art
- Simple geometric obstacles
- **Obstacles**: Low barriers, high barriers, gaps

### 16-BIT ERA (Console Era)
- 16-color palette with gradients
- Animated neon signs
- Enhanced sprites
- **Obstacles**: Laser gates, floating platforms, hovering drones

### NEON ERA (Cyberpunk Future)
- Full RGB spectrum
- Intense glow effects
- Vector graphics
- **Obstacles**: Hologram walls, energy fields, flying cars

---

## 🛠️ Technical Details

### Built With
- **Phaser 3** (v3.70.0) - Game framework
- **Vanilla JavaScript** (ES6+)
- **HTML5 Canvas** - Rendering
- **Web Audio API** - Sound

### Features
- ✅ Procedurally generated sprites (no image files needed)
- ✅ Object pooling for performance
- ✅ Smooth era transitions with visual effects
- ✅ Responsive design (desktop + mobile)
- ✅ LocalStorage high score system
- ✅ Debug mode for development
- ✅ Graceful audio fallback

### Performance
- **Target**: 60 FPS constant
- **Load time**: < 3 seconds
- **Memory**: < 150MB

---

## 🎯 Debug Features

Press these keys during gameplay:

- `H` - Show hitboxes
- `G` - Toggle grid overlay
- `I` - Invincibility mode
- `S` - Slow motion (0.5x speed)
- `F` - Show FPS counter
- `M` - Mute/unmute audio

---

## 📁 Project Structure

```
/game
  /assets
    /audio
      - README.md (instructions for adding music)
      - [user adds: menu.mp3, era_8bit.mp3, era_16bit.mp3, era_neon.mp3]
  /src
    - main.js (game initialization)
    - Player.js (player character)
    - ObstacleManager.js (obstacle spawning)
    - EraManager.js (era transitions)
    - ParticleSystem.js (visual effects)
    - AudioManager.js (music/sound)
    - UI.js (menus, HUD, game over)
  - index.html
  - style.css
```

---

## 🎓 Learning Resources

This game demonstrates:
- **Game loops** and state management
- **Physics systems** (gravity, collision detection)
- **Object pooling** for performance
- **Procedural generation** (sprites, particles)
- **Audio management** with graceful degradation
- **Responsive design** for mobile/desktop
- **LocalStorage** for persistent data

---

## 🐛 Known Issues

None currently! If you find bugs, please report them.

---

## 🚧 Future Enhancements

Potential additions:
- Power-ups (shields, magnets, speed boosts)
- Multiple difficulty modes
- Achievement system
- Online leaderboard
- More era types
- Character customization

---

## 📝 License

MIT License - Feel free to modify and reuse!

---

## 🙏 Credits

- **Game Engine**: Phaser 3 by Photon Storm
- **Music**: Generated via Suno AI (user-provided)
- **Design**: Inspired by 80s cyberpunk aesthetics
- **Development**: Built as a complete game specification implementation

---

## 📞 Support

If you encounter issues:
1. Check that you're using a modern browser
2. Ensure JavaScript is enabled
3. Try clearing browser cache
4. Check browser console for errors

---

## 🎮 Enjoy the game!

**May your reflexes be sharp and your combos be high!** ⚡

---

### Quick Commands

**Start a local server:**
```bash
cd game
python -m http.server 8000
```

**Or with Node.js:**
```bash
cd game
npx http-server
```

Then open `http://localhost:8000` in your browser!
