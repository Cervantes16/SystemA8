import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';

interface Ciclo {
  id: number;
  año: number;
  ciclo: string;
}

interface FormData {
  id: string;
  año: number;
  ciclo: string;
}

const mockCiclos: Ciclo[] = [
  { id: 1, año: 2025, ciclo: 'Ciclo 1' },
  { id: 2, año: 2025, ciclo: 'Ciclo 2' },
];

const Ciclos: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    año: new Date().getFullYear(),
    ciclo: '',
  });
  const [ciclos, setCiclos] = useState<Ciclo[]>(mockCiclos);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update existing ciclo
      setCiclos(ciclos.map(c => c.id === parseInt(formData.id) ? { ...formData, id: parseInt(formData.id) } : c));
    } else {
      // Add new ciclo
      const newId = ciclos.length > 0 ? Math.max(...ciclos.map(c => c.id)) + 1 : 1;
      setCiclos([...ciclos, { ...formData, id: newId }]);
    }
    setShowForm(false);
    setFormData({ id: '', año: new Date().getFullYear(), ciclo: '' });
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const ciclo = ciclos[selectedRow];
      setFormData({
        id: ciclo.id.toString(),
        año: ciclo.año,
        ciclo: ciclo.ciclo,
      });
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      setCiclos(ciclos.filter((_, index) => index !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Modificar Ciclo' : 'Nuevo Ciclo'}
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
                value={formData.id || (ciclos.length + 1)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Año:</label>
              <input
                type="number"
                value={formData.año}
                onChange={(e) => handleInputChange('año', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="2000"
                max="2100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo:</label>
              <input
                type="text"
                value={formData.ciclo}
                onChange={(e) => handleInputChange('ciclo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Ciclos</h2>
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
            onClick={() => console.log('Imprimir ciclos')}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">AÑO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CICLO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ciclos.map((ciclo, index) => (
              <tr
                key={ciclo.id}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{ciclo.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{ciclo.año}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{ciclo.ciclo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ciclos;