import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X, LogOut } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Ciclo {
  cicloid: number;
  año: number;
  ciclo: string;
  status: string;
}

interface FormData {
  cicloid: string;
  año: number;
  ciclo: string;
  status: string;
}

const Ciclos: React.FC = () => {
  const { user, token, userPermissions } = useAuth();
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    cicloid: '',
    año: new Date().getFullYear(),
    ciclo: '',
    status: 'A',
  });
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasPermission =
    userPermissions.some((p) => p.permiso.toLowerCase() === 'Ciclos'.toLowerCase()) ||
    user?.role === 'ADMINISTRADOR';

  useEffect(() => {
    if (!hasPermission) {
      toast.error('No tienes permiso para acceder a Ciclos');
      navigate('/dashboard');
      return;
    }

    const fetchCiclos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/ciclos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCiclos(response.data.filter((c: Ciclo) => c.status === 'A'));
      } catch (err) {
        setError('Error al obtener ciclos');
        toast.error('Error al obtener ciclos');
        console.error(err);
      }
    };

    if (token) {
      fetchCiclos();
    }
  }, [token, hasPermission, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (formData.cicloid) {
        // Update existing ciclo
        await axios.put(`http://localhost:3000/api/ciclos/${formData.cicloid}`, {
          año: formData.año,
          ciclo: formData.ciclo,
          status: formData.status,
          userid: user?.id || 1,
        }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Ciclo actualizado correctamente');
      } else {
        // Add new ciclo
        await axios.post('http://localhost:3000/api/ciclos', {
          año: formData.año,
          ciclo: formData.ciclo,
          status: 'A',
          userid: user?.id || 1,
        }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Ciclo creado correctamente');
      }

      // Refresh ciclos
      const response = await axios.get('http://localhost:3000/api/ciclos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCiclos(response.data.filter((c: Ciclo) => c.status === 'A'));
      setShowForm(false);
      setFormData({ cicloid: '', año: new Date().getFullYear(), ciclo: '', status: 'A' });
      setSelectedRow(null);
    } catch (err) {
      setError('Error al guardar ciclo');
      toast.error('Error al guardar ciclo');
      console.error(err);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null && ciclos[selectedRow]) {
      const ciclo = ciclos[selectedRow];
      setFormData({
        cicloid: ciclo.cicloid.toString(),
        año: ciclo.año,
        ciclo: ciclo.ciclo,
        status: ciclo.status,
      });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null && ciclos[selectedRow]) {
      try {
        await axios.delete(`http://localhost:3000/api/ciclos/${ciclos[selectedRow].cicloid}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { userid: user?.id || 1 },
        });
        setCiclos(ciclos.filter((_, index) => index !== selectedRow));
        setSelectedRow(null);
        toast.success('Ciclo eliminado correctamente');
      } catch (err) {
        setError('Error al eliminar ciclo');
        toast.error('Error al eliminar ciclo');
        console.error(err);
      }
    }
  };

  const handlePrint = () => {
    console.log('Imprimir ciclos'); // Implement with jsPDF or similar
    toast.info('Función de impresión en desarrollo');
  };

  if (!hasPermission) return null;

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.cicloid ? 'Modificar Ciclo' : 'Nuevo Ciclo'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <input
                type="text"
                value={
                  formData.cicloid
                    ? formData.cicloid
                    : ciclos.length > 0
                    ? (Math.max(...ciclos.map((c) => c.cicloid)) + 1).toString()
                    : '1'
                }
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
                min={2000}
                max={2100}
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
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Ciclos</h2>
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
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
            onClick={handlePrint}
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
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
                key={ciclo.cicloid}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{ciclo.cicloid}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{ciclo.año}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{ciclo.ciclo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Ciclos;
