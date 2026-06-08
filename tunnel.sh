#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 2>/dev/null || true

NGROK_V3="/tmp/ngrok"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Verificando ngrok v3..."
if [ ! -f "$NGROK_V3" ]; then
  echo "    Baixando ngrok v3..."
  curl -sL https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz -o /tmp/ngrok.tgz
  tar -xzf /tmp/ngrok.tgz -C /tmp
  chmod +x "$NGROK_V3"
fi

echo "==> Instalando @expo/ngrok..."
cd "$PROJECT_DIR"
npm install @expo/ngrok@^4.1.0 --legacy-peer-deps --silent 2>/dev/null || true

# Substituir binário ngrok v2 → v3
NGROK_BIN=$(find "$PROJECT_DIR/node_modules" -path "*ngrok-bin-linux-x64/ngrok" 2>/dev/null | head -1)
if [ -n "$NGROK_BIN" ]; then
  echo "==> Substituindo binário ngrok v2 → v3..."
  pkill -f ngrok 2>/dev/null || true
  sleep 1
  cp "$NGROK_V3" "$NGROK_BIN" || true
fi

# Patch client.js: remover campos incompatíveis com ngrok v3
NGROK_CLIENT=$(find "$PROJECT_DIR/node_modules/@expo/ngrok" -name "client.js" 2>/dev/null | head -1)
if [ -n "$NGROK_CLIENT" ] && ! grep -q "authtoken, configPath, port" "$NGROK_CLIENT"; then
  echo "==> Aplicando patch client.js..."
  sed -i 's/return this\.request("post", "api\/tunnels", options);/const { authtoken, configPath, port, ...clean } = options; return this.request("post", "api\/tunnels", clean);/' "$NGROK_CLIENT"
fi

# Patch index.js: reescrever limpo com fix do "already exists"
NGROK_INDEX="$PROJECT_DIR/node_modules/@expo/ngrok/index.js"
if [ -f "$NGROK_INDEX" ] && ! grep -q "already exists" "$NGROK_INDEX"; then
  echo "==> Aplicando patch index.js..."
  cat > "$NGROK_INDEX" << 'INDEXEOF'
const { NgrokClient, NgrokClientError } = require("./src/client");
const uuid = require("uuid");
const { getProcess, getActiveProcess, killProcess, setAuthtoken, getVersion } = require("./src/process");
const { defaults, validate, isRetriable } = require("./src/utils");

let processUrl = null;
let ngrokClient = null;

async function connect(opts) {
  opts = defaults(opts);
  validate(opts);
  if (opts.authtoken) await setAuthtoken(opts);
  processUrl = await getProcess(opts);
  ngrokClient = new NgrokClient(processUrl);
  return connectRetry(opts);
}

async function connectRetry(opts, retryCount = 0) {
  opts.name = String(opts.name || uuid.v4());
  try {
    const response = await ngrokClient.startTunnel(opts);
    return response.public_url;
  } catch (err) {
    const body = err.body || '';
    const msg = typeof body === 'string' ? body : (body.msg || body.details?.err || '');
    if (msg.includes('already exists')) {
      const tunnel = await ngrokClient.tunnelDetail(opts.name);
      return tunnel.public_url;
    }
    if (!isRetriable(err) || retryCount >= 100) throw err;
    await new Promise((resolve) => setTimeout(resolve, 200));
    return connectRetry(opts, ++retryCount);
  }
}

async function disconnect(publicUrl) {
  if (!ngrokClient) return;
  const tunnels = (await ngrokClient.listTunnels()).tunnels;
  if (!publicUrl) return Promise.all(tunnels.map((t) => disconnect(t.public_url)));
  const tunnelDetails = tunnels.find((t) => t.public_url === publicUrl);
  if (!tunnelDetails) throw new Error(`there is no tunnel with url: ${publicUrl}`);
  return ngrokClient.stopTunnel(tunnelDetails.name);
}

async function kill() {
  if (!ngrokClient) return;
  await killProcess();
  ngrokClient = null;
}

function getUrl() { return processUrl; }
function getApi() { return ngrokClient; }

module.exports = { connect, disconnect, authtoken: setAuthtoken, kill, getUrl, getApi, getVersion, getActiveProcess, NgrokClientError };
INDEXEOF
fi

# Patch NgrokResolver: forçar uso local do @expo/ngrok
NGROK_RESOLVER=$(find "$PROJECT_DIR/node_modules" -path "*/doctor/ngrok/NgrokResolver.js" 2>/dev/null | head -1)
if [ -n "$NGROK_RESOLVER" ] && ! grep -q "Force local" "$NGROK_RESOLVER"; then
  echo "==> Forçando uso local do @expo/ngrok..."
  cat >> "$NGROK_RESOLVER" << 'PATCH'

// Force local @expo/ngrok to avoid global install attempt
const _localNgrok = require('@expo/ngrok');
NgrokResolver.prototype.getVersioned = function() {
  if (!this.instance) this.instance = _localNgrok;
  return this.instance;
};
PATCH
fi

echo "==> Matando processos antigos..."
pkill -f "ngrok" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
sleep 1

echo "==> Iniciando Expo com tunnel..."
npx expo start --tunnel
