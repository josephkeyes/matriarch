"use strict";
const electron = require("electron");
const CHANNELS = {
  SYSTEM: {
    HEALTH: "system:health"
  }
  // Future channels will be added here:
  // NOTES: { CREATE: 'notes:create', ... }
  // TASKS: { CREATE: 'tasks:create', ... }
  // AGENTS: { INVOKE: 'agents:invoke', ... }
};
const matriarch = {
  system: {
    health: () => electron.ipcRenderer.invoke(CHANNELS.SYSTEM.HEALTH)
  }
  // Future APIs will be added here as they are implemented
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
