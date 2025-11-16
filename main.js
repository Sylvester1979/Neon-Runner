/**
 * NEON RUNNER - Electron Main Process
 * Professional Desktop Application
 */

const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1280,
    minHeight: 720,
    resizable: false, // Fixed size for consistent gameplay
    fullscreenable: true,
    title: 'NEON RUNNER',
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      webSecurity: false // Allow loading Phaser from CDN
    },
    icon: path.join(__dirname, 'build', 'icon.png')
  });

  // Load the game
  mainWindow.loadFile('game/index.html');

  // Create application menu
  createMenu();

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer] ${message}`);
  });

  // Open DevTools automatically in development
  mainWindow.webContents.openDevTools();
}

/**
 * Create application menu
 */
function createMenu() {
  const template = [
    {
      label: 'Game',
      submenu: [
        {
          label: 'New Game',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('new-game');
          }
        },
        {
          label: 'Pause',
          accelerator: 'P',
          click: () => {
            mainWindow.webContents.send('toggle-pause');
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F11',
          click: () => {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Audio',
      submenu: [
        {
          label: 'Mute/Unmute',
          accelerator: 'M',
          click: () => {
            mainWindow.webContents.send('toggle-audio');
          }
        }
      ]
    },
    {
      label: 'Debug',
      submenu: [
        {
          label: 'Show Hitboxes',
          accelerator: 'H',
          click: () => {
            mainWindow.webContents.send('toggle-hitboxes');
          }
        },
        {
          label: 'Show FPS',
          accelerator: 'F',
          click: () => {
            mainWindow.webContents.send('toggle-fps');
          }
        },
        {
          label: 'Invincibility',
          accelerator: 'I',
          click: () => {
            mainWindow.webContents.send('toggle-invincibility');
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'How to Play',
          click: () => {
            mainWindow.webContents.send('show-help');
          }
        },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About NEON RUNNER',
              message: 'NEON RUNNER v1.0.0',
              detail: '80s Cyberpunk Endless Runner\n\nBuilt with Phaser 3 & Electron\n\n© 2025 All Rights Reserved',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'GitHub Repository',
          click: async () => {
            await shell.openExternal('https://github.com/Sylvester1979/Neon-Runner');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * App lifecycle
 */

// When Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle any unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Error', `An error occurred: ${error.message}`);
});
