const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = !!process.env.ELECTRON_START_URL;

if (!isDev) {
  // In production, run the backend server inside the main process.
  // resourcesPath points to the extraResources folder inside the package.
  const backendPath = path.join(process.resourcesPath, "backend");
  const distPath = path.join(process.resourcesPath, "frontend", "dist");
  process.env.PORT = "4000";
  process.env.STATIC_PATH = distPath;
  // Add backend's node_modules to the module resolution path
  require("module").globalPaths.push(path.join(backendPath, "node_modules"));
  require(path.join(backendPath, "server.js"));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    backgroundColor: "#0d1117",
    webPreferences: {
      contextIsolation: true,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || "http://localhost:4000";
  // Small delay so the embedded server has time to bind before the window loads
  setTimeout(() => win.loadURL(startUrl), 800);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
