/**
 * OmniVoice AI - Native Desktop Application (Electron)
 * ---------------------------------------------------
 * Runs OmniVoice AI as a native desktop application with system-wide
 * audio capabilities, floating meeting overlays, and desktop hardware access.
 */

const { app, BrowserWindow, Menu, shell, globalShortcut } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let serverProcess = null;
const PORT = process.env.PORT || 3000;

// Start embedded OmniVoice AI Express server
function startEmbeddedServer() {
  try {
    require('./server.js');
    console.log('[OmniVoice Desktop] Embedded backend server initialized.');
  } catch (err) {
    console.error('[OmniVoice Desktop] Server start error:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    title: 'OmniVoice AI - Real-Time Meeting Speech Translator',
    backgroundColor: '#070913',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Load the running dashboard
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Open external links (like GitHub repo) in the user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  startEmbeddedServer();

  // Allow server a brief moment to bind to port before loading window
  setTimeout(createWindow, 600);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
