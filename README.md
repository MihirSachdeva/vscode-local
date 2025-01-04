# VSCode Local

An Electron-based application that bundles code-server to provide a local VSCode experience in a desktop application.

## Features

- Runs code-server locally within an Electron shell
- Native desktop application experience
- Configurable through [src/config/code-server-config.yaml](src/config/code-server-config.yaml)

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
- Create `src/external/code-server` directory
- Copy all contents from the extracted archive into `src/external/code-server`
- Ensure the executable exists at:
    - Linux/macOS: `src/external/code-server`
    - Windows: `src/external/code-server/bin/code-server.exe`
```

## Development

Start the app in development mode:
```sh
npm start
```

## Project Structure

```markdown
- `src/index.js` - Main electron process
- `src/config/code-server-config.yaml` - code-server configuration
- `src/external/code-server` - code-server release contents
- `src/external/code-server/bin/code-server` - code-server executable
- `forge.config.js` - Electron Forge configuration,`
```

Note the line
```js
extraResource: ['src/external']
```
This tells `electron-forge` to include the contents of the `src/external` folder when packaging the application. (PS: More research required here)

## Configuration
The code-server instance is configured through `src/config/code-server-config.yaml`
