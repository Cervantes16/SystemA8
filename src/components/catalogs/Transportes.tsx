import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import {
  getCarros,
  createCarro,
  updateCarro,
  toggleCarroStatus,
  markCarroInactive
} from '../../api/carrosApi';

interface Carro {
  carroid: number;
  placas: string;
  marca: string;
  modelo: string;
  status: 'A' | 'I';
}

interface FormData {
  carroid?: number;
  placas: string;
  marca: string;
  modelo: string;
  status: 'A' | 'I';
}

const Transportes: React.FC = () => {
  const [carros, setCarros] = useState<Carro[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    placas: '',
    marca: '',
    modelo: '',
    status: 'A',
  });

  // -------------------- Fetch --------------------
  const fetchCarros = async () => {
    try {
      const data = await getCarros();
      setCarros(data);
    } catch (error) {
      console.error('Error al consultar carros', error);
    }
  };

  useEffect(() => { fetchCarros(); }, []);

  // -------------------- Formulario --------------------
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.carroid) {
        await updateCarro(formData.carroid, formData);
      } else {
        await createCarro(formData);
      }
      setShowForm(false);
      setFormData({ placas: '', marca: '', modelo: '', status: 'A' });
      fetchCarros();
      setSelectedRow(null);
    } catch (error) {
      console.error('Error al guardar carro', error);
    }
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const carro = carros.find(c => c.carroid === selectedRow);
      if (carro) {
        setFormData({ ...carro });
        setShowForm(true);
      }
    }
  };

  // -------------------- Acciones --------------------
  const handleDelete = async () => {
    if (selectedRow !== null) {
      try {
        await markCarroInactive(selectedRow);
        setCarros(prev =>
          prev.map(c => c.carroid === selectedRow ? { ...c, status: 'I' } : c)
        );
        setSelectedRow(null);
      } catch (error) {
        console.error('Error al marcar como inactivo', error);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (selectedRow !== null) {
      try {
        await toggleCarroStatus(selectedRow);
        fetchCarros();
      } catch (error) {
        console.error('Error al cambiar el estado', error);
      }
    }
  };

  // -------------------- Render --------------------
  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.carroid ? 'Modificar Transporte' : 'Nuevo Transporte'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
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
                value={formData.carroid ?? carros.length + 1}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placas:</label>
              <input
                type="text"
                value={formData.placas}
                onChange={e => handleInputChange('placas', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca:</label>
              <input
                type="text"
                value={formData.marca}
                onChange={e => handleInputChange('marca', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo:</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={e => handleInputChange('modelo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value as 'A' | 'I')}
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

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Transportes</h2>
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
            onClick={handleToggleStatus}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Save className="w-4 h-4" /> Cambiar Estado
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">PLACAS</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MARCA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MODELO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">ESTADO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carros.map(t => (
              <tr
                key={t.carroid}
                onClick={() => setSelectedRow(t.carroid)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === t.carroid ? 'bg-blue-100' : 'bg-white'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{t.carroid}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{t.placas}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{t.marca}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{t.modelo}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{t.status === 'A' ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transportes;
