import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';

interface Propietario {
  idpropietario: number;
  nombre: string;
  telefono: string;
  domicilio: string;
  status: string;
}

interface FormData {
  idpropietario?: number;
  nombre: string;
  telefono: string;
  domicilio: string;
  status: string;
}

const baseUrl = 'http://localhost:3000/api/propietarios';

const Propietarios: React.FC = () => {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    telefono: '',
    domicilio: '',
    status: 'A',
  });

  useEffect(() => {
    fetchPropietarios();
  }, []);

  const fetchPropietarios = async () => {
    try {
      const res = await axios.get(baseUrl);
      setPropietarios(res.data);
    } catch (err) {
      console.error('Error cargando propietarios', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.idpropietario) {
        await axios.put(`${baseUrl}/${formData.idpropietario}`, formData);
      } else {
        await axios.post(baseUrl, formData);
      }
      fetchPropietarios();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('Error guardando propietario', err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const propietario = propietarios[selectedRow];
      setFormData({ ...propietario });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const id = propietarios[selectedRow].idpropietario;
      await axios.delete(`${baseUrl}/${id}`);
      fetchPropietarios();
      setSelectedRow(null);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', telefono: '', domicilio: '', status: 'A' });
  };

  // --- Render ---
  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.idpropietario ? 'Modificar Propietario' : 'Nuevo Propietario'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <input
                type="text"
                value={formData.idpropietario || propietarios.length + 1}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono:</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio:</label>
              <input
                type="text"
                value={formData.domicilio}
                onChange={(e) => handleInputChange('domicilio', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Propietarios</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md text-sm"
          >
            <Edit className="w-4 h-4" /> Modificar
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md text-sm"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domicilio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {propietarios.map((p, idx) => (
              <tr
                key={p.idpropietario}
                onClick={() => setSelectedRow(idx)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedRow === idx ? 'bg-blue-100' : ''}`}
              >
                <td className="px-4 py-3">{p.idpropietario}</td>
                <td className="px-4 py-3">{p.nombre}</td>
                <td className="px-4 py-3">{p.telefono}</td>
                <td className="px-4 py-3">{p.domicilio}</td>
                <td className="px-4 py-3">{p.status === 'A' ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Propietarios;
