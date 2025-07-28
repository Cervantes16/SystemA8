import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  // Aquí puedes exponer funciones que permitan a tu aplicación React
  // comunicarse con el proceso principal de Electron
  sendMessage: (channel, data) => {
    const validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ["fromMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  }
  // Puedes añadir más funciones según las necesidades de tu aplicación
});
