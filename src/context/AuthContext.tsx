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
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userPermissions, setUserPermissions] = useState<Permiso[]>([]);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (user?.id && token) {
        try {
          const response = await axios.get(`http://localhost:3000/api/usuariopermisos/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
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
          if (error.response?.status === 403) {
            console.warn('Permission denied for user:', user.id);
          }
          setUserPermissions([]);
        }
      }
    };

    fetchUserPermissions();
  }, [user, token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:3000/api/usuarios/login', {
        usuario: username,
        contraseña: password,
      });
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
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setUserPermissions([]);
  };

  return (
    <AuthContext.Provider value={{ user, token, userPermissions, login, logout }}>
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