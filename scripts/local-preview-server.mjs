#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const MIME_BY_EXT = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".jsonl": "application/x-ndjson; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg"
};

function loadLocalEnvFile(filename) {
  const envPath = path.join(rootDir, filename);
  if (!fs.existsSync(envPath)) return false;
  const rows = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  rows.forEach((row) => {
    const clean = row.trim();
    if (!clean || clean.startsWith("#")) return;
    const match = clean.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;
    const [, key, rawValue] = match;
    if (process.env[key]) return;
    const value = rawValue
      .trim()
      .replace(/^['"]|['"]$/g, "");
    process.env[key] = value;
  });
  return true;
}

[".env.local", ".env"].forEach(loadLocalEnvFile);

const port = Number(process.env.PORT || process.argv.find((arg) => /^--port=/.test(arg))?.split("=")[1] || 8794);
const host = process.env.HOST || "127.0.0.1";

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function safeStaticPath(urlPath = "/") {
  const cleanPath = decodeURIComponent(urlPath.split("?")[0] || "/");
  const relativePath = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const resolved = path.resolve(rootDir, relativePath);
  if (!resolved.startsWith(rootDir + path.sep) && resolved !== rootDir) return "";
  return resolved;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("error", reject);
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

function parseBody(rawBody = "", contentType = "") {
  const raw = String(rawBody || "").trim();
  if (!raw) return {};
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch (_err) {
      return {};
    }
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }
  return raw;
}

function createApiResponse(res) {
  res.status = (statusCode) => {
    res.statusCode = statusCode;
    return res;
  };
  res.json = (payload) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  };
  res.send = (payload) => {
    if (typeof payload === "object" && !Buffer.isBuffer(payload)) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(payload));
      return;
    }
    res.end(payload);
  };
  return res;
}

async function handleApi(req, res, parsedUrl) {
  const routeName = parsedUrl.pathname.replace(/^\/api\/+/, "").replace(/\/+$/, "");
  if (!routeName || routeName.startsWith("_")) {
    send(res, 404, JSON.stringify({ error: "api_not_found" }), {
      "Content-Type": "application/json; charset=utf-8"
    });
    return;
  }

  const apiPath = path.join(rootDir, "api", `${routeName}.js`);
  if (!fs.existsSync(apiPath)) {
    send(res, 404, JSON.stringify({ error: "api_not_found", route: routeName }), {
      "Content-Type": "application/json; charset=utf-8"
    });
    return;
  }

  try {
    const rawBody = await readRequestBody(req);
    req.body = parseBody(rawBody, String(req.headers["content-type"] || ""));
    req.query = Object.fromEntries(parsedUrl.searchParams.entries());
    const resolvedApiPath = require.resolve(apiPath);
    delete require.cache[resolvedApiPath];
    const handler = require(resolvedApiPath);
    await handler(req, createApiResponse(res));
  } catch (error) {
    if (!res.headersSent) {
      send(res, 500, JSON.stringify({ error: "local_api_failed", detail: error.message }), {
        "Content-Type": "application/json; charset=utf-8"
      });
    } else {
      res.end();
    }
  }
}

function handleStatic(req, res, parsedUrl) {
  let filePath = safeStaticPath(parsedUrl.pathname);
  if (!filePath) {
    send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath)) {
    send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    "Content-Type": MIME_BY_EXT[ext] || "application/octet-stream",
    "Cache-Control": "no-store"
  };
  send(res, 200, fs.readFileSync(filePath), headers);
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host || `${host}:${port}`}`);
  if (parsedUrl.pathname.startsWith("/api/")) {
    await handleApi(req, res, parsedUrl);
    return;
  }
  handleStatic(req, res, parsedUrl);
});

server.listen(port, host, () => {
  const url = `http://${host === "0.0.0.0" ? "localhost" : host}:${port}/`;
  console.log(`Sonic Search local preview: ${url}`);
  console.log(`Root: ${pathToFileURL(rootDir).href}`);
});
