import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../api/proveedoresApi';

interface Proveedor {
  idproveedor: number;
  nombre: string;
  rfc: string;
  domicilio: string;
  telefono: string;
  status: 'A' | 'I';
}

interface FormData {
  idproveedor: string;
  nombre: string;
  rfc: string;
  domicilio: string;
  telefono: string;
  status: 'A' | 'I';
}

const Proveedores: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    idproveedor: '',
    nombre: '',
    rfc: '',
    domicilio: '',
    telefono: '',
    status: 'A',
  });
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  // Cargar proveedores desde API
  useEffect(() => {
    const fetchData = async () => {
      const data = await getProveedores();
      setProveedores(data);
    };
    fetchData();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.idproveedor) {
        const updated = await updateProveedor(parseInt(formData.idproveedor), formData);
        setProveedores(proveedores.map(p => p.idproveedor === updated.idproveedor ? updated : p));
      } else {
        const created = await createProveedor(formData);
        setProveedores([...proveedores, created]);
      }
      setShowForm(false);
      setFormData({ idproveedor: '', nombre: '', rfc: '', domicilio: '', telefono: '', status: 'A' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const p = proveedores[selectedRow];
      setFormData({
        idproveedor: p.idproveedor.toString(),
        nombre: p.nombre,
        rfc: p.rfc,
        domicilio: p.domicilio,
        telefono: p.telefono,
        status: p.status,
      });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const p = proveedores[selectedRow];
      await deleteProveedor(p.idproveedor);
      setProveedores(proveedores.filter((_, i) => i !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.idproveedor ? 'Modificar Proveedor' : 'Nuevo Proveedor'}
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
                value={formData.idproveedor || (proveedores.length + 1)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">RFC:</label>
              <input
                type="text"
                value={formData.rfc}
                onChange={(e) => handleInputChange('rfc', e.target.value)}
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

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Proveedores</h2>
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
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">RFC</th>
              <th className="px-4 py-3">Domicilio</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proveedores.map((p, i) => (
              <tr
                key={p.idproveedor}
                onClick={() => setSelectedRow(i)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === i ? 'bg-blue-100' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3">{p.idproveedor}</td>
                <td className="px-4 py-3">{p.nombre}</td>
                <td className="px-4 py-3">{p.rfc}</td>
                <td className="px-4 py-3">{p.domicilio}</td>
                <td className="px-4 py-3">{p.telefono}</td>
                <td className="px-4 py-3">{p.status === 'A' ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Proveedores;
