"use strict";
const electron = require("electron");
const CHANNELS = {
  SYSTEM: {
    HEALTH: "system:health"
  },
  SETTINGS: {
    GET_GENERAL: "settings:get-general",
    UPDATE_GENERAL: "settings:update-general",
    GET_AI: "settings:get-ai",
    UPDATE_AI: "settings:update-ai",
    RESET_DEFAULTS: "settings:reset-defaults"
  },
  AGENTS: {
    LIST: "agents:list",
    EXECUTE: "agents:execute",
    GET_LOGS: "agents:get-logs"
  },
  COLLECTIONS: {
    LIST: "collections:list",
    CREATE: "collections:create",
    UPDATE: "collections:update",
    DELETE: "collections:delete"
  },
  NOTES: {
    CREATE: "notes:create",
    READ: "notes:read",
    UPDATE: "notes:update",
    DELETE: "notes:delete"
  },
  AI_PROVIDERS: {
    LIST: "ai-providers:list",
    GET_CONFIG: "ai-providers:get-config",
    SET_ENABLED: "ai-providers:set-enabled",
    UPDATE_CONFIG: "ai-providers:update-config",
    CHECK_AVAILABILITY: "ai-providers:check-availability",
    GET_MODELS: "ai-providers:get-models"
  }
  // Future channels:
  // TASKS: { CREATE: 'tasks:create', ... }
};
const matriarch = {
  system: {
    health: () => electron.ipcRenderer.invoke(CHANNELS.SYSTEM.HEALTH)
  },
  settings: {
    getGeneral: () => electron.ipcRenderer.invoke(CHANNELS.SETTINGS.GET_GENERAL),
    updateGeneral: (settings) => electron.ipcRenderer.invoke(CHANNELS.SETTINGS.UPDATE_GENERAL, settings),
    getAI: () => electron.ipcRenderer.invoke(CHANNELS.SETTINGS.GET_AI),
    updateAI: (settings) => electron.ipcRenderer.invoke(CHANNELS.SETTINGS.UPDATE_AI, settings),
    resetToDefaults: (category) => electron.ipcRenderer.invoke(CHANNELS.SETTINGS.RESET_DEFAULTS, category)
  },
  agents: {
    list: () => electron.ipcRenderer.invoke(CHANNELS.AGENTS.LIST),
    execute: (agentId, input, modelOverride) => electron.ipcRenderer.invoke(CHANNELS.AGENTS.EXECUTE, agentId, input, modelOverride),
    getLogs: (agentId, limit) => electron.ipcRenderer.invoke(CHANNELS.AGENTS.GET_LOGS, agentId, limit)
  },
  collections: {
    list: () => electron.ipcRenderer.invoke(CHANNELS.COLLECTIONS.LIST),
    create: (name) => electron.ipcRenderer.invoke(CHANNELS.COLLECTIONS.CREATE, name),
    update: (id, data) => electron.ipcRenderer.invoke(CHANNELS.COLLECTIONS.UPDATE, id, data),
    delete: (id) => electron.ipcRenderer.invoke(CHANNELS.COLLECTIONS.DELETE, id)
  },
  notes: {
    create: (data) => electron.ipcRenderer.invoke(CHANNELS.NOTES.CREATE, data),
    read: (id) => electron.ipcRenderer.invoke(CHANNELS.NOTES.READ, id),
    update: (id, data) => electron.ipcRenderer.invoke(CHANNELS.NOTES.UPDATE, id, data),
    delete: (id) => electron.ipcRenderer.invoke(CHANNELS.NOTES.DELETE, id)
  },
  aiProviders: {
    list: () => electron.ipcRenderer.invoke(CHANNELS.AI_PROVIDERS.LIST),
    getConfig: (providerId) => electron.ipcRenderer.invoke(CHANNELS.AI_PROVIDERS.GET_CONFIG, providerId),
    setEnabled: (providerId, enabled) => electron.ipcRenderer.invoke(CHANNELS.AI_PROVIDERS.SET_ENABLED, providerId, enabled),
    updateConfig: (providerId, config) => electron.ipcRenderer.invoke(CHANNELS.AI_PROVIDERS.UPDATE_CONFIG, providerId, config),
    checkAvailability: (providerId) => electron.ipcRenderer.invoke(CHANNELS.AI_PROVIDERS.CHECK_AVAILABILITY, providerId),
    getModels: (providerId) => electron.ipcRenderer.invoke(CHANNELS.AI_PROVIDERS.GET_MODELS, providerId)
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
