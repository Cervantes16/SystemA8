import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X, Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from '../../api/proveedoresApi';

interface Proveedor {
  proveedorid: number;
  nombre: string;
  rfc: string;
  domicilio: string;
  telefono: string;
  estatus: number;
}

interface FormData {
  nombre: string;
  rfc: string;
  domicilio: string;
  telefono: string;
  estatus: number;
}

const Proveedores: React.FC = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    rfc: '',
    domicilio: '',
    telefono: '',
    estatus: 1,
  });

  // Fetch providers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getProveedores();
        setProveedores(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Error cargando proveedores:', err);
        toast.error(err.response?.data?.error || 'Error al cargar los proveedores');
        setProveedores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRow !== null && proveedores[selectedRow]) {
        // Update provider
        const updated = await updateProveedor(proveedores[selectedRow].proveedorid, {
          ...formData,
          estatus: Number(formData.estatus),
        });
        setProveedores(proveedores.map(p => (p.proveedorid === updated.proveedorid ? updated : p)));
        toast.success('Proveedor actualizado');
      } else {
        // Create provider
        const created = await createProveedor(formData);
        setProveedores([...proveedores, created]);
        toast.success('Proveedor creado');
      }
      setShowForm(false);
      setFormData({ nombre: '', rfc: '', domicilio: '', telefono: '', estatus: 1 });
      setSelectedRow(null);
    } catch (err: any) {
      console.error('Error saving proveedor:', err);
      const errorMsg = err.response?.data?.error || 'Error al guardar el proveedor';
      toast.error(errorMsg);
    }
  };

  // Handle modify button
  const handleModify = () => {
    if (selectedRow !== null) {
      const p = proveedores[selectedRow];
      setFormData({
        nombre: p.nombre,
        rfc: p.rfc,
        domicilio: p.domicilio,
        telefono: p.telefono,
        estatus: p.estatus,
      });
      setShowForm(true);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    if (selectedRow !== null) {
      const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este proveedor?');
      if (confirmed) {
        try {
          const p = proveedores[selectedRow];
          await deleteProveedor(p.proveedorid);
          setProveedores(proveedores.filter((_, i) => i !== selectedRow));
          setSelectedRow(null);
          toast.success('Proveedor eliminado');
        } catch (err: any) {
          console.error('Error deleting proveedor:', err);
          const errorMsg = err.response?.data?.error || 'Error al eliminar el proveedor';
          toast.error(errorMsg);
        }
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Cargando proveedores...</span>
      </div>
    );
  }

  // Render form
  if (showForm) {
    return (
      <div className="flex-1 bg-white h-full flex flex-col">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedRow !== null ? 'Modificar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <input
                type="text"
                value={selectedRow !== null ? proveedores[selectedRow].proveedorid : proveedores.length + 1}
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
                value={formData.estatus}
                onChange={(e) => handleInputChange('estatus', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
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

  // Render table
  return (
    <div className="flex-1 bg-white h-full flex flex-col">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Proveedores</h2>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
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
            onClick={() => console.log('Imprimir proveedores')}
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
          <button
            onClick={() => setShowForm(false)}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RFC
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domicilio
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {proveedores.map((p, index) => (
              <tr
                key={p.proveedorid}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{p.proveedorid}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{p.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{p.rfc}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{p.domicilio}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{p.telefono}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{p.estatus === 1 ? 'Activo' : 'Inactivo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Proveedores;