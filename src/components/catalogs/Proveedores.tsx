import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowUpDown } from 'lucide-react';
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Proveedor; direction: 'asc' | 'desc' } | null>(null);
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
      } catch (err) {
        console.error('Error fetching proveedores:', err);
        toast.error('Error al cargar los proveedores');
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

  // Handle table sorting
  const handleSort = (key: keyof Proveedor) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...proveedores].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setProveedores(sorted);
  };

  // Render form
  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-400">
            <h2 className="text-xl font-semibold text-white">
              {selectedRow !== null ? 'Modificar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RFC:</label>
                <input
                  type="text"
                  value={formData.rfc}
                  onChange={(e) => handleInputChange('rfc', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domicilio:</label>
                <input
                  type="text"
                  value={formData.domicilio}
                  onChange={(e) => handleInputChange('domicilio', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono:</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
                <select
                  value={formData.estatus}
                  onChange={(e) => handleInputChange('estatus', Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  // Render table
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-400">
          <h2 className="text-xl font-semibold text-white">Consulta de Proveedores</h2>
        </div>

        <div className="p-4 flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" /> Modificar
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors shadow-sm"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Cargando proveedores...</div>
          ) : proveedores.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No hay proveedores disponibles</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-200 text-gray-700 text-sm font-semibold uppercase tracking-wide">
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('proveedorid')}>
                    ID <ArrowUpDown className="inline w-4 h-4 ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('nombre')}>
                    Nombre <ArrowUpDown className="inline w-4 h-4 ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('rfc')}>
                    RFC <ArrowUpDown className="inline w-4 h-4 ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('domicilio')}>
                    Domicilio <ArrowUpDown className="inline w-4 h-4 ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('telefono')}>
                    Teléfono <ArrowUpDown className="inline w-4 h-4 ml-1" />
                  </th>
                  <th className="px-6 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proveedores.map((p, i) => (
                  <tr
                    key={p.proveedorid}
                    onClick={() => setSelectedRow(i)}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                      selectedRow === i ? 'bg-blue-100' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">{p.proveedorid}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.nombre}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.rfc}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.domicilio}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.telefono}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.estatus === 1 ? 'Activo' : 'Inactivo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default Proveedores;