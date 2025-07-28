/// <reference types="vite/client" />

// Extender el objeto Window con las APIs de Electron
interface ElectronAPI {
  sendMessage: (channel: string, data: any) => void;
  receive: (channel: string, func: Function) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}