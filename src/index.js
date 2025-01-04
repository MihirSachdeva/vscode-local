const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const fetch = require("node-fetch");
const fs = require("fs");

let mainWindow;
let codeServerProcess;

const startCodeServer = () => {
  const codeServerPath = path.resolve(
    __dirname,
    "external/code-server/bin/code-server"
  );
  const configPath = path.resolve(__dirname, "config/code-server-config.yaml");

  console.log(
    `Attempting to run code-server executable at: '${codeServerPath}'`
  );
  console.log(`Using config file at: '${configPath}'`);
  try {
    const contents = fs.readFileSync(codeServerPath, "utf8");
    console.log("File contents:", contents);
  } catch (err) {
    console.error("Error reading file:", err);
  }

  let process;

  try {
    process = exec(`${codeServerPath} --config ${configPath}`);
  } catch (err) {
    console.error("Error starting code-server:", err);
  }

  // Add error handling
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

  // Wait for code-server to be ready
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
