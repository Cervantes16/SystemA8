import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { AuthUser } from '../types';

interface Permiso {
  permisoid: number;
  permiso: string;
  descripcion: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  userPermissions: Permiso[];
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    console.log('Saved user from localStorage:', savedUser); // Debug
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('token');
    console.log('Saved token from localStorage:', savedToken); // Debug
    return savedToken;
  });
  const [userPermissions, setUserPermissions] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sincronizar token y user con localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [token, user]);

  // Verificar autenticación y permisos al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      if (token && !user) {
        // Restaurar user desde el backend si solo tenemos token
        try {
          const response = await axios.get('http://localhost:3000/api/usuarios/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('User data response:', response.data); // Debug
          const userData = response.data;
          setUser({
            id: userData.id,
            username: userData.username,
            nombrecompleto: userData.nombrecompleto,
            role: 'ADMINISTRADOR',
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Error al restaurar usuario:', error);
          if (error.response?.status === 401) {
            console.warn('Token inválido, limpiando estado');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
            setUserPermissions([]);
          }
        }
      }

      // Obtener permisos si tenemos user y token
      if (user?.id && token) {
        try {
          const response = await axios.get(`http://localhost:3000/api/usuariopermisos/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Permissions response:', response.data); // Debug
          if (Array.isArray(response.data)) {
            const permissions = response.data.map((item: any) => ({
              permisoid: item.permisoid,
              permiso: item.permiso,
              descripcion: item.descripcion || '',
            }));
            setUserPermissions(permissions);
          } else {
            console.warn('Permissions response is not an array:', response.data);
            setUserPermissions([]);
          }
        } catch (error: any) {
          console.error('Error al obtener permisos del usuario:', error);
          setUserPermissions([]);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [token, user]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:3000/api/usuarios/login', {
        usuario: username,
        contraseña: password,
      });
      console.log('Login response:', response.data); // Debug
      const { token, user: userData, permissions } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser({
        id: userData.id,
        username: userData.username,
        nombrecompleto: userData.nombrecompleto,
        role: 'ADMINISTRADOR',
        isAuthenticated: true,
      });
      setUserPermissions(permissions || []);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logout called'); // Debug
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setUserPermissions([]);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, userPermissions, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}