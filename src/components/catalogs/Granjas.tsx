import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

interface Granja {
  granjaid: number;
  nombre: string;
  propietarioid: number | null;
  estatus: number;
  fechaalta?: string;
  ultimamod?: string;
}

interface Propietario {
  propietarioid: number;
  nombre: string;
  estatus: number;
}

interface FormData {
  granjaid?: number;
  nombre: string;
  propietarioid: number | null;
  estatus: number;
}

const Granjas: React.FC = () => {
  const [granjas, setGranjas] = useState<Granja[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    propietarioid: null,
    estatus: 1,
  });

  // Fetch all granjas
  const fetchGranjas = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:3000/api/granjas/detalle');
      setGranjas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching granjas', error);
      setGranjas([]);
      toast.error('Error al cargar las granjas');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all propietarios (assuming endpoint exists)
  const fetchPropietarios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/propietarios');
      setPropietarios(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching propietarios', error);
      setPropietarios([]);
      toast.error('Error al cargar los propietarios');
    }
  };

  useEffect(() => {
    fetchGranjas();
    fetchPropietarios();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

// Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.granjaid) {
        // Update granja
        await axios.put('http://localhost:3000/api/granjas', {
          granjaid: formData.granjaid,
          nombre: formData.nombre,
          propietarioid: formData.propietarioid,
          estatus: formData.estatus,
        });
        toast.success('Granja actualizada');
      } else {
        // Create granja
        await axios.post('http://localhost:3000/api/granjas', {
          nombre: formData.nombre,
          propietarioid: formData.propietarioid,
        });
        toast.success('Granja creada');
      }
      setShowForm(false);
      setFormData({ nombre: '', propietarioid: null, estatus: 1 });
      setSelectedRow(null);
      fetchGranjas();
    } catch (error: any) {
      console.error('Error saving granja', error);
      const errorMsg = error.response?.data?.error || 'Error al guardar la granja';
      toast.error(errorMsg);
    }
  };

  // Handle modify button
  const handleModify = () => {
    if (selectedRow !== null) {
      const g = granjas[selectedRow];
      setFormData({
        granjaid: g.granjaid,
        nombre: g.nombre,
        propietarioid: g.propietarioid,
        estatus: g.estatus,
      });
      setShowForm(true);
    }
  };

  // Handle logical delete (set estatus to 0)
  const handleDelete = async () => {
    if (selectedRow !== null) {
      const g = granjas[selectedRow];
      try {
        await axios.put('http://localhost:3000/api/granjas', {
          granjaid: g.granjaid,
          nombre: g.nombre,
          propietarioid: g.propietarioid,
          estatus: 0,
        });
        toast.success('Granja eliminada');
        fetchGranjas();
        setSelectedRow(null);
      } catch (error: any) {
        console.error('Error deleting granja', error);
        const errorMsg = error.response?.data?.error || 'Error al eliminar la granja';
        toast.error(errorMsg);
      }
    }
  };

  // Render form
  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.granjaid ? 'Modificar Granja' : 'Nueva Granja'}
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
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
              <select
                value={formData.propietarioid || ''}
                onChange={(e) => handleInputChange('propietarioid', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin propietario</option>
                {propietarios.map((p) => (
                  <option key={p.propietarioid} value={p.propietarioid}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado:</label>
              <select
                value={formData.estatus}
                onChange={(e) => handleInputChange('estatus', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Activa</option>
                <option value={0}>Inactiva</option>
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
        <ToastContainer />
      </div>
    );
  }

  // Render table
  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Granjas</h2>
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md text-sm"
          >
            <Edit className="w-4 h-4" /> Modificar
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md text-sm"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        {loading ? (
          <p className="p-4">Cargando...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Modificación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {granjas.map((g, index) => (
                <tr
                  key={g.granjaid}
                  onClick={() => setSelectedRow(index)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{g.granjaid}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{g.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {propietarios.find(p => p.propietarioid === g.propietarioid)?.nombre || 'Sin propietario'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{g.estatus === 1 ? 'Activa' : 'Inactiva'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {g.ultimamod ? new Date(g.ultimamod).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Granjas;