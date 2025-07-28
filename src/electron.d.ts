// Declaración de tipos para las APIs de Electron expuestas por el preload script

interface ElectronAPI {
  sendMessage: (channel: string, data: any) => void;
  receive: (channel: string, func: Function) => void;
}

declare interface Window {
  electronAPI: ElectronAPI;
}