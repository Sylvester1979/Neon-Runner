# Audio Files

This game requires 4 music tracks (MP3 format, 128 BPM).

## Required Files:
1. **menu.mp3** - Main menu music
2. **era_8bit.mp3** - 8-bit era music
3. **era_16bit.mp3** - 16-bit era music
4. **era_neon.mp3** - Neon era music

## To Add Music:

### Option 1: Using Suno AI (Recommended)

1. Go to [Suno.ai](https://suno.ai)
2. Create tracks using these prompts:

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

3. Download each track as MP3
4. Rename them to the exact filenames listed above
5. Place them in this folder (`game/assets/audio/`)
6. Refresh the game - music will play automatically!

### Option 2: Use Your Own Tracks

- Ensure all tracks are **128 BPM** for smooth transitions
- Format: **MP3, 192kbps** recommended
- Length: **45-60 seconds** each
- **Must loop perfectly** (end connects seamlessly to start)
- Normalized to **-3dB** to prevent clipping

## Important Notes:

✅ **The game works perfectly without these files!** (just no music)
✅ No code changes needed - just drop files and refresh
✅ Audio is automatically detected when files are present
✅ Make sure filenames match exactly (case-sensitive)

## File Checklist:
- [ ] menu.mp3
- [ ] era_8bit.mp3
- [ ] era_16bit.mp3
- [ ] era_neon.mp3

Once all files are added, you're ready to experience NEON RUNNER with full audio! 🎵
