import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface Pesada {
  id: number;
  fecha: string;
  hora: string;
  noempleado: string;
  nombre: string;
  kilos: number | string;
  precio: number | string;
  total: number | string;
  lote: number;
}

interface Employee {
  trabajadorid: number;
  noempleado: string;
  nombre: string;
}

interface TipoPrecio {
  precioid: number;
  precio: number | string;
  estatus: number;
}

const Pesadas: React.FC = () => {
  const { user, isLoading, error: authError, userPermissions, token } = useAuth();
  const [pesadas, setPesadas] = useState<Pesada[]>([]);
  const [lote, setLote] = useState('');
  const [precio, setPrecio] = useState<number>(0);
  const [precios, setPrecios] = useState<TipoPrecio[]>([]);
  const [empleadoId, setEmpleadoId] = useState('');
  const [empleado, setEmpleado] = useState<Employee | null>(null);
  const [kilos, setKilos] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPesada, setSelectedPesada] = useState<Pesada | null>(null);

  useEffect(() => {
    if (user && !isLoading) {
      fetchPesadas();
      fetchPrecios();
    }
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [user, isLoading]);

  const fetchPesadas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/pesadas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pesadasArray = Array.isArray(res.data) ? res.data : res.data.data || [];
      setPesadas(pesadasArray);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchPrecios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/tipos-precios-descabece', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrecios(res.data);
      if (res.data.length > 0) {
        const defaultPrecio = res.data.find((p: TipoPrecio) => p.estatus === 1)?.precio || 0;
        setPrecio(typeof defaultPrecio === 'number' ? defaultPrecio : parseFloat(defaultPrecio as string) || 0);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmployeeEnter = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && empleadoId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/trabajadores/${empleadoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const employeeData = Array.isArray(res.data) ? res.data[0] : res.data;
        setEmpleado(employeeData || null);
        setError(null);
        setShowModal(true);
      } catch (err: any) {
        setError('Empleado no encontrado.');
        setEmpleado(null);
      }
    }
  };

  const handleRowClick = (pesada: Pesada) => {
    setSelectedPesada(pesada);
    setLote(pesada.lote.toString());
    setPrecio(Number(pesada.precio));
    setEmpleadoId(pesada.noempleado);
    setEmpleado({ trabajadorid: 0, noempleado: pesada.noempleado, nombre: pesada.nombre });
    setKilos(Number(pesada.kilos));
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (!empleado || !lote || !precio || precio <= 0 || kilos <= 0) {
      setError('Todos los campos son requeridos y deben ser mayores a 0.');
      return;
    }

    const recipientes = Math.floor(kilos / 20);
    const dif = kilos - recipientes * 20;
    const total = kilos * precio;
    const hora = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
    const fecha = currentTime.toISOString().split('T')[0];

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        fecha,
        hora,
        noempleado: empleado.noempleado,
        nombre: empleado.nombre,
        kilos,
        precio,
        total,
        lote,
        recipientes,
        dif,
      };

      if (selectedPesada) {
        await axios.put(`http://localhost:3000/api/pesadas/${selectedPesada.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:3000/api/pesadas', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await fetchPesadas();
      setShowModal(false);

      // Limpiamos solo los campos de empleado y kilos, pero no lote ni precio
      resetInputs();
      setSelectedPesada(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    setShowModal(false);
    resetInputs();
    setSelectedPesada(null);
  };

  const resetInputs = () => {
    setEmpleadoId('');
    setEmpleado(null);
    setKilos(0);
    setError(null);
  };

  const formattedDateTime = `${currentTime.toLocaleDateString('es-MX', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${currentTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;

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

  if (!userPermissions.some(p => p.permiso === 'Pesadas' || p.permiso === '*')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permiso para gestionar pesadas.</p>
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
    <div className={`flex flex-col h-screen bg-white ${showModal ? 'overflow-hidden' : ''}`}>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm text-center p-3">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200 bg-blue-50 flex-shrink-0">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Pesadas en Tiempo Real</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabla con scroll */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kilos</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># Recipientes</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kgs Diferencia</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">$</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pesadas.map((p, index) => (
              <tr
                key={p.id}
                onClick={() => handleRowClick(p)}
                className="cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{p.nombre}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{Number(p.kilos).toFixed(5)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{Math.floor(Number(p.kilos) / 20)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{(Number(p.kilos) - Math.floor(Number(p.kilos) / 20) * 20).toFixed(5)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{Number(p.total).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{p.hora}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inputs y hora fijos abajo */}
      <div className="border-t border-gray-200 bg-blue-50 sticky bottom-0 z-10 p-3 flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
            <input
              type="text"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
          <div className="w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio:</label>
            <select
              value={precio}
              onChange={(e) => setPrecio(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={precios.length === 0}
            >
              <option value="">Seleccionar...</option>
              {precios
                .filter((p) => p.estatus === 1)
                .map((p) => (
                  <option key={p.precioid} value={typeof p.precio === 'number' ? p.precio : parseFloat(p.precio as any)}>
                    {typeof p.precio === 'number' ? p.precio.toFixed(4) : parseFloat(p.precio as any).toFixed(4)}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-1/4">
            <label className="block text-sm font-medium text-gray-700 mb-1">#</label>
            <input
              type="text"
              value={empleadoId}
              onChange={(e) => setEmpleadoId(e.target.value)}
              onKeyDown={handleEmployeeEnter}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="111"
            />
          </div>
        </div>

        <div className="text-center text-red-600 font-bold">{formattedDateTime}</div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 max-w-md overflow-auto max-h-[90vh]">
            <h3 className="text-lg font-medium mb-4">Datos del Empleado</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nombre:</label>
              <input
                type="text"
                value={empleado?.nombre || ''}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Kilos:</label>
              <input
                type="number"
                value={kilos}
                onChange={(e) => setKilos(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                step="0.00001"
                placeholder="20.00000"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGuardar}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Aceptar
              </button>
              <button
                onClick={handleVolver}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pesadas;
