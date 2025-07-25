import { User, Talla, Ciclo, Bodega, Transporte, Cliente, Chofer, Granja, Producto, Propietario, Proveedor } from '../types';

export const mockUsers: User[] = [
  { id: 1, usuario: 'ADMINISTRADOR', role: 'ADMINISTRADOR' },
  { id: 2, usuario: 'NOMINA', role: 'NOMINA' },
  { id: 3, usuario: 'RECIBO', role: 'RECIBO' },
  { id: 4, usuario: 'DESCABECE', role: 'DESCABECE' },
  { id: 5, usuario: 'CLASIFICADO', role: 'CLASIFICADO' },
  { id: 6, usuario: 'EMPAQUE', role: 'EMPAQUE' },
  { id: 7, usuario: 'ALMACEN', role: 'ALMACEN' },
];

export const mockTallas: Talla[] = [
  { id: 1, talla: '41-50' },
  { id: 2, talla: '51-60' },
  { id: 3, talla: '41-50 PS' },
  { id: 4, talla: '31-35' },
  { id: 5, talla: '26-30' },
  { id: 6, talla: '61-70' },
  { id: 7, talla: '111-130' },
  { id: 8, talla: '71-90' },
  { id: 9, talla: '36-40' },
  { id: 10, talla: '51-60 PS' },
  { id: 11, talla: '36-40 PS' },
  { id: 12, talla: '171-190' },
  { id: 13, talla: '91-110' },
  { id: 14, talla: '131-150' },
  { id: 15, talla: '21-25' },
  { id: 16, talla: '30-40' },
  { id: 17, talla: '40-50' },
  { id: 18, talla: '36-40 R' },
  { id: 19, talla: '41-50 R' },
  { id: 20, talla: 'LARVA R' },
  { id: 21, talla: 'LARVA C' },
  { id: 22, talla: '20-30' },
  { id: 23, talla: 'LARVA' },
  { id: 24, talla: '10-20' },
  { id: 25, talla: '16-20' },
  { id: 26, talla: 'U-12' },
  { id: 27, talla: 'U-15' },
  { id: 28, talla: '41-50 S' },
  { id: 29, talla: 'U-10 S' },
  { id: 30, talla: 'U-12 S' },
  { id: 31, talla: 'U-15 S' },
];

export const mockCiclos: Ciclo[] = [
  { id: 1, año: 2019, ciclo: '2019-2' },
  { id: 2, año: 2020, ciclo: '2020-1' },
  { id: 3, año: 2020, ciclo: '2020-2' },
  { id: 4, año: 2021, ciclo: '2021-1' },
  { id: 5, año: 2021, ciclo: '2021-2' },
  { id: 6, año: 2022, ciclo: '2022-1' },
  { id: 7, año: 2022, ciclo: '2022-2' },
  { id: 8, año: 2023, ciclo: '2023-1' },
  { id: 9, año: 2023, ciclo: '2023-2' },
  { id: 10, año: 2024, ciclo: '2024-1' },
  { id: 11, año: 2024, ciclo: '2024-2' },
  { id: 12, año: 2025, ciclo: '2025-1' },
];

export const mockBodegas: Bodega[] = [
  { id: 1, nombre: 'Bodega Principal', ubicacion: 'Zona Norte', capacidad: 5000, estado: 'ACTIVA' },
  { id: 2, nombre: 'Bodega Secundaria', ubicacion: 'Zona Sur', capacidad: 3000, estado: 'ACTIVA' },
  { id: 3, nombre: 'Bodega de Emergencia', ubicacion: 'Centro', capacidad: 1500, estado: 'INACTIVA' },
  { id: 4, nombre: 'Bodega Refrigerada A', ubicacion: 'Puerto', capacidad: 8000, estado: 'ACTIVA' },
  { id: 5, nombre: 'Bodega Refrigerada B', ubicacion: 'Puerto', capacidad: 7500, estado: 'ACTIVA' },
];

export const mockTransportes: Transporte[] = [
  { id: 1, placa: 'ABC-123', marca: 'Volvo', modelo: 'FH16', capacidad: 25000, estado: 'DISPONIBLE' },
  { id: 2, placa: 'DEF-456', marca: 'Mercedes', modelo: 'Actros', capacidad: 30000, estado: 'EN_USO' },
  { id: 3, placa: 'GHI-789', marca: 'Scania', modelo: 'R450', capacidad: 28000, estado: 'DISPONIBLE' },
  { id: 4, placa: 'JKL-012', marca: 'Iveco', modelo: 'Stralis', capacidad: 22000, estado: 'MANTENIMIENTO' },
  { id: 5, placa: 'MNO-345', marca: 'DAF', modelo: 'XF', capacidad: 26000, estado: 'DISPONIBLE' },
];

export const mockClientes: Cliente[] = [
  { id: 1, nombre: 'Mariscos del Pacífico S.A.', ruc: '0992345678001', telefono: '04-2345678', email: 'ventas@mariscospac.com', direccion: 'Av. Principal 123', estado: 'ACTIVO' },
  { id: 2, nombre: 'Exportadora Marina Ltda.', ruc: '0987654321001', telefono: '04-8765432', email: 'info@exportmarina.com', direccion: 'Calle Comercio 456', estado: 'ACTIVO' },
  { id: 3, nombre: 'Congelados Premium', ruc: '0912345678001', telefono: '04-1234567', email: 'pedidos@premium.com', direccion: 'Zona Industrial 789', estado: 'ACTIVO' },
  { id: 4, nombre: 'Distribuidora Oceánica', ruc: '0923456789001', telefono: '04-2345679', email: 'compras@oceanica.com', direccion: 'Puerto Pesquero 321', estado: 'INACTIVO' },
  { id: 5, nombre: 'Seafood International', ruc: '0934567890001', telefono: '04-3456780', email: 'export@seafood.com', direccion: 'Muelle Central 654', estado: 'ACTIVO' },
];

