import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';

interface Granja {
  id: number;
  nombre: string;
  propietario: string;
  ubicacion: string;
  area: number;
  estado: 'Activa' | 'Inactiva';
}

interface FormData {
  id: string;
  nombre: string;
  propietario: string;
  ubicacion: string;
  area: number;
  estado: 'Activa' | 'Inactiva';
}

const mockGranjas: Granja[] = [
  { id: 1, nombre: 'Granja El Sol', propietario: 'Juan López', ubicacion: 'Valle Central', area: 50.5, estado: 'Activa' },
  { id: 2, nombre: 'Granja La Luna', propietario: 'María Torres', ubicacion: 'Zona Norte', area: 75.0, estado: 'Inactiva' },
];

const Granjas: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    nombre: '',
    propietario: '',
    ubicacion: '',
    area: 0,
    estado: 'Activa',
  });
  const [granjas, setGranjas] = useState<Granja[]>(mockGranjas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update existing granja
      setGranjas(granjas.map(g => g.id === parseInt(formData.id) ? { ...formData, id: parseInt(formData.id) } : g));
    } else {
      // Add new granja
      const newId = granjas.length > 0 ? Math.max(...granjas.map(g => g.id)) + 1 : 1;
      setGranjas([...granjas, { ...formData, id: newId }]);
    }
    setShowForm(false);
    setFormData({ id: '', nombre: '', propietario: '', ubicacion: '', area: 0, estado: 'Activa' });
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const granja = granjas[selectedRow];
      setFormData({
        id: granja.id.toString(),
        nombre: granja.nombre,
        propietario: granja.propietario,
        ubicacion: granja.ubicacion,
        area: granja.area,
        estado: granja.estado,
      });
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      setGranjas(granjas.filter((_, index) => index !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Modificar Granja' : 'Nueva Granja'}
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
                value={formData.id || (granjas.length + 1)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
              <input
                type="text"
                value={formData.propietario}
                onChange={(e) => handleInputChange('propietario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación:</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área (HA):</label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) => handleInputChange('area', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value as 'Activa' | 'Inactiva')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="Activa">Activa</option>
                <option value="Inactiva">Inactiva</option>
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Granjas</h2>
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
            onClick={() => console.log('Imprimir granjas')}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOMBRE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROPIETARIO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UBICACIÓN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">ÁREA (HA)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ESTADO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {granjas.map((granja, index) => (
              <tr
                key={granja.id}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{granja.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{granja.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{granja.propietario}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{granja.ubicacion}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{granja.area.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{granja.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Granjas;