import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { getClientes, getTallasDisponibles, getCajasPorTalla, createSalida } from '../../api/salidasApi';

// Interfaces permanecen iguales
interface Cliente {
  clienteid: number;
  cliente: string;
}

interface Talla {
  tallaid: number;
  talla: string;
}

interface Caja {
  cajaid: number;
  barcode: string;
  lote: string;
  propietario: string;
  tallaid: number;
  granja: string;
  fechaEntrada: string;
  posicion: string;
}

interface CajaSeleccionada extends Caja {
  talla: string;
}

interface Resumen {
  talla: string;
  lote: string;
  granja: string;
  propietario: string;
  cantidad: number;
}

const Salidas: React.FC = () => {
  const { user, isLoading, error: authError, userPermissions } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [cajasDisponibles, setCajasDisponibles] = useState<Caja[]>([]);
  const [cajasSeleccionadas, setCajasSeleccionadas] = useState<CajaSeleccionada[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number>(0);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<number>(0);
  const [cajasSeleccionadasIds, setCajasSeleccionadasIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [resumen, setResumen] = useState<Resumen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      fetchData();
    }
  }, [user, isLoading]);

  const fetchData = async () => {
    try {
      const [clientesData, tallasData] = await Promise.all([getClientes(), getTallasDisponibles()]);
      setClientes(clientesData);
      setTallas(tallasData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchCajasPorTalla = async (tallaid: number) => {
    try {
      const data = await getCajasPorTalla(tallaid);
      data.sort((a, b) => new Date(a.fechaEntrada).getTime() - new Date(b.fechaEntrada).getTime());
      setCajasDisponibles(data);
      setCajasSeleccionadasIds([]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTallaChange = (tallaid: number) => {
    setTallaSeleccionada(tallaid);
    setCajasSeleccionadasIds([]);
    if (tallaid > 0) {
      fetchCajasPorTalla(tallaid);
    } else {
      setCajasDisponibles([]);
    }
  };

  const handleCajaToggle = (cajaid: number) => {
    setCajasSeleccionadasIds(prev =>
      prev.includes(cajaid) ? prev.filter(id => id !== cajaid) : [...prev, cajaid]
    );
  };

  const handleSelectAll = () => {
    if (cajasSeleccionadasIds.length === cajasDisponibles.length) {
      setCajasSeleccionadasIds([]);
    } else {
      setCajasSeleccionadasIds(cajasDisponibles.map(c => c.cajaid));
    }
  };

  const handleAgregarCaja = () => {
    const nuevasCajas = cajasDisponibles
      .filter(c => cajasSeleccionadasIds.includes(c.cajaid))
      .map(c => ({
        ...c,
        talla: tallas.find(t => t.tallaid === tallaSeleccionada)?.talla || '',
      }));
    
    setCajasSeleccionadas(prev => [...prev, ...nuevasCajas]);
    setCajasDisponibles(prev => prev.filter(c => !cajasSeleccionadasIds.includes(c.cajaid)));
    setCajasSeleccionadasIds([]);
  };

  const handleEliminarCaja = (cajaid: number) => {
    const caja = cajasSeleccionadas.find(c => c.cajaid === cajaid);
    if (caja) {
      setCajasSeleccionadas(prev => prev.filter(c => c.cajaid !== cajaid));
      setCajasDisponibles(prev => [...prev, { ...caja, fechaEntrada: caja.fechaEntrada }]);
    }
  };

  const prepareResumen = () => {
    const resumenMap = new Map<string, Resumen>();
    cajasSeleccionadas.forEach(caja => {
      const key = `${caja.talla}-${caja.lote}-${caja.granja}-${caja.propietario}`;
      if (resumenMap.has(key)) {
        const existing = resumenMap.get(key)!;
        existing.cantidad += 1;
      } else {
        resumenMap.set(key, {
          talla: caja.talla,
          lote: caja.lote,
          granja: caja.granja,
          propietario: caja.propietario,
          cantidad: 1,
        });
      }
    });
    return Array.from(resumenMap.values());
  };

  const handleGuardar = () => {
    const resumenData = prepareResumen();
    setResumen(resumenData);
    setShowModal(true);
  };

  const confirmGuardar = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = {
        clienteid: clienteSeleccionado,
        cajas: cajasSeleccionadas.map(c => ({
          cajaid: c.cajaid,
          barcode: c.barcode,
          tallaid: c.tallaid,
          lote: c.lote,
          granja: c.granja,
          propietario: c.propietario,
        })),
      };
      await createSalida(data);
      setCajasSeleccionadas([]);
      setClienteSeleccionado(0);
      setTallaSeleccionada(0);
      setCajasDisponibles([]);
      setCajasSeleccionadasIds([]);
      setShowModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
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

  if (!userPermissions.some(p => p.permiso === 'Salidas' || p.permiso === '*')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permiso para gestionar salidas.</p>
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

      <div>
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">Salidas / Ventas</h2>
            <button 
              onClick={() => window.location.reload()}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente:</label>
              <select
                value={clienteSeleccionado}
                onChange={(e) => setClienteSeleccionado(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Selecciona un cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.clienteid} value={cliente.clienteid}>{cliente.cliente}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Talla:</label>
              <select
                value={tallaSeleccionada}
                onChange={(e) => handleTallaChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Selecciona una talla</option>
                {tallas.map(talla => (
                  <option key={talla.tallaid} value={talla.tallaid}>{talla.talla}</option>
                ))}
              </select>
            </div>
          </div>

          {tallaSeleccionada > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  Cajas disponibles (Total: {cajasDisponibles.length} | Seleccionadas: {cajasSeleccionadasIds.length})
                </h3>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  {cajasSeleccionadasIds.length === cajasDisponibles.length && cajasDisponibles.length > 0
                    ? 'Deseleccionar todas'
                    : 'Seleccionar todas'}
                </button>
              </div>
              <div className="overflow-auto max-h-[300px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seleccionar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cajasDisponibles.map((caja, index) => (
                      <tr key={caja.cajaid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <input
                            type="checkbox"
                            checked={cajasSeleccionadasIds.includes(caja.cajaid)}
                            onChange={() => handleCajaToggle(caja.cajaid)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{caja.barcode}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{caja.lote}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{caja.propietario}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{caja.posicion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={handleAgregarCaja}
                disabled={cajasSeleccionadasIds.length === 0}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Agregar cajas seleccionadas
              </button>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cajas seleccionadas para salida</h3>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talla</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Granja</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cajasSeleccionadas.map((caja, index) => (
                    <tr key={caja.cajaid} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-900">{caja.barcode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{caja.talla}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{caja.lote}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{caja.granja}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{caja.propietario}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{caja.posicion}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <button onClick={() => handleEliminarCaja(caja.cajaid)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleGuardar}
              disabled={cajasSeleccionadas.length === 0 || isSubmitting}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar salida
            </button>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-3/4 max-w-4xl">
              <h3 className="text-lg font-bold mb-4">Resumen de salida</h3>
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talla</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lote</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Granja</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad de cajas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {resumen.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.talla}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.lote}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.granja}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.propietario}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.cantidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  Cancelar
                </button>
                <button
                  onClick={confirmGuardar}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salidas;