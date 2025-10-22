import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';

interface Chofer {
  choferid: number;
  nombre: string;
  domicilio: string;
  telefono: string;
  //licencia: string;
  status: 'A' | 'I';
}

interface FormData {
  choferid?: number;
  nombre: string;
  domicilio: string;
  telefono: string;
  //licencia: string;
  status: 'A' | 'I';
}

const Choferes: React.FC = () => {
  const [choferes, setChoferes] = useState<Chofer[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    domicilio: '',
    telefono: '',
    //licencia: '',
    status: 'A',
  });

  // --- CARGAR CHOFERES ---
  const fetchChoferes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/choferes');
      setChoferes(res.data);
    } catch (err) {
      console.error('Error al cargar choferes', err);
    }
  };

  useEffect(() => {
    fetchChoferes();
  }, []);

  // --- GUARDAR / MODIFICAR ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.choferid) {
        // Modificar chofer
        const res = await axios.put(`http://localhost:3000/api/choferes/${formData.choferid}`, formData);
        setChoferes(prev => prev.map(c => c.choferid === res.data.choferid ? res.data : c));
      } else {
        // Crear chofer
        const res = await axios.post('http://localhost:3000/api/choferes', formData);
        setChoferes(prev => [...prev, res.data]);
      }
      setShowForm(false);
      setFormData({ nombre: '', domicilio: '', telefono: '', //licencia: ''
         status: 'A' });
      setSelectedRow(null);
    } catch (err) {
      console.error('Error al guardar chofer', err);
    }
  };

  // --- SELECCIONAR PARA MODIFICAR ---
  const handleModify = () => {
    if (selectedRow !== null) {
      const chofer = choferes[selectedRow];
      setFormData({ ...chofer });
      setShowForm(true);
    }
  };

  // --- ELIMINAR / DESACTIVAR ---
  const handleDelete = async () => {
    if (selectedRow !== null) {
      const id = choferes[selectedRow].choferid;
      try {
        await axios.delete(`http://localhost:3000/api/choferes/${id}`);
        setChoferes(prev => prev.filter(c => c.choferid !== id));
        setSelectedRow(null);
      } catch (err) {
        console.error('Error al eliminar chofer', err);
      }
    }
  };

  // --- INPUT CHANGE ---
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- FORMULARIO ---
  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.choferid ? 'Modificar Chofer' : 'Nuevo Chofer'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio:</label>
              <input
                type="text"
                value={formData.domicilio}
                onChange={(e) => handleInputChange('domicilio', e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'A' | 'I')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar
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

  // --- LISTA DE CHOFERES ---
  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Choferes</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Edit className="w-4 h-4" /> Modificar
          </button>
          <button
            onClick={() => console.log('Imprimir choferes')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOMBRE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOMICILIO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TELÉFONO</th>              
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ESTADO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {choferes.map((chofer, index) => (
              <tr
                key={chofer.choferid}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{chofer.choferid}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{chofer.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{chofer.domicilio}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{chofer.telefono}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{chofer.status === 'A' ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Choferes;
