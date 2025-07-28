import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  estado: 'Activo' | 'Inactivo';
}

interface FormData {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  estado: 'Activo' | 'Inactivo';
}

const mockProductos: Producto[] = [
  { id: 1, codigo: 'P001', nombre: 'Manzana Gala', categoria: 'Frutas', precio: 2.5, estado: 'Activo' },
  { id: 2, codigo: 'P002', nombre: 'Plátano Cavendish', categoria: 'Frutas', precio: 1.8, estado: 'Inactivo' },
];

const Productos: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    codigo: '',
    nombre: '',
    categoria: '',
    precio: 0,
    estado: 'Activo',
  });
  const [productos, setProductos] = useState<Producto[]>(mockProductos);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update existing producto
      setProductos(productos.map(p => p.id === parseInt(formData.id) ? { ...formData, id: parseInt(formData.id) } : p));
    } else {
      // Add new producto
      const newId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
      setProductos([...productos, { ...formData, id: newId }]);
    }
    setShowForm(false);
    setFormData({ id: '', codigo: '', nombre: '', categoria: '', precio: 0, estado: 'Activo' });
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const producto = productos[selectedRow];
      setFormData({
        id: producto.id.toString(),
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        estado: producto.estado,
      });
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      setProductos(productos.filter((_, index) => index !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Modificar Producto' : 'Nuevo Producto'}
            </h2>
            <button 
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <input
                type="text"
                value={formData.id || (productos.length + 1)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código:</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría:</label>
              <input
                type="text"
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($):</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value as 'Activo' | 'Inactivo')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Productos</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Modificar
          </button>
          <button
            onClick={() => console.log('Imprimir productos')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">CÓDIGO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOMBRE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORÍA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">PRECIO ($)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ESTADO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto, index) => (
              <tr
                key={producto.id}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{producto.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{producto.codigo}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{producto.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{producto.categoria}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{producto.precio.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{producto.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Productos;