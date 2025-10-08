import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';
import { getBodegas, createBodega, updateBodega, deleteBodega } from '../../api/bodegasApi';

interface Bodega {
  bodegaid: number;
  bodega: string;
  lugar: string;
  foranea: string;
  estatus: string;
}

interface FormData {
  bodegaid?: number;
  bodega: string;
  lugar: string;
  foranea: string;
  estatus: string;
}

const Bodegas: React.FC = () => {
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    bodega: '',
    lugar: '',
    foranea: 'N',
    estatus: 'A',
  });

  useEffect(() => {
    fetchBodegas();
  }, []);

  const fetchBodegas = async () => {
    const data = await getBodegas();
    setBodegas(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bodegaid) {
      await updateBodega(formData.bodegaid, formData);
    } else {
      await createBodega(formData);
    }
    setShowForm(false);
    setFormData({ bodega: '', lugar: '', foranea: 'N', estatus: 'A' });
    fetchBodegas();
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const bodega = bodegas[selectedRow];
      setFormData({ ...bodega });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const bodega = bodegas[selectedRow];
      await deleteBodega(bodega.bodegaid);
      setSelectedRow(null);
      fetchBodegas();
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.bodegaid ? 'Modificar Bodega' : 'Nueva Bodega'}
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
            {formData.bodegaid && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
                <input
                  type="text"
                  value={formData.bodegaid}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bodega:</label>
              <input
                type="text"
                value={formData.bodega}
                onChange={(e) => handleInputChange('bodega', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lugar:</label>
              <input
                type="text"
                value={formData.lugar}
                onChange={(e) => handleInputChange('lugar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foranea (S/N):</label>
              <input
                type="text"
                value={formData.foranea}
                onChange={(e) => handleInputChange('foranea', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                maxLength={1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">estatus (A/I):</label>
              <select
                value={formData.estatus}
                onChange={(e) => handleInputChange('estatus', e.target.value)}
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Bodegas</h2>
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
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BODEGA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LUGAR</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FORANEA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTATUS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bodegas.map((bodega, index) => (
              <tr
                key={bodega.bodegaid}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{bodega.bodegaid}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{bodega.bodega}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{bodega.lugar}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{bodega.foranea}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{bodega.estatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bodegas;
