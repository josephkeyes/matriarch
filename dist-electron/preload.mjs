"use strict";
const electron = require("electron");
const CHANNELS = {
  SYSTEM: {
    HEALTH: "system:health"
  },
  SETTINGS: {
    GET_AI: "settings:get-ai",
    UPDATE_AI: "settings:update-ai"
  },
  AGENTS: {
    LIST: "agents:list",
    EXECUTE: "agents:execute",
    GET_LOGS: "agents:get-logs"
  },
  COLLECTIONS: {
    LIST: "collections:list",
    CREATE: "collections:create"
  }
  // Future channels:
  // NOTES: { CREATE: 'notes:create', ... }
  // TASKS: { CREATE: 'tasks:create', ... }
};
const matriarch = {
  system: {
    health: () => electron.ipcRenderer.invoke(CHANNELS.SYSTEM.HEALTH)
  },
  settings: {
    getAI: () => electron.ipcRenderer.invoke(CHANNELS.SETTINGS.GET_AI),
    updateAI: (settings) => electron.ipcRenderer.invoke(CHANNELS.SETTINGS.UPDATE_AI, settings)
  },
  agents: {
    list: () => electron.ipcRenderer.invoke(CHANNELS.AGENTS.LIST),
    execute: (agentId, input, modelOverride) => electron.ipcRenderer.invoke(CHANNELS.AGENTS.EXECUTE, agentId, input, modelOverride),
    getLogs: (agentId, limit) => electron.ipcRenderer.invoke(CHANNELS.AGENTS.GET_LOGS, agentId, limit)
  },
  collections: {
    list: () => electron.ipcRenderer.invoke(CHANNELS.COLLECTIONS.LIST),
    create: (name) => electron.ipcRenderer.invoke(CHANNELS.COLLECTIONS.CREATE, name)
  }
};
electron.contextBridge.exposeInMainWorld("matriarch", matriarch);
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
});
