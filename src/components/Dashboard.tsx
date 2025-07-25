import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DataTable from './DataTable';
import { 
  mockUsers, 
  mockTallas, 
  mockCiclos, 
  mockBodegas, 
  mockTransportes, 
  mockClientes, 
  mockChoferes, 
  mockGranjas, 
  mockProductos, 
  mockPropietarios, 
  mockProveedores 
} from '../data/mockData';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('usuarios');

  const renderContent = () => {
    switch (activeSection) {
      case 'usuarios':
        return (
          <DataTable
            title="Consulta de Usuarios"
            columns={[
              { key: 'id', label: 'ID', width: '100px' },
              { key: 'usuario', label: 'USUARIO' },
            ]}
            data={mockUsers}
            onNew={() => console.log('Nuevo usuario')}
            onModify={(user) => console.log('Modificar usuario:', user)}
            onDelete={(user) => console.log('Eliminar usuario:', user)}
            onPrint={() => console.log('Imprimir usuarios')}
          />
        );
      
      case 'tallas':
        return (
          <DataTable
            title="Consulta de Tallas"
            columns={[
              { key: 'id', label: 'ID', width: '100px' },
              { key: 'talla', label: 'TALLA' },
            ]}
            data={mockTallas}
            onNew={() => console.log('Nueva talla')}
            onModify={(talla) => console.log('Modificar talla:', talla)}
            onDelete={(talla) => console.log('Eliminar talla:', talla)}
            onPrint={() => console.log('Imprimir tallas')}
          />
        );
      
      case 'ciclos':
        return (
          <DataTable
            title="Consulta de Ciclos"
            columns={[
              { key: 'id', label: 'ID', width: '100px' },
              { key: 'año', label: 'AÑO', width: '200px' },
              { key: 'ciclo', label: 'CICLO' },
            ]}
            data={mockCiclos}
            onNew={() => console.log('Nuevo ciclo')}
            onModify={(ciclo) => console.log('Modificar ciclo:', ciclo)}
            onDelete={(ciclo) => console.log('Eliminar ciclo:', ciclo)}
            onPrint={() => console.log('Imprimir ciclos')}
          />
        );
      
      case 'bodegas':
        return (
          <DataTable
            title="Consulta de Bodegas"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'nombre', label: 'NOMBRE' },
              { key: 'ubicacion', label: 'UBICACIÓN' },
              { key: 'capacidad', label: 'CAPACIDAD (KG)', width: '150px' },
              { key: 'estado', label: 'ESTADO', width: '120px' },
            ]}
            data={mockBodegas}
            onNew={() => console.log('Nueva bodega')}
            onModify={(bodega) => console.log('Modificar bodega:', bodega)}
            onDelete={(bodega) => console.log('Eliminar bodega:', bodega)}
            onPrint={() => console.log('Imprimir bodegas')}
          />
        );

      case 'transportes':
        return (
          <DataTable
            title="Consulta de Transportes"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'placa', label: 'PLACA', width: '120px' },
              { key: 'marca', label: 'MARCA' },
              { key: 'modelo', label: 'MODELO' },
              { key: 'capacidad', label: 'CAPACIDAD (KG)', width: '150px' },
              { key: 'estado', label: 'ESTADO', width: '140px' },
            ]}
            data={mockTransportes}
            onNew={() => console.log('Nuevo transporte')}
            onModify={(transporte) => console.log('Modificar transporte:', transporte)}
            onDelete={(transporte) => console.log('Eliminar transporte:', transporte)}
            onPrint={() => console.log('Imprimir transportes')}
          />
        );

      case 'clientes':
        return (
          <DataTable
            title="Consulta de Clientes"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'nombre', label: 'NOMBRE' },
              { key: 'ruc', label: 'RUC', width: '140px' },
              { key: 'telefono', label: 'TELÉFONO', width: '120px' },
              { key: 'email', label: 'EMAIL' },
              { key: 'estado', label: 'ESTADO', width: '100px' },
            ]}
            data={mockClientes}
            onNew={() => console.log('Nuevo cliente')}
            onModify={(cliente) => console.log('Modificar cliente:', cliente)}
            onDelete={(cliente) => console.log('Eliminar cliente:', cliente)}
            onPrint={() => console.log('Imprimir clientes')}
          />
        );

      case 'choferes':
        return (
          <DataTable
            title="Consulta de Choferes"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'nombre', label: 'NOMBRE' },
              { key: 'cedula', label: 'CÉDULA', width: '120px' },
              { key: 'telefono', label: 'TELÉFONO', width: '120px' },
              { key: 'licencia', label: 'LICENCIA', width: '120px' },
              { key: 'estado', label: 'ESTADO', width: '100px' },
            ]}
            data={mockChoferes}
            onNew={() => console.log('Nuevo chofer')}
            onModify={(chofer) => console.log('Modificar chofer:', chofer)}
            onDelete={(chofer) => console.log('Eliminar chofer:', chofer)}
            onPrint={() => console.log('Imprimir choferes')}
          />
        );

      case 'granjas':
        return (
          <DataTable
            title="Consulta de Granjas"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'nombre', label: 'NOMBRE' },
              { key: 'propietario', label: 'PROPIETARIO' },
              { key: 'ubicacion', label: 'UBICACIÓN' },
              { key: 'area', label: 'ÁREA (HA)', width: '120px' },
              { key: 'estado', label: 'ESTADO', width: '100px' },
            ]}
            data={mockGranjas}
            onNew={() => console.log('Nueva granja')}
            onModify={(granja) => console.log('Modificar granja:', granja)}
            onDelete={(granja) => console.log('Eliminar granja:', granja)}
            onPrint={() => console.log('Imprimir granjas')}
          />
        );

      case 'productos':
        return (
          <DataTable
            title="Consulta de Productos"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'codigo', label: 'CÓDIGO', width: '120px' },
              { key: 'nombre', label: 'NOMBRE' },
              { key: 'categoria', label: 'CATEGORÍA' },
              { key: 'precio', label: 'PRECIO ($)', width: '120px' },
              { key: 'estado', label: 'ESTADO', width: '100px' },
            ]}
            data={mockProductos}
            onNew={() => console.log('Nuevo producto')}
            onModify={(producto) => console.log('Modificar producto:', producto)}
            onDelete={(producto) => console.log('Eliminar producto:', producto)}
            onPrint={() => console.log('Imprimir productos')}
          />
        );

      case 'propietarios':
        return (
          <DataTable
            title="Consulta de Propietarios"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'nombre', label: 'NOMBRE' },
              { key: 'cedula', label: 'CÉDULA', width: '120px' },
              { key: 'telefono', label: 'TELÉFONO', width: '120px' },
              { key: 'email', label: 'EMAIL' },
            ]}
            data={mockPropietarios}
            onNew={() => console.log('Nuevo propietario')}
            onModify={(propietario) => console.log('Modificar propietario:', propietario)}
            onDelete={(propietario) => console.log('Eliminar propietario:', propietario)}
            onPrint={() => console.log('Imprimir propietarios')}
          />
        );

      case 'proveedores':
        return (
          <DataTable
            title="Consulta de Proveedores"
            columns={[
              { key: 'id', label: 'ID', width: '80px' },
              { key: 'nombre', label: 'NOMBRE' },
              { key: 'ruc', label: 'RUC', width: '140px' },
              { key: 'categoria', label: 'CATEGORÍA' },
              { key: 'telefono', label: 'TELÉFONO', width: '120px' },
              { key: 'estado', label: 'ESTADO', width: '100px' },
            ]}
            data={mockProveedores}
            onNew={() => console.log('Nuevo proveedor')}
            onModify={(proveedor) => console.log('Modificar proveedor:', proveedor)}
            onDelete={(proveedor) => console.log('Eliminar proveedor:', proveedor)}
            onPrint={() => console.log('Imprimir proveedores')}
          />
        );

      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
              </h2>
              <p className="text-gray-600">
                Módulo en desarrollo. Seleccione otra opción del menú.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}