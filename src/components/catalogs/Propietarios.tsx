import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';

interface Propietario {
  id: number;
  nombre: string;
  rfc: string;
  telefono: string;
  email: string;
}

interface FormData {
  id: string;
  nombre: string;
  rfc: string;
  telefono: string;
  email: string;
}

const mockPropietarios: Propietario[] = [
  { id: 1, nombre: 'Juan López', rfc: '1234567890', telefono: '123-456-7890', email: 'juan.lopez@email.com' },
  { id: 2, nombre: 'María Torres', rfc: '0987654321', telefono: '987-654-3210', email: 'maria.torres@email.com' },
];

const Propietarios: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    nombre: '',
    rfc: '',
    telefono: '',
    email: '',
  });
  const [propietarios, setPropietarios] = useState<Propietario[]>(mockPropietarios);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update existing propietario
      setPropietarios(propietarios.map(p => p.id === parseInt(formData.id) ? { ...formData, id: parseInt(formData.id) } : p));
    } else {
      // Add new propietario
      const newId = propietarios.length > 0 ? Math.max(...propietarios.map(p => p.id)) + 1 : 1;
      setPropietarios([...propietarios, { ...formData, id: newId }]);
    }
    setShowForm(false);
    setFormData({ id: '', nombre: '', rfc: '', telefono: '', email: '' });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const propietario = propietarios[selectedRow];
      setFormData({
        id: propietario.id.toString(),
        nombre: propietario.nombre,
        rfc: propietario.rfc,
        telefono: propietario.telefono,
        email: propietario.email,
      });
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      setPropietarios(propietarios.filter((_, index) => index !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Modificar Propietario' : 'Nuevo Propietario'}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <input
                type="text"
                value={formData.id || (propietarios.length + 1)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula:</label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => handleInputChange('rfc', e.target.value)}
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
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Propietarios</h2>
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
            onClick={() => console.log('Imprimir propietarios')}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">CÉDULA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">TELÉFONO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMAIL</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {propietarios.map((propietario, index) => (
              <tr
                key={propietario.id}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{propietario.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{propietario.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{propietario.rfc}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{propietario.telefono}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{propietario.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Propietarios;