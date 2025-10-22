import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPuestos, createPuesto, updatePuesto, toggleStatusPuesto } from '../../api/puestosApi';
import { Navigate } from 'react-router-dom';

interface Puesto {
  puestoid: number;
  puesto: string;
  estatus: number;
}

interface FormData {
  puestoid?: number;
  puesto: string;
  estatus: number;
}

const Puestos: React.FC = () => {
  const { user, isLoading, error: authError, userPermissions } = useAuth();
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    puesto: '',
    estatus: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      fetchPuestos();
    }
  }, [user, isLoading]);

  const fetchPuestos = async () => {
    try {
      const data = await getPuestos();
      setPuestos(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (formData.puestoid) {
        await updatePuesto(formData.puestoid, formData);
      } else {
        await createPuesto(formData);
      }
      setShowForm(false);
      setFormData({ puesto: '', estatus: 1 });
      setSelectedRow(null);
      await fetchPuestos();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const puesto = puestos[selectedRow];
      setFormData({ ...puesto });
      setShowForm(true);
    }
  };

  const handleToggleStatus = async () => {
    if (selectedRow !== null) {
      const puesto = puestos[selectedRow];
      setIsSubmitting(true);
      setError(null);
      try {
        await toggleStatusPuesto(puesto.puestoid);
        setSelectedRow(null);
        await fetchPuestos();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!userPermissions.some(p => p.permiso === 'Puestos' || p.permiso === '*')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permiso para gestionar puestos.</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm text-center p-3">
          {error}
        </div>
      )}

      {showForm ? (
        <div>
          <div className="border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between p-3">
              <h2 className="text-lg font-medium text-gray-900">
                {formData.puestoid ? 'Modificar Puesto' : 'Nuevo Puesto'}
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
              {formData.puestoid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
                  <input
                    type="text"
                    value={formData.puestoid}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puesto:</label>
                <input
                  type="text"
                  value={formData.puesto}
                  onChange={(e) => handleInputChange('puesto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estatus:</label>
                <select
                  value={formData.estatus}
                  onChange={(e) => handleInputChange('estatus', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div className="border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between p-3">
              <h2 className="text-lg font-medium text-gray-900">Consulta de Puestos</h2>
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
                onClick={handleToggleStatus}
                disabled={selectedRow === null || isSubmitting}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Cambiar Estatus
              </button>
            </div>
          </div>

          <div className="max-h-[80vh] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PUESTO</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTATUS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {puestos.map((puesto, index) => (
                  <tr
                    key={puesto.puestoid}
                    onClick={() => setSelectedRow(index)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{puesto.puestoid}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{puesto.puesto}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{puesto.estatus === 1 ? 'Activo' : 'Inactivo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Puestos;