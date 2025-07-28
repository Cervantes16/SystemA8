import React, { useState } from 'react';
import Sidebar from './Sidebar';
import DataTable from './DataTable';
import RecepcionProducto from './operations/RecepcionProducto';
import Clasificacion from './operations/Clasificacion';
import Empaque from './operations/Empaque';
import GeneracionEtiquetas from './operations/GeneracionEtiquetas';
import Bodegas from './catalogs/Bodega';
import Transportes from './catalogs/Transportes';
import Ciclos from './catalogs/Ciclos';
import Usuarios from './catalogs/Usuarios';
import Tallas from './catalogs/Tallas';
import Clientes from './catalogs/Clientes';
import Choferes from './catalogs/Choferes';
import Granjas from './catalogs/Granjas';
import Productos from './catalogs/Productos';
import Propietarios from './catalogs/Propietarios';
import Proveedores from './catalogs/Proveedores';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('usuarios');

  const renderContent = () => {
    switch (activeSection) {
      case 'usuarios':
        return <Usuarios />;
      
      case 'tallas':
        return <Tallas />;
      
      case 'ciclos':
        return <Ciclos />;
        
      case 'bodegas':
        return <Bodegas />;

      case 'transportes':
        return <Transportes />;

      case 'clientes':
        return <Clientes />;

      case 'choferes':
        return <Choferes />;

      case 'granjas':
        return <Granjas />;

      case 'productos':
        return <Productos />;

      case 'propietarios':
        return <Propietarios />;

      case 'recepcion':
        return <RecepcionProducto />;
      
      case 'clasificacion':
        return <Clasificacion />;
      
      case 'empaque':
        return <Empaque />;
      
      case 'etiquetas':
        return <GeneracionEtiquetas />;

      case 'proveedores':
        return <Proveedores />;

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