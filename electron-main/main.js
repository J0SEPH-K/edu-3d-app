const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 900,
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '../frontend/build/index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );
}

app.whenReady().then(createWindow);
