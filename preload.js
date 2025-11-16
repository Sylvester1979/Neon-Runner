/**
 * NEON RUNNER - Electron Preload Script
 * Safely exposes IPC communication to renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Listen for messages from main process
  onNewGame: (callback) => ipcRenderer.on('new-game', callback),
  onTogglePause: (callback) => ipcRenderer.on('toggle-pause', callback),
  onToggleAudio: (callback) => ipcRenderer.on('toggle-audio', callback),
  onToggleHitboxes: (callback) => ipcRenderer.on('toggle-hitboxes', callback),
  onToggleFPS: (callback) => ipcRenderer.on('toggle-fps', callback),
  onToggleInvincibility: (callback) => ipcRenderer.on('toggle-invincibility', callback),
  onShowHelp: (callback) => ipcRenderer.on('show-help', callback),

  // Platform detection
  platform: process.platform,
  isElectron: true
});

console.log('🚀 NEON RUNNER Desktop App - Preload script loaded');
