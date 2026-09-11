import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const previewScript = path.join(scriptsDir, "local-preview-server.mjs");

function normalizeBaseUrl(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close((error) => error ? reject(error) : resolve(port));
    });
  });
}

async function waitForPreview(baseUrl, child, output) {
  const deadline = Date.now() + 12_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Local preview exited with code ${child.exitCode}. ${output().trim()}`);
    }
    try {
      const response = await fetch(`${baseUrl}/index.html`, { cache: "no-store" });
      if (response.ok) {
        await response.body?.cancel().catch(() => {});
        return;
      }
    } catch (_error) {
      // The process may still be binding the socket.
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error(`Local preview did not become ready at ${baseUrl}. ${output().trim()}`);
}

async function stopChild(child) {
  if (!child || child.exitCode !== null || child.signalCode) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 1_500))
  ]);
  if (child.exitCode === null && !child.signalCode) child.kill("SIGKILL");
}

export async function startTestPreviewServer({ envName, staticRoot = "" } = {}) {
  const configuredBaseUrl = normalizeBaseUrl(envName ? process.env[envName] : "");
  if (configuredBaseUrl) {
    return { baseUrl: configuredBaseUrl, owned: false, stop: async () => {} };
  }

  const port = await reservePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const chunks = [];
  const child = spawn(process.execPath, [previewScript], {
    cwd: path.resolve(scriptsDir, ".."),
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
      ...(staticRoot ? { SONIC_PREVIEW_STATIC_ROOT: staticRoot } : {})
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const remember = (chunk) => {
    chunks.push(String(chunk || ""));
    if (chunks.length > 24) chunks.shift();
  };
  child.stdout?.on("data", remember);
  child.stderr?.on("data", remember);

  try {
    await waitForPreview(baseUrl, child, () => chunks.join(""));
  } catch (error) {
    await stopChild(child);
    throw error;
  }

  let stopped = false;
  return {
    baseUrl,
    owned: true,
    async stop() {
      if (stopped) return;
      stopped = true;
      await stopChild(child);
    }
  };
}
