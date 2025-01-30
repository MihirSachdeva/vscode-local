# VSCode Local

An Electron-based application that bundles code-server to provide a local VSCode experience in a desktop application.

Basically lets you embed a truly usable VSCode inside your electron app.

## Features

- Runs code-server locally within an Electron shell
- Native desktop application experience
- Configurable through [config/code-server-config.yaml](config/code-server-config.yaml)

## Prerequisites

- Node.js 20.x

## Setup

1. Clone this repository:
```sh
git clone <repository-url>
cd vscode-local
```

2. Install dependencies:
```sh
npm install
```

3. Set up code-server:
```markdown
- Go to [code-server releases](https://github.com/coder/code-server/releases)
- Download the latest release for your platform
- Extract the downloaded archive
- Create `external/code-server` directory
- Copy all contents from the extracted archive into `external/code-server`
- Ensure the executable exists at:
    - Linux/macOS: `external/code-server`
    - Windows: `external/code-server/bin/code-server.exe`
```

## Development

Start the app in development mode:
```sh
npm run start
```
## Package the app

Package the app (currently only macOS is supported):
```sh
npm run package
```

## Project Structure

```markdown
- `src/main.js` - Main electron process
- `src/config/code-server-config.yaml` - code-server configuration
- `external/code-server` - code-server release contents
- `external/code-server/bin/code-server` - code-server executable
- `forge.config.js` - Electron Forge configuration,`
```

Note the line in `forge.config.js`
```js
// forge.config.js
extraResource: ['external/code-server']
```
This tells `electron-forge` to include the contents of the `external/code-server` folder when packaging the application.

The path of this executable can then be get by this function:
```js
import { app } from "electron";

const getCodeServerPath = () => {
  const { isPackaged } = app;
  return isPackaged
    ? path.resolve(process.resourcesPath, "code-server/bin/code-server")
    : path.resolve(__dirname, "../external/code-server/bin/code-server");
}
```

For example, in the packaged electron app, `process.resourcesPath` resolves to:
`/Users/mihirsachdeva/Development/vscode-local/out/vscode-local-darwin-arm64/vscode-local.app/Contents/Resources`

Then finally path of executable in packaged app would be:
```js
process.resourcesPath + 'code-server/bin/code-server'
```

## Configuration
The code-server instance is configured through `src/config/code-server-config.yaml`