export const mockChoferes: Chofer[] = [
  { id: 1, nombre: 'Carlos Mendoza', cedula: '0912345678', telefono: '099-123-4567', licencia: 'E1-123456', estado: 'ACTIVO' },
  { id: 2, nombre: 'Luis Rodriguez', cedula: '0923456789', telefono: '098-234-5678', licencia: 'E1-234567', estado: 'ACTIVO' },
  { id: 3, nombre: 'Miguel Torres', cedula: '0934567890', telefono: '097-345-6789', licencia: 'E1-345678', estado: 'ACTIVO' },
  { id: 4, nombre: 'Roberto Silva', cedula: '0945678901', telefono: '096-456-7890', licencia: 'E1-456789', estado: 'INACTIVO' },
  { id: 5, nombre: 'Fernando Castro', cedula: '0956789012', telefono: '095-567-8901', licencia: 'E1-567890', estado: 'ACTIVO' },
];

export const mockGranjas: Granja[] = [
  { id: 1, nombre: 'Granja San Pedro', propietario: 'Juan Pérez', ubicacion: 'Sector Norte', area: 150, estado: 'ACTIVA' },
  { id: 2, nombre: 'Acuícola El Dorado', propietario: 'María González', ubicacion: 'Sector Sur', area: 200, estado: 'ACTIVA' },
  { id: 3, nombre: 'Camaronera Pacífico', propietario: 'Carlos Ramírez', ubicacion: 'Costa Este', area: 300, estado: 'ACTIVA' },
  { id: 4, nombre: 'Granja Los Manglares', propietario: 'Ana Morales', ubicacion: 'Zona Costera', area: 180, estado: 'INACTIVA' },
  { id: 5, nombre: 'Acuacultura Moderna', propietario: 'Pedro Vásquez', ubicacion: 'Sector Central', area: 250, estado: 'ACTIVA' },
];

export const mockProductos: Producto[] = [
  { id: 1, codigo: 'CAM-001', nombre: 'Camarón Blanco', categoria: 'Crustáceos', precio: 12.50, estado: 'ACTIVO' },
  { id: 2, codigo: 'CAM-002', nombre: 'Camarón Tigre', categoria: 'Crustáceos', precio: 15.00, estado: 'ACTIVO' },
  { id: 3, codigo: 'PES-001', nombre: 'Corvina', categoria: 'Pescados', precio: 8.75, estado: 'ACTIVO' },
  { id: 4, codigo: 'PES-002', nombre: 'Dorado', categoria: 'Pescados', precio: 18.00, estado: 'ACTIVO' },
  { id: 5, codigo: 'MOL-001', nombre: 'Calamar', categoria: 'Moluscos', precio: 9.25, estado: 'INACTIVO' },
  { id: 6, codigo: 'CAN-001', nombre: 'Cangrejo Azul', categoria: 'Crustáceos', precio: 22.00, estado: 'ACTIVO' },
];

export const mockPropietarios: Propietario[] = [
  { id: 1, nombre: 'Juan Carlos Pérez', cedula: '0912345678', telefono: '099-123-4567', email: 'jperez@email.com', direccion: 'Av. Principal 123' },
  { id: 2, nombre: 'María Elena González', cedula: '0923456789', telefono: '098-234-5678', email: 'mgonzalez@email.com', direccion: 'Calle Secundaria 456' },
  { id: 3, nombre: 'Carlos Alberto Ramírez', cedula: '0934567890', telefono: '097-345-6789', email: 'cramirez@email.com', direccion: 'Sector Norte 789' },
  { id: 4, nombre: 'Ana Lucía Morales', cedula: '0945678901', telefono: '096-456-7890', email: 'amorales@email.com', direccion: 'Zona Costera 321' },
  { id: 5, nombre: 'Pedro Antonio Vásquez', cedula: '0956789012', telefono: '095-567-8901', email: 'pvasquez@email.com', direccion: 'Centro Urbano 654' },
];

export const mockProveedores: Proveedor[] = [
  { id: 1, nombre: 'Suministros Marinos S.A.', ruc: '0992345678001', telefono: '04-2345678', email: 'ventas@suministros.com', direccion: 'Zona Industrial A', categoria: 'Equipos', estado: 'ACTIVO' },
  { id: 2, nombre: 'Hielo y Refrigeración', ruc: '0987654321001', telefono: '04-8765432', email: 'pedidos@hielo.com', direccion: 'Sector Comercial B', categoria: 'Insumos', estado: 'ACTIVO' },
  { id: 3, nombre: 'Empaques del Mar', ruc: '0912345678001', telefono: '04-1234567', email: 'info@empaques.com', direccion: 'Parque Industrial C', categoria: 'Embalaje', estado: 'ACTIVO' },
  { id: 4, nombre: 'Químicos Acuícolas', ruc: '0923456789001', telefono: '04-2345679', email: 'ventas@quimicos.com', direccion: 'Zona Franca D', categoria: 'Químicos', estado: 'INACTIVO' },
  { id: 5, nombre: 'Transporte Especializado', ruc: '0934567890001', telefono: '04-3456780', email: 'logistica@transporte.com', direccion: 'Terminal Portuario E', categoria: 'Logística', estado: 'ACTIVO' },
];