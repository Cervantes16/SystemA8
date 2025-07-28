import { contextBridge, ipcRenderer } from 'electron';

// Exponer APIs protegidas a la ventana del renderizador
contextBridge.exposeInMainWorld('electronAPI', {
  // Aquí puedes exponer funciones que permitan a tu aplicación React
  // comunicarse con el proceso principal de Electron
  sendMessage: (channel: string, data: any) => {
    // Lista blanca de canales permitidos
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: Function) => {
    // Lista blanca de canales permitidos
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // Eliminar el listener anterior para evitar duplicados
      ipcRenderer.removeAllListeners(channel);
      // Añadir nuevo listener
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  },
  // Puedes añadir más funciones según las necesidades de tu aplicación
});