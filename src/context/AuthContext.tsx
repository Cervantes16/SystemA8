import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface Permiso {
  permisoid: number;
  permiso: string;
  descripcion: string;
}

interface AuthUser {
  id: number;
  username: string;
  nombrecompleto: string;
  role: string;
  isAuthenticated: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  userPermissions: Permiso[];
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  retryAuth: () => void; // Added for retrying authentication
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios interceptor setup
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = sessionStorage.getItem('user');
    console.log('Saved user from sessionStorage:', savedUser);
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    const savedToken = sessionStorage.getItem('token');
    console.log('Saved token from sessionStorage:', savedToken);
    return savedToken;
  });
  const [userPermissions, setUserPermissions] = useState<Permiso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronize token with sessionStorage
  useEffect(() => {
    console.log('Token state changed:', token);
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  }, [token]);

  // Synchronize user with sessionStorage
  useEffect(() => {
    console.log('User state changed:', user);
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('user');
    }
  }, [user]);

  // Initialize authentication
  const initializeAuth = async () => {
    setIsLoading(true);
    setError(null);

    if (token) {
      // Validate token expiration
      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded token:', decoded);
        if (decoded.exp * 1000 < Date.now()) {
          console.warn('Token expired, clearing state');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setUserPermissions([]);
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Invalid token format:', error);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setUserPermissions([]);
        setError('Token inválido. Por favor, inicia sesión nuevamente.');
        setIsLoading(false);
        return;
      }

      // Restore user from backend
      console.log('Attempting to restore user with token:', token);
      try {
        const response = await axios.get('http://localhost:3000/api/usuarios/me');
        console.log('User data response:', response.data);
        const userData = response.data;
        setUser({
          id: userData.id,
          username: userData.username,
          nombrecompleto: userData.nombrecompleto,
          role: 'ADMINISTRADOR',
          isAuthenticated: true,
        });
      } catch (error: any) {
        console.error('Error restoring user:', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          console.warn('Invalid token, clearing state');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setUserPermissions([]);
          setError('Token inválido. Por favor, inicia sesión nuevamente.');
        } else if (error.response?.status === 404) {
          console.warn('User endpoint not found, retaining token for retry');
          setError('Servicio de usuario no disponible. Intenta de nuevo más tarde.');
          // Retain token/user for retry
        } else {
          setError('Error al restaurar la sesión. Por favor, intenta de nuevo.');
        }
        setIsLoading(false);
        return;
      }

      // Fetch permissions
      if (user?.id) {
        try {
          const response = await axios.get(`http://localhost:3000/api/usuariopermisos/${user.id}`);
          console.log('Permissions response:', response.data);
          if (Array.isArray(response.data)) {
            const permissions: Permiso[] = response.data.map((item: any) => ({
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
          console.error('Error fetching user permissions:', error);
          setUserPermissions([]);
        }
      }
    }

    setIsLoading(false);
  };

  // Run initialization on mount
  useEffect(() => {
    initializeAuth();
  }, [token, user?.id]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post('http://localhost:3000/api/usuarios/login', {
        usuario: username,
        contraseña: password,
      });
      console.log('Login response:', response.data);
      const { token, user: userData, permissions } = response.data;
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify({
        id: userData.id,
        username: userData.username,
        nombrecompleto: userData.nombrecompleto,
        role: 'ADMINISTRADOR',
        isAuthenticated: true,
      }));
      setToken(token);
      setUser({
        id: userData.id,
        username: userData.username,
        nombrecompleto: userData.nombrecompleto,
        role: 'ADMINISTRADOR',
        isAuthenticated: true,
      });
      setUserPermissions(
        Array.isArray(permissions)
          ? permissions.map((item: any) => ({
              permisoid: item.permisoid,
              permiso: item.permiso,
              descripcion: item.descripcion || '',
            }))
          : []
      );
      setError(null);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Error during login:', error);
      setError('Error al iniciar sesión. Verifica tus credenciales o la conexión al servidor.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('Logout triggered at:', new Date().toISOString());
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setUserPermissions([]);
    setError(null);
    setIsLoading(false);
  };

  const retryAuth = () => {
    console.log('Retrying authentication');
    initializeAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, userPermissions, isLoading, error, login, logout, retryAuth }}>
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