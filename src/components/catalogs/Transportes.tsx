import React, { useState, useEffect } from 'react';
import { Plus, Edit, Save, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getCarros, createCarro, updateCarro, toggleCarroStatus } from '../../api/carrosApi';

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
  const { user, isLoading, error: authError, userPermissions } = useAuth();
  const [carros, setCarros] = useState<Carro[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    placas: '',
    marca: '',
    modelo: '',
    status: 'A',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      fetchCarros();
    }
  }, [user, isLoading]);

  const fetchCarros = async () => {
    try {
      const data = await getCarros();
      setCarros(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (formData.carroid) {
        await updateCarro(formData.carroid, formData);
      } else {
        await createCarro(formData);
      }
      setShowForm(false);
      setFormData({ placas: '', marca: '', modelo: '', status: 'A' });
      setSelectedRow(null);
      await fetchCarros();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const carro = carros[selectedRow];
      setFormData({ ...carro });
      setShowForm(true);
    }
  };

  const handleToggleStatus = async () => {
    if (selectedRow !== null) {
      setIsSubmitting(true);
      setError(null);
      try {
        const carro = carros[selectedRow];
        await toggleCarroStatus(carro.carroid);
        await fetchCarros();
        setSelectedRow(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Check authentication and permissions
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

  if (!userPermissions.some(p => p.permiso === 'Transportes' || p.permiso === '*' || p.permiso === 'Carros')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permiso para gestionar transportes.</p>
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
                {formData.carroid ? 'Modificar Transporte' : 'Nuevo Transporte'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {formData.carroid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
                  <input
                    type="text"
                    value={formData.carroid}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placas:</label>
                <input
                  type="text"
                  value={formData.placas}
                  onChange={e => handleInputChange('placas', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  maxLength={10}
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar
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
              <h2 className="text-lg font-medium text-gray-900">Consulta de Transportes</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
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
                onClick={handleToggleStatus}
                disabled={selectedRow === null || isSubmitting}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" /> Cambiar Estado
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
                {carros.map((carro, index) => (
                  <tr
                    key={carro.carroid}
                    onClick={() => setSelectedRow(index)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{carro.carroid}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{carro.placas}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{carro.marca}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{carro.modelo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{carro.status === 'A' ? 'Activo' : 'Inactivo'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {carros.length === 0 && !error && (
              <div className="text-center p-4 text-gray-600">No hay carros disponibles.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transportes;