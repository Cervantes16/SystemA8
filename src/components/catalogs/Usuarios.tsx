import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';

interface Usuario {
  id: number;
  usuario: string;
  nombreCompleto: string;
  permisos: string[];
}

interface FormData {
  id: string;
  usuario: string;
  nombreCompleto: string;
  permisos: string[];
}

const mockUsers: Usuario[] = [
  { id: 1, usuario: 'admin', nombreCompleto: 'Administrador Principal', permisos: ['Bodegas', 'Transportes', 'Ciclos', 'Usuarios'] },
  { id: 2, usuario: 'jdoe', nombreCompleto: 'John Doe', permisos: ['Bodegas', 'Ciclos'] },
];

const modules = ['Bodegas', 'Transportes', 'Ciclos', 'Usuarios'];

const Usuarios: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    usuario: '',
    nombreCompleto: '',
    permisos: [],
  });
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsers);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      // Update existing usuario
      setUsuarios(usuarios.map(u => u.id === parseInt(formData.id) ? { ...formData, id: parseInt(formData.id) } : u));
    } else {
      // Add new usuario
      const newId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
      setUsuarios([...usuarios, { ...formData, id: newId }]);
    }
    setShowForm(false);
    setFormData({ id: '', usuario: '', nombreCompleto: '', permisos: [] });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (module: string) => {
    setFormData(prev => ({
      ...prev,
      permisos: prev.permisos.includes(module)
        ? prev.permisos.filter(m => m !== module)
        : [...prev.permisos, module],
    }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const usuario = usuarios[selectedRow];
      setFormData({
        id: usuario.id.toString(),
        usuario: usuario.usuario,
        nombreCompleto: usuario.nombreCompleto,
        permisos: usuario.permisos,
      });
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      setUsuarios(usuarios.filter((_, index) => index !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Modificar Usuario' : 'Nuevo Usuario'}
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
                value={formData.id || (usuarios.length + 1)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario:</label>
              <input
                type="text"
                value={formData.usuario}
                onChange={(e) => handleInputChange('usuario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo:</label>
              <input
                type="text"
                value={formData.nombreCompleto}
                onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Permisos</h3>
            <div className="grid grid-cols-2 gap-4">
              {modules.map(module => (
                <div key={module} className="flex items-center">
                  <input
                    type="checkbox"
                    id={module}
                    checked={formData.permisos.includes(module)}
                    onChange={() => handlePermissionChange(module)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={module} className="ml-2 text-sm text-gray-700">{module}</label>
                </div>
              ))}
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Usuarios</h2>
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
            onClick={() => console.log('Imprimir usuarios')}
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USUARIO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NOMBRE COMPLETO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario, index) => (
              <tr
                key={usuario.id}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.usuario}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{usuario.nombreCompleto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;