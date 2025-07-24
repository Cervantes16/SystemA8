import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DataTable from './DataTable';
import { mockUsers, mockTallas, mockCiclos } from '../data/mockData';

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