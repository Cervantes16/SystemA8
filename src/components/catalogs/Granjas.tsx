import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Granja {
  idgranja: number;
  granja: string;
  status: 'A' | 'I';
}

interface FormData {
  idgranja: string;
  granja: string;
  status: 'A' | 'I';
}

const Granjas: React.FC = () => {
  const [granjas, setGranjas] = useState<Granja[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    idgranja: '',
    granja: '',
    status: 'A',
  });

  //const API_URL = 'http://localhost:3000/api/granjas'; // Funciona con proxy Vite

  // ======== Cargar todas las granjas ========
  const fetchGranjas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/granjas');
      // Asegurarnos de que sea un array
      const data = Array.isArray(res.data) ? res.data : [];
      setGranjas(data);
    } catch (error) {
      console.error('Error fetching granjas', error);
      setGranjas([]); // fallback
    }
  };


  useEffect(() => {
    fetchGranjas();
  }, []);

  // ======== Manejo de formulario ========
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.idgranja) {
        // Actualizar
        await axios.put(`http://localhost:3000/api/granjas/${formData.idgranja}`, formData);
        toast.success('Cliente actualizado');
      } else {
        // Crear
        await axios.post('http://localhost:3000/api/granjas', formData);
        toast.success('Cliente creado');
      }
      setShowForm(false);
      setFormData({ idgranja: '', granja: '', status: 'A' });
      fetchGranjas();
    } catch (error) {
      console.error('Error saving granja', error);
    }
  };

  // ======== Modificar ========
  const handleModify = () => {
    if (selectedRow !== null) {
      const g = granjas[selectedRow];
      setFormData({
        idgranja: g.idgranja.toString(),
        granja: g.granja,
        status: g.status,
      });
      setShowForm(true);
    }
  };

  // ======== Eliminar lógico ========
  const handleDelete = async () => {
    if (selectedRow !== null) {
      const g = granjas[selectedRow];
      try {
        await axios.delete(`http://localhost:3000/api/granjas/${g.idgranja}`);
        fetchGranjas();
        setSelectedRow(null);
      } catch (error) {
        console.error('Error deleting granja', error);
      }
    }
  };

  // ======== Renderizar formulario ========
  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.idgranja ? 'Modificar Granja' : 'Nueva Granja'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Granja:</label>
              <input
                type="text"
                value={formData.granja}
                onChange={(e) => handleInputChange('granja', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'A' | 'I')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Activa</option>
                <option value="I">Inactiva</option>
              </select>
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
        <ToastContainer />
      </div>
    );
  }

  // ======== Renderizar tabla ========
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
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm">
            <Plus className="w-4 h-4" /> Nuevo
          </button>
          <button onClick={handleModify} disabled={selectedRow === null} className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md text-sm">
            <Edit className="w-4 h-4" /> Modificar
          </button>
          <button onClick={handleDelete} disabled={selectedRow === null} className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md text-sm">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {granjas.map((g, index) => (
              <tr
                key={g.idgranja}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 ${selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{g.idgranja}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{g.granja}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{g.status === 'A' ? 'Activa' : 'Inactiva'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Granjas;
