# Application Icons

This folder contains the application icons for different platforms.

## Required Icon Files:

### Windows
- `icon.ico` - Windows icon (256x256 recommended, supports multiple sizes)

### macOS
- `icon.icns` - macOS icon bundle (512x512@2x recommended)

### Linux
- `icon.png` - Linux icon (512x512 PNG recommended)

## How to Create Icons:

### Option 1: Use an Online Converter
1. Create a 1024x1024 PNG image with your game logo
2. Use https://www.icoconverter.com/ to convert to .ico
3. Use https://cloudconvert.com/png-to-icns to convert to .icns
4. Use the PNG directly for Linux

### Option 2: Use Electron Icon Maker
```bash
npm install -g electron-icon-maker
electron-icon-maker --input=icon.png --output=./build
```

### Option 3: Manual Creation
- **Photoshop/GIMP**: Export as ICO (Windows)
- **Icon Composer** (macOS): Create ICNS
- **Any image editor**: Save as 512x512 PNG (Linux)

## Icon Design Guidelines:

✅ **Recommended:**
- 1024x1024 base size
- Transparent background
- Centered design
- High contrast colors
- Simple, recognizable design

❌ **Avoid:**
- Complex details (won't be visible when small)
- Text (hard to read at small sizes)
- Thin lines (may disappear at small sizes)

## Current Status:

⚠️ **Icons not yet created** - App will use default Electron icon until you add:
- `icon.ico` (Windows)
- `icon.icns` (macOS)
- `icon.png` (Linux)

## Suggested NEON RUNNER Icon Design:

Create an icon featuring:
- Neon cyan/magenta color scheme
- Geometric runner silhouette
- 80s cyberpunk aesthetic
- Glowing outline effect
- Dark/black background

Example concept: A stylized pixel-art runner figure with neon glow trails
