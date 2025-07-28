import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [isElectron, setIsElectron] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Comprobar si estamos ejecutando en Electron
    if (window.electronAPI) {
      setIsElectron(true);
      
      // Ejemplo de cómo recibir mensajes desde el proceso principal
      window.electronAPI.receive('fromMain', (message: string) => {
        console.log('Mensaje recibido del proceso principal:', message);
        setMessage(message);
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      });
    }
  }, []);
  
  return (
    <div className="app-container">
      {isElectron && (
        <div className="electron-banner">
          <p>Ejecutando en Electron</p>
          <button 
            onClick={() => {
              // Ejemplo de cómo enviar mensajes al proceso principal
              if (window.electronAPI) {
                window.electronAPI.sendMessage('toMain', 'Hola desde React!');
              }
            }}
          >
            Enviar mensaje a Electron
          </button>
        </div>
      )}
      {message && (
        <div className="message-notification">
          {message}
        </div>
      )}
      {user?.isAuthenticated ? <Dashboard /> : <Login />}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;