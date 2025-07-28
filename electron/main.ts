import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// Mantener una referencia global del objeto window para evitar que la ventana se cierre automáticamente
// cuando el objeto JavaScript es recogido por el recolector de basura.
let mainWindow: BrowserWindow | null = null;

// Manejar mensajes desde el proceso de renderizado
ipcMain.on('toMain', (event, message) => {
  console.log('Mensaje recibido desde React:', message);
  
  // Responder al proceso de renderizado
  if (mainWindow) {
    mainWindow.webContents.send('fromMain', 'Mensaje recibido correctamente!');
  }
});

const isDevelopment = process.env.NODE_ENV !== 'production';

function createWindow() {
  // Crear la ventana del navegador.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Cargar la aplicación.
  if (isDevelopment) {
    // En desarrollo, carga desde el servidor de desarrollo de Vite
    mainWindow.loadURL('http://localhost:5173');
    // Abrir las herramientas de desarrollo
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, carga desde los archivos construidos
    mainWindow.loadFile(path.join(__dirname, '../index.html'));
  }

  // Emitido cuando la ventana es cerrada.
  mainWindow.on('closed', () => {
    // Eliminar la referencia del objeto window
    // normalmente almacenarías las ventanas en un array si tu aplicación soporta múltiples ventanas
    // en este momento deberías eliminar el elemento correspondiente.
    mainWindow = null;
  });
}

// Este método será llamado cuando Electron haya terminado
// la inicialización y esté listo para crear ventanas del navegador.
// Algunas APIs pueden usarse sólo después de que este evento ocurra.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // En macOS es común volver a crear una ventana en la aplicación cuando
    // el icono del dock es clickeado y no hay otras ventanas abiertas.
    if (mainWindow === null) createWindow();
  });
});

// Salir cuando todas las ventanas estén cerradas, excepto en macOS.
// En macOS es común que las aplicaciones y su barra de menú
// permanezcan activas hasta que el usuario salga explícitamente con Cmd + Q
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// En este archivo puedes incluir el resto del código del proceso principal específico
// de tu aplicación. También puedes ponerlos en archivos separados y requerirlos aquí.