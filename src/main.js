import { app, BrowserWindow } from "electron";
import path from "node:path";
import { exec } from "child_process";
import fetch from "node-fetch";
import { fileURLToPath } from 'node:url';

let mainWindow;
let codeServerProcess;

const { isPackaged } = app;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getCodeServerPath = () => {
  return isPackaged
    ? path.resolve(process.resourcesPath, "code-server/bin/code-server")
    : path.resolve(__dirname, "../external/code-server/bin/code-server");
}

const getCodeServerConfigPath = () => {
  return isPackaged
    ? path.resolve(process.resourcesPath, "config/code-server-config.yaml")
    : path.resolve(__dirname, "../config/code-server-config.yaml");
}

const CODE_SEVER_PATH = getCodeServerPath();
const CODE_SERVER_CONFIG_PATH = getCodeServerConfigPath();

const startCodeServer = () => {
  console.log(
    `Attempting to run code-server executable at: '${CODE_SEVER_PATH}'`
  );
  console.log(`Using config file at: '${CODE_SERVER_CONFIG_PATH}'`);

  let process;

  try {
    process = exec(`${CODE_SEVER_PATH} --config ${CODE_SERVER_CONFIG_PATH}`);
  } catch (err) {
    console.error("Error starting code-server:", err);
  }

  // Error handling
  process.stdout.on("data", (data) => {
    console.log("code-server output:", data);
  });

  process.stderr.on("data", (data) => {
    console.error("code-server error:", data);
  });

  return process;
};
app.on("ready", () => {
  // Start code-server
  codeServerProcess = startCodeServer();

  // Create Electron window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Wait for code-server to be ready, do 30 retries with 1 second delay
  let retries = 0;
  const loadCodeServer = () => {
    if (retries > 30) {
      console.error("Failed to start code-server, exiting.");
      app.quit();
      return;
    } else if (retries > 0) {
      console.log("Retrying to connect to code-server.");
    }

    fetch("http://127.0.0.1:8080")
      .then(() => mainWindow.loadURL("http://127.0.0.1:8080"))
      .catch(() => {
        retries++;
        setTimeout(loadCodeServer, 1000);
      });
  };

  loadCodeServer();

  // Cleanup
  mainWindow.on("closed", () => {
    mainWindow = null;
    if (codeServerProcess) codeServerProcess.kill();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  if (codeServerProcess) codeServerProcess.kill();
});
