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

export interface Bodega {
  id: number;
  nombre: string;
  ubicacion: string;
  capacidad: number;
  estado: 'ACTIVA' | 'INACTIVA';
}

export interface Transporte {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  capacidad: number;
  estado: 'DISPONIBLE' | 'EN_USO' | 'MANTENIMIENTO';
}

export interface Cliente {
  id: number;
  nombre: string;
  ruc: string;
  telefono: string;
  email: string;
  direccion: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Chofer {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  licencia: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Granja {
  id: number;
  nombre: string;
  propietario: string;
  ubicacion: string;
  area: number;
  estado: 'ACTIVA' | 'INACTIVA';
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Propietario {
  id: number;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  ruc: string;
  telefono: string;
  email: string;
  direccion: string;
  categoria: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  path?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  role: string;
  isAuthenticated: boolean;
}