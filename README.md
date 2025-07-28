# SystemA8 - Aplicación React + Electron + TypeScript

Esta es una aplicación de escritorio construida con React, Electron y TypeScript, que proporciona una interfaz de usuario moderna y funcionalidades nativas de escritorio.

## Características

- Interfaz de usuario moderna con React
- Funcionalidades nativas de escritorio con Electron
- Tipado estático con TypeScript
- Estilizado con CSS y posibilidad de usar Tailwind CSS
- Sistema de autenticación de usuarios
- Panel de control con visualización de datos

## Requisitos previos

- Node.js (versión 20.19+ o 22.12+)
- npm o yarn

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd SystemA8

# Instalar dependencias
npm install
```

## Desarrollo

```bash
# Iniciar la aplicación en modo desarrollo
npm run dev
```

Esto iniciará la aplicación Electron con hot-reload para el desarrollo.

## Construcción

```bash
# Construir la aplicación para producción
npm run build
```

## Empaquetado

```bash
# Empaquetar la aplicación para todas las plataformas
npm run package

# Empaquetar solo para Windows
npm run package:win

# Empaquetar solo para macOS
npm run package:mac

# Empaquetar solo para Linux
npm run package:linux
```

Los archivos empaquetados se generarán en la carpeta `release`.

## Estructura del proyecto

```
├── electron/           # Código fuente de Electron
│   ├── main.ts         # Proceso principal de Electron
│   └── preload.ts      # Script de precarga
├── src/                # Código fuente de React
│   ├── components/     # Componentes de React
│   ├── context/        # Contextos de React
│   ├── data/           # Datos y servicios
│   └── types/          # Definiciones de tipos
├── public/             # Archivos estáticos
└── out/                # Archivos compilados
```

## Comunicación entre React y Electron

La aplicación utiliza IPC (Inter-Process Communication) para la comunicación entre el proceso de renderizado (React) y el proceso principal (Electron). Esto se configura en los archivos `electron/preload.ts` y `electron/main.ts`.

Ejemplo de uso en React:

```typescript
// Enviar mensaje al proceso principal
window.electronAPI.sendMessage('toMain', 'Hola desde React!');

// Recibir mensaje desde el proceso principal
window.electronAPI.receive('fromMain', (message) => {
  console.log('Mensaje recibido:', message);
});
```

## Licencia

[MIT](LICENSE)