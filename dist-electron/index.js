var R = Object.defineProperty;
var T = (t, e, a) => e in t ? R(t, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : t[e] = a;
var c = (t, e, a) => T(t, typeof e != "symbol" ? e + "" : e, a);
import { app as r, BrowserWindow as g } from "electron";
import i from "node:path";
import { fileURLToPath as u } from "node:url";
import { createClient as f } from "@libsql/client";
const s = class s {
  constructor() {
    c(this, "client");
    const e = i.join(r.getPath("userData"), "matriarch.db");
    this.client = f({
      url: `file:${e}`
    }), this.initializeSchema();
  }
  static getInstance() {
    return s.instance || (s.instance = new s()), s.instance;
  }
  async initializeSchema() {
    try {
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS system_meta (
          key TEXT PRIMARY KEY,
          value TEXT,
          created_at INTEGER DEFAULT (unixepoch())
        )
      `);
    } catch (e) {
      console.error("Schema initialization failed", e);
    }
  }
  getClient() {
    return this.client;
  }
};
c(s, "instance");
let l = s;
const o = class o {
  constructor() {
    c(this, "agents", /* @__PURE__ */ new Map());
  }
  static getInstance() {
    return o.instance || (o.instance = new o()), o.instance;
  }
  registerAgent(e, a) {
    console.log(`Registering agent: ${e}`), this.agents.set(e, a);
  }
  getAgent(e) {
    return this.agents.get(e);
  }
};
c(o, "instance");
let d = o;
const p = i.dirname(u(import.meta.url));
process.env.APP_ROOT = i.join(p, "..");
const h = process.env.VITE_DEV_SERVER_URL, S = i.join(process.env.APP_ROOT, "dist-electron"), m = i.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = h ? i.join(process.env.APP_ROOT, "public") : m;
let n;
async function E() {
  n = new g({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: i.join(p, "preload.mjs")
    }
  }), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), h ? n.loadURL(h) : n.loadFile(i.join(m, "index.html"));
}
r.on("window-all-closed", () => {
  process.platform !== "darwin" && (r.quit(), n = null);
});
r.on("activate", () => {
  g.getAllWindows().length === 0 && E();
});
r.whenReady().then(async () => {
  console.log("App ready, initializing systems...");
  try {
    const t = l.getInstance();
    console.log("Database initialized successfully");
  } catch (t) {
    console.error("Failed to initialize database:", t);
  }
  try {
    const t = d.getInstance();
    console.log("Agent Orchestrator initialized");
  } catch (t) {
    console.error("Failed to initialize orchestrator:", t);
  }
  E();
});
export {
  S as MAIN_DIST,
  m as RENDERER_DIST,
  h as VITE_DEV_SERVER_URL
};
