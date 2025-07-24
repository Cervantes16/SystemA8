export interface User {
  id: number;
  usuario: string;
  role: 'ADMINISTRADOR' | 'NOMINA' | 'RECIBO' | 'DESCABECE' | 'CLASIFICADO' | 'EMPAQUE' | 'ALMACEN';
}

export interface Talla {
  id: number;
  talla: string;
}

export interface Ciclo {
  id: number;
  año: number;
  ciclo: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  path?: string;
}

export interface AuthUser {
  username: string;
  role: string;
  isAuthenticated: boolean;
}