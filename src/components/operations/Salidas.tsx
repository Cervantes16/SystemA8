import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Trash2, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getClientes, getTallasDisponibles, getCajasPorTalla, createSalida, getUsuarios } from '../../api/salidasApi';

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
  tallaid: number;
  talla: string;
  lote: string;
  granja: string;
  propietario: string;
  posicion: string;
  bodega: string;
  fechaEntrada: string;
}

interface Usuario {
  usuarioid: number;
  nombrecompleto: string;
}

interface Resumen {
  talla: string;
  lote: string;
  granja: string;
  propietario: string;
  cantidad: number;
}

const Salidas: React.FC = () => {
  const { user, token, userPermissions, isLoading, error: authError, logout } = useAuth();
  const location = useLocation();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [cajasDisponibles, setCajasDisponibles] = useState<Caja[]>([]);
  const [cajasSeleccionadas, setCajasSeleccionadas] = useState<Caja[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number>(0);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<number>(0);
  const [loteSeleccionado, setLoteSeleccionado] = useState<string>('');
  const [lotesDisponibles, setLotesDisponibles] = useState<string[]>([]);
  const [cajasSeleccionadasIds, setCajasSeleccionadasIds] = useState<number[]>([]);
  const [folioFisico, setFolioFisico] = useState<string>('');
  const [tipo, setTipo] = useState<string>('VENTA');
  const [cicloId, setCicloId] = useState<number>(0);
  const [responsableBodegaId, setResponsableBodegaId] = useState<number>(0);
  const [autorizoId, setAutorizoId] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [observaciones, setObservaciones] = useState<string>('');
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [resumen, setResumen] = useState<Resumen[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      fetchData();
      // Check for solicitud pre-population
      const params = new URLSearchParams(location.search);
      const solicitudid = params.get('solicitudid');
      const clienteid = params.get('clienteid');
      const cajas = params.get('cajas');
      if (solicitudid && clienteid && cajas) {
        setSolicitudId(parseInt(solicitudid));
        setClienteSeleccionado(parseInt(clienteid));
        setCajasSeleccionadas(JSON.parse(decodeURIComponent(cajas)));
      }
    }
  }, [user, isLoading, location]);

  const fetchData = async () => {
    try {
      const [clientesData, tallasData, usuariosData] = await Promise.all([
        getClientes(),
        getTallasDisponibles(),
        getUsuarios(),
      ]);
      setClientes(clientesData);
      setTallas(tallasData);
      setUsuarios(usuariosData);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar datos iniciales';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchCajasPorTalla = async (tallaid: number) => {
    try {
      let data = await getCajasPorTalla(tallaid);
      const selectedIds = new Set(cajasSeleccionadas.map(c => c.cajaid));
      data = data.filter(c => !selectedIds.has(c.cajaid));
      data.sort((a, b) => new Date(a.fechaEntrada).getTime() - new Date(b.fechaEntrada).getTime());
      setCajasDisponibles(data);
      setLotesDisponibles([...new Set(data.map(c => c.lote))]);
      setCajasSeleccionadasIds([]);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener cajas por talla';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleTallaChange = (tallaid: number) => {
    setTallaSeleccionada(tallaid);
    setLoteSeleccionado('');
    setCajasSeleccionadasIds([]);
    if (tallaid > 0) {
      fetchCajasPorTalla(tallaid);
    } else {
      setCajasDisponibles([]);
      setLotesDisponibles([]);
    }
  };

  const handleLoteChange = (lote: string) => {
    setLoteSeleccionado(lote);
    const filteredCajas = lote ? cajasDisponibles.filter(c => c.lote === lote) : cajasDisponibles;
    setCajasDisponibles(filteredCajas);
    setCajasSeleccionadasIds([]);
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
        talla: tallas.find(t => t.tallaid === c.tallaid)?.talla || c.talla || '',
        lote: String(c.lote),
      }));
    
    setCajasSeleccionadas(prev => [...prev, ...nuevasCajas]);
    setCajasDisponibles(prev => prev.filter(c => !cajasSeleccionadasIds.includes(c.cajaid)));
    setCajasSeleccionadasIds([]);
    setLoteSeleccionado('');
  };

  const handleEliminarCaja = (cajaid: number) => {
    const caja = cajasSeleccionadas.find(c => c.cajaid === cajaid);
    if (caja) {
      setCajasSeleccionadas(prev => prev.filter(c => c.cajaid !== cajaid));
      if (tallaSeleccionada === caja.tallaid) {
        setCajasDisponibles(prev => {
          const newDisponibles = [...prev, { ...caja, fechaEntrada: caja.fechaEntrada }];
          newDisponibles.sort((a, b) => new Date(a.fechaEntrada).getTime() - new Date(b.fechaEntrada).getTime());
          return newDisponibles;
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setFile(file);
      } else {
        toast.error('Solo se permiten archivos JPEG, PNG o PDF');
      }
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
    if (!folioFisico || !tipo || !cicloId || !responsableBodegaId || !autorizoId || !observaciones) {
      setError('Todos los campos son requeridos');
      toast.error('Todos los campos son requeridos');
      return;
    }
    const resumenData = prepareResumen();
    setResumen(resumenData);
    setShowModal(true);
  };

  const confirmGuardar = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (!token) {
        throw new Error('No se encontró un token de autenticación');
      }
      const formData = new FormData();
      formData.append('clienteid', clienteSeleccionado.toString());
      formData.append('foliofisico', folioFisico);
      formData.append('tipo', tipo);
      formData.append('cicloid', cicloId.toString());
      formData.append('responsablebodegaid', responsableBodegaId.toString());
      formData.append('autorizoid', autorizoId.toString());
      formData.append('total', total.toString());
      formData.append('observaciones', observaciones);
      if (solicitudId) {
        formData.append('solicitudid', solicitudId.toString());
      }
      formData.append('cajas', JSON.stringify(cajasSeleccionadas.map(c => ({
        cajaid: c.cajaid,
        barcode: c.barcode,
        tallaid: c.tallaid,
        lote: String(c.lote),
        granja: c.granja,
        propietario: c.propietario,
      }))));
      if (file) {
        formData.append('justificacion', file);
      }
      console.log('Request payload:', Object.fromEntries(formData));
      await createSalida(formData);
      toast.success('Salida registrada correctamente');
      setCajasSeleccionadas([]);
      setClienteSeleccionado(0);
      setTallaSeleccionada(0);
      setLoteSeleccionado('');
      setCajasDisponibles([]);
      setCajasSeleccionadasIds([]);
      setFolioFisico('');
      setTipo('VENTA');
      setCicloId(0);
      setResponsableBodegaId(0);
      setAutorizoId(0);
      setTotal(0);
      setObservaciones('');
      setSolicitudId(null);
      setFile(null);
      setShowModal(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detalle || err.message || 'Error al registrar la salida';
      setError(errorMessage);
      toast.error(errorMessage);
      if (errorMessage.includes('no autenticado') || errorMessage.includes('token')) {
        logout();
        window.location.href = '/login';
      }
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

  if (!user?.isAuthenticated || !token) {
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
                disabled={solicitudId !== null}
              >
                <option value={0}>Selecciona un cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.clienteid} value={cliente.clienteid}>{cliente.cliente}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Folio Físico:</label>
              <input
                type="text"
                value={folioFisico}
                onChange={(e) => setFolioFisico(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="VENTA">Venta</option>
                <option value="TRASLADO">Traslado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo ID:</label>
              <input
                type="number"
                value={cicloId}
                onChange={(e) => setCicloId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Responsable Bodega:</label>
              <select
                value={responsableBodegaId}
                onChange={(e) => setResponsableBodegaId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Selecciona un responsable</option>
                {usuarios.map(usuario => (
                  <option key={usuario.usuarioid} value={usuario.usuarioid}>{usuario.nombrecompleto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Autorizó:</label>
              <select
                value={autorizoId}
                onChange={(e) => setAutorizoId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Selecciona un autorizador</option>
                {usuarios.map(usuario => (
                  <option key={usuario.usuarioid} value={usuario.usuarioid}>{usuario.nombrecompleto}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total:</label>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.0001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones:</label>
              <input
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Justificación (JPEG/PNG/PDF):</label>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {!solicitudId && (
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Talla:</label>
                  <select
                    value={tallaSeleccionada}
                    onChange={(e) => handleTallaChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>Selecciona una talla</option>
                    {tallas.map(talla => (
                      <option key={talla.tallaid} value={talla.tallaid}>{talla.talla}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
                  <select
                    value={loteSeleccionado}
                    onChange={(e) => handleLoteChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!tallaSeleccionada}
                  >
                    <option value="">Selecciona un lote</option>
                    {lotesDisponibles.map(lote => (
                      <option key={lote} value={lote}>{lote}</option>
                    ))}
                  </select>
                </div>
              </div>

              {tallaSeleccionada > 0 && (
                <div className="mt-4">
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
              <div className="mb-4">
                <p><strong>Folio Físico:</strong> {folioFisico}</p>
                <p><strong>Tipo:</strong> {tipo}</p>
                <p><strong>Ciclo ID:</strong> {cicloId}</p>
                <p><strong>Responsable Bodega:</strong> {usuarios.find(u => u.usuarioid === responsableBodegaId)?.nombrecompleto}</p>
                <p><strong>Autorizó:</strong> {usuarios.find(u => u.usuarioid === autorizoId)?.nombrecompleto}</p>
                <p><strong>Total:</strong> {total}</p>
                <p><strong>Observaciones:</strong> {observaciones}</p>
                {solicitudId && <p><strong>Solicitud ID:</strong> {solicitudId}</p>}
                {file && <p><strong>Justificación:</strong> {file.name}</p>}
              </div>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Confirmar
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