import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';

interface Transporte {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  capacidad: number;
  estado: 'Activo' | 'Inactivo';
}

interface FormData {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  capacidad: number;
  estado: 'Activo' | 'Inactivo';
}

const mockTransportes: Transporte[] = [
  { id: 1, placa: 'ABC-123', marca: 'Volvo', modelo: 'FH16', capacidad: 20000, estado: 'Activo' },
  { id: 2, placa: 'XYZ-789', marca: 'Mercedes', modelo: 'Actros', capacidad: 15000, estado: 'Inactivo' },
];

const Transportes: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    placa: '',
    marca: '',
    modelo: '',
    capacidad: 0,
    estado: 'Activo',
  });
  const [transportes, setTransportes] = useState<Transporte[]>(mockTransportes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update existing transporte
      setTransportes(transportes.map(t => t.id === parseInt(formData.id) ? { ...formData, id: parseInt(formData.id) } : t));
    } else {
      // Add new transporte
      const newId = transportes.length > 0 ? Math.max(...transportes.map(t => t.id)) + 1 : 1;
      setTransportes([...transportes, { ...formData, id: newId }]);
    }
    setShowForm(false);
    setFormData({ id: '', placa: '', marca: '', modelo: '', capacidad: 0, estado: 'Activo' });
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const transporte = transportes[selectedRow];
      setFormData({
        id: transporte.id.toString(),
        placa: transporte.placa,
        marca: transporte.marca,
        modelo: transporte.modelo,
        capacidad: transporte.capacidad,
        estado: transporte.estado,
      });
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      setTransportes(transportes.filter((_, index) => index !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Modificar Transporte' : 'Nuevo Transporte'}
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
                value={formData.id || (transportes.length + 1)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa:</label>
              <input
                type="text"
                value={formData.placa}
                onChange={(e) => handleInputChange('placa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca:</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo:</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (KG):</label>
              <input
                type="number"
                value={formData.capacidad}
                onChange={(e) => handleInputChange('capacidad', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="0"
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Transportes</h2>
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
            onClick={() => console.log('Imprimir transportes')}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">PLACA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MARCA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MODELO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">CAPACIDAD (KG)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ESTADO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transportes.map((transporte, index) => (
              <tr
                key={transporte.id}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{transporte.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transporte.placa}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transporte.marca}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transporte.modelo}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transporte.capacidad.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{transporte.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transportes;