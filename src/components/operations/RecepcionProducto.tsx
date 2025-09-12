import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Save, Search, X, Printer } from 'lucide-react';
import { getCarros } from '../../api/carrosApi';
import { useAuth } from '../../context/AuthContext';

interface RecepcionItem {
  id: number;
  foliofisico: string;
  fecha: string;
  lote: string;
  idciclo: string;
  idgranja: string;
  idpropietario: string;
  totalKilos: number;
  subida: string;
}

interface RecepcionDetalle {
  estanque: number;
  taras: number;
  kgxTara: number;
  tKilogramos: number;
  basura: number;
  total: number;
  pPromedio: number;
}

interface Granja {
  idgranja?: number;
  granja?: string; // Matches "granja" field from API
  status?: string;
}

interface Ciclo {
  cicloid?: number;
  año?: string;
  ciclo?: string;
  status?: string;
}

interface Propietario {
  idpropietario?: number;
  nombre?: string;
  status?: string;
}

interface Carro {
  idcarro?: number;
  placas?: string; // Updated from "placa" to "placas" to match API
  status?: string;
}

interface Chofer {
  idchofer?: number;
  nombre?: string;
  status?: string;
}

export default function RecepcionProducto() {
  const { token } = useAuth();
  const [recepciones, setRecepciones] = useState<RecepcionItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detalleItems, setDetalleItems] = useState<RecepcionDetalle[]>([]);
  const [editingDetailIndex, setEditingDetailIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [nextId, setNextId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    idRecepcion: '',
    foliofisico: '',
    lote: '',
    fecha: new Date().toISOString().split('T')[0],
    idciclos: '',
    idpropietario: '',
    idgranja: '',
    idcarro: '',
    idchofer: '',
    taras: 0,
    kgxTara: 45.0,
    kgBasura: 0,
    pPromedio: 0,
    estanque: '',
    totalKilos: 0,
    observacion: 'SIN OBSERVACION',
    esMaquilla: false,
  });

  const [detallesPorRecepcion, setDetallesPorRecepcion] = useState<{ [key: number]: RecepcionDetalle[] }>({});
  const [granjas, setGranjas] = useState<Granja[]>([]);
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [carros, setCarros] = useState<Carro[]>([]);
  const [choferes, setChoferes] = useState<Chofer[]>([]);

  // ---------------------- CONSUMO DE API ----------------------
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        await Promise.all([
          fetchRecepciones(),
          fetchNextId(),
          fetchGranjas(),
          fetchCiclos(),
          fetchPropietarios(),
          fetchCarros(),
          fetchChoferes(),
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setErrorMessage('Error al cargar datos iniciales. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const fetchRecepciones = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/recepcion', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', res.data);
      let recepcionesArray: RecepcionItem[] = [];
      if (Array.isArray(res.data)) {
        recepcionesArray = res.data;
      } else if (Array.isArray(res.data.recepciones)) {
        recepcionesArray = res.data.recepciones;
      } else {
        console.error('API no devolvió un array de recepciones', res.data);
        setErrorMessage('Error: No se pudieron cargar las recepciones.');
        return;
      }
      if (recepcionesArray.length === 0) {
        console.warn('No recepciones found.');
      }
      setRecepciones(recepcionesArray);

      const detalles: { [key: number]: RecepcionDetalle[] } = {};
      await Promise.all(
        recepcionesArray.map(async (r) => {
          try {
            const dRes = await axios.get(`http://localhost:3000/api/recepcion/${r.id}/detalles`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (Array.isArray(dRes.data)) {
              detalles[r.id] = dRes.data;
            } else if (Array.isArray(dRes.data.detalles)) {
              detalles[r.id] = dRes.data.detalles;
            } else {
              detalles[r.id] = [];
              console.error(`Detalles de la recepción ${r.id} no son un array`, dRes.data);
            }
          } catch (error) {
            console.error(`Error al obtener detalles de recepción ${r.id}`, error);
            detalles[r.id] = [];
          }
        })
      );
      setDetallesPorRecepcion(detalles);
    } catch (error: any) {
      console.error('Error al consultar recepciones', error);
      setErrorMessage('Error al conectar con el servidor.');
      setRecepciones([]);
      setDetallesPorRecepcion({});
    }
  };

  const fetchNextId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/recepcion/next-id', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Next ID Response:', res.data.id);
      setNextId(res.data.id || null);
    } catch (error: any) {
      console.error('Error fetching next ID:', error);
      setErrorMessage('Error al obtener el ID consecutivo.');
      setNextId(null);
    }
  };

  const fetchGranjas = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/granjas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGranjas(res.data || []);
    } catch (error) {
      console.error('Error fetching granjas:', error);
      setErrorMessage('Error al cargar las granjas.');
    }
  };

  const fetchCiclos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/ciclos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCiclos(res.data || []);
    } catch (error) {
      console.error('Error fetching ciclos:', error);
      setErrorMessage('Error al cargar los ciclos.');
    }
  };

  const fetchPropietarios = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/propietarios', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPropietarios(res.data || []);
    } catch (error) {
      console.error('Error fetching propietarios:', error);
      setErrorMessage('Error al cargar los propietarios.');
    }
  };

  const fetchCarros = async () => {
    try {
      const res = await getCarros();
      console.log('Carros Response:', res);
      if (Array.isArray(res)) {
        setCarros(res);
      } else if (res.data && Array.isArray(res.data)) {
        setCarros(res.data);
      } else {
        console.warn('Unexpected carros response format:', res);
        setCarros([]);
      }
    } catch (error) {
      console.error('Error fetching carros:', error);
      setErrorMessage('Error al cargar los carros.');
    }
  };

  const fetchChoferes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/choferes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChoferes(res.data || []);
    } catch (error) {
      console.error('Error fetching choferes:', error);
      setErrorMessage('Error al cargar los choferes.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === 'taras' || field === 'kgxTara') {
        const taras = field === 'taras' ? parseFloat(value) || 0 : prev.taras;
        const kgxTara = field === 'kgxTara' ? parseFloat(value) || 0 : prev.kgxTara;
        newData.totalKilos = parseFloat((taras * kgxTara).toFixed(4));
      }
      return newData;
    });
    setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.idRecepcion) return 'El ID de recepción es requerido';
    if (!formData.foliofisico) return 'El folio físico es requerido';
    if (!formData.lote) return 'El lote es requerido';
    if (!formData.fecha) return 'La fecha es requerida';
    if (!formData.idciclos) return 'El ciclo es requerido';
    if (!formData.idpropietario) return 'El propietario es requerido';
    if (!formData.idgranja) return 'La granja es requerida';
    if (detalleItems.length === 0) return 'Debe agregar al menos un detalle';
    return '';
  };

  // ---------------------- CRUD RECEPCIÓN ----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const newRecepcion: RecepcionItem = {
      id: parseInt(formData.idRecepcion),
      foliofisico: formData.foliofisico,
      fecha: formData.fecha,
      lote: formData.lote,
      idciclo: formData.idciclos,
      idgranja: formData.idgranja,
      idpropietario: formData.idpropietario,
      totalKilos: getTotalGeneral(),
      subida: 'N',
    };

    try {
      if (selectedRow !== null) {
        await axios.put(`http://localhost:3000/api/recepcion/${newRecepcion.id}`, newRecepcion);
        await Promise.all(
          detalleItems.map((d) =>
            axios.put(`http://localhost:3000/api/recepcion/${newRecepcion.id}/detalles`, d)
          )
        );
      } else {
        await axios.post('http://localhost:3000/api/recepcion', newRecepcion);
        await Promise.all(
          detalleItems.map((d) =>
            axios.post(`http://localhost:3000/api/recepcion/${newRecepcion.id}/detalles`, d)
          )
        );
      }
      fetchRecepciones();
      fetchNextId(); // Refresh the next ID after creating a new reception
      resetForm();
    } catch (error) {
      console.error('Error al guardar recepción', error);
      setErrorMessage('Error al guardar la recepción.');
    }
  };

  const handleDeleteRecepcion = async () => {
    if (selectedRow === null) return;
    const recepcionId = recepciones[selectedRow].id;
    try {
      await axios.delete(`http://localhost:3000/api/recepcion/${recepcionId}`);
      fetchRecepciones();
      fetchNextId(); // Refresh the next ID after deletion
      setSelectedRow(null);
    } catch (error) {
      console.error('Error al eliminar recepción', error);
      setErrorMessage('Error al eliminar la recepción.');
    }
  };

  // ---------------------- DETALLES ----------------------
  const handleAgregarDetalle = () => {
    if (!formData.estanque || formData.taras <= 0 || formData.kgxTara <= 0) {
      setErrorMessage('Estanque, taras y kg por tara son requeridos y mayores a 0');
      return;
    }

    const nuevoDetalle: RecepcionDetalle = {
      estanque: parseInt(formData.estanque),
      taras: formData.taras,
      kgxTara: formData.kgxTara,
      tKilogramos: formData.totalKilos,
      basura: formData.kgBasura,
      total: formData.totalKilos - formData.kgBasura,
      pPromedio: formData.pPromedio,
    };

    if (editingDetailIndex !== null) {
      setDetalleItems((prev) => prev.map((d, i) => (i === editingDetailIndex ? nuevoDetalle : d)));
      setEditingDetailIndex(null);
    } else {
      setDetalleItems((prev) => [...prev, nuevoDetalle]);
    }

    setFormData((prev) => ({
      ...prev,
      estanque: '',
      taras: 0,
      kgxTara: 45.0,
      kgBasura: 0,
      totalKilos: 0,
      pPromedio: 0,
    }));
    setErrorMessage('');
  };

  const handleDeleteDetail = (index: number) => {
    setDetalleItems((prev) => prev.filter((_, i) => i !== index));
    setEditingDetailIndex(null);
  };

  const handleEditDetail = (index: number) => {
    const detail = detalleItems[index];
    setFormData((prev) => ({
      ...prev,
      estanque: detail.estanque.toString(),
      taras: detail.taras,
      kgxTara: detail.kgxTara,
      kgBasura: detail.basura,
      totalKilos: detail.tKilogramos,
      pPromedio: detail.pPromedio,
    }));
    setEditingDetailIndex(index);
  };

  const getTotalGeneral = () => detalleItems.reduce((total, item) => total + item.total, 0);

  const resetForm = () => {
    setShowForm(false);
    setSelectedRow(null);
    setDetalleItems([]);
    setEditingDetailIndex(null);
    setErrorMessage('');
    setFormData({
      idRecepcion: nextId?.toString() || '',
      foliofisico: '',
      lote: '',
      fecha: new Date().toISOString().split('T')[0],
      idciclos: '',
      idpropietario: '',
      idgranja: '',
      idcarro: '',
      idchofer: '',
      taras: 0,
      kgxTara: 45.0,
      kgBasura: 0,
      pPromedio: 0,
      estanque: '',
      totalKilos: 0,
      observacion: 'SIN OBSERVACION',
      esMaquilla: false,
    });
  };

  const handleModify = () => {
    if (selectedRow === null) return;
    const recepcion = recepciones[selectedRow];
    setFormData({
      idRecepcion: recepcion.id.toString(),
      foliofisico: recepcion.foliofisico,
      lote: recepcion.lote,
      fecha: recepcion.fecha,
      idciclos: recepcion.idciclo,
      idpropietario: recepcion.idpropietario,
      idgranja: recepcion.idgranja,
      idcarro: '',
      idchofer: '',
      taras: 0,
      kgxTara: 45.0,
      kgBasura: 0,
      pPromedio: 0,
      estanque: '',
      totalKilos: 0,
      observacion: 'SIN OBSERVACION',
      esMaquilla: false,
    });
    setDetalleItems([...getDetalleRecepcion()]);
    setShowForm(true);
    setEditingDetailIndex(null);
  };

  const getDetalleRecepcion = (): RecepcionDetalle[] => {
    if (selectedRow === null) return [];
    const recepcionId = recepciones[selectedRow].id;
    return detallesPorRecepcion[recepcionId] || [];
  };

  // ---------------------- RENDER ----------------------
  if (loading) return <div>Cargando...</div>;

  if (showForm) {
    return (
      <div className="flex-1 bg-white h-screen">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {selectedRow !== null ? 'Modificar Recepción' : 'Recepción de Producto - Nuevo'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Id Recepción:</label>
                <input
                  type="text"
                  value={formData.idRecepcion}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  placeholder="1019"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folio Físico:</label>
                <input
                  type="text"
                  value={formData.foliofisico}
                  onChange={(e) => handleInputChange('foliofisico', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
                <input
                  type="text"
                  value={formData.lote}
                  onChange={(e) => handleInputChange('lote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.esMaquilla}
                  onChange={(e) => handleInputChange('esMaquilla', e.target.checked)}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Es Maquilla</label>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ciclos:</label>
                <select
                  value={formData.idciclos}
                  onChange={(e) => handleInputChange('idciclos', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {ciclos?.map((ciclo) => (
                    <option key={ciclo.cicloid} value={ciclo.cicloid?.toString() || ''}>
                      {`${ciclo.año}-${ciclo.ciclo}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
                <div className="flex">
                  <select
                    value={formData.idpropietario}
                    onChange={(e) => handleInputChange('idpropietario', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {propietarios?.map((propietario) => (
                      <option key={propietario.idpropietario} value={propietario.idpropietario?.toString() || ''}>
                        {propietario.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Granja:</label>
                <div className="flex">
                  <select
                    value={formData.idgranja}
                    onChange={(e) => handleInputChange('idgranja', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {granjas?.map((granja) => (
                      <option key={granja.idgranja} value={granja.idgranja?.toString() || ''}>
                        {granja.granja}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carro:</label>
                <div className="flex">
                  <select
                    value={formData.idcarro}
                    onChange={(e) => handleInputChange('idcarro', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {carros?.map((carro) => (
                      <option key={carro.idcarro} value={carro.idcarro?.toString() || ''}>
                        {carro.placas}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chofer:</label>
                <div className="flex">
                  <select
                    value={formData.idchofer}
                    onChange={(e) => handleInputChange('idchofer', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {choferes?.map((chofer) => (
                      <option key={chofer.idchofer} value={chofer.idchofer?.toString() || ''}>
                        {chofer.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle</h3>
              <div className="grid grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Taras:</label>
                  <input
                    type="number"
                    value={formData.taras}
                    onChange={(e) => handleInputChange('taras', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KgXTara:</label>
                  <input
                    type="number"
                    value={formData.kgxTara}
                    onChange={(e) => handleInputChange('kgxTara', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kg Basura:</label>
                  <input
                    type="number"
                    value={formData.kgBasura}
                    onChange={(e) => handleInputChange('kgBasura', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">P.Promedio:</label>
                  <input
                    type="number"
                    value={formData.pPromedio}
                    onChange={(e) => handleInputChange('pPromedio', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estanque:</label>
                  <input
                    type="text"
                    value={formData.estanque}
                    onChange={(e) => handleInputChange('estanque', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Kilos:</label>
                  <input
                    type="number"
                    value={formData.totalKilos}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    step="0.0001"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleAgregarDetalle}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {editingDetailIndex !== null ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={() => setDetalleItems([])}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar
                </button>
              </div>
            </div>
            {detalleItems.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle de Recepciones</h3>
                <div className="bg-blue-50 p-4 rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-200">
                        <th className="px-2 py-1 text-left">ESTANQUE</th>
                        <th className="px-2 py-1 text-left">TARAS</th>
                        <th className="px-2 py-1 text-left">KGXTARA</th>
                        <th className="px-2 py-1 text-left">TOTAL KG</th>
                        <th className="px-2 py-1 text-left">KG BASURA</th>
                        <th className="px-2 py-1 text-left">P. PROMEDIO</th>
                        <th className="px-2 py-1 text-left">ACCIÓN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalleItems.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-2 py-1">{item.estanque}</td>
                          <td className="px-2 py-1">{item.taras.toFixed(4)}</td>
                          <td className="px-2 py-1">{item.kgxTara.toFixed(4)}</td>
                          <td className="px-2 py-1">{item.tKilogramos.toFixed(4)}</td>
                          <td className="px-2 py-1">{item.basura.toFixed(4)}</td>
                          <td className="px-2 py-1">{item.pPromedio.toFixed(4)}</td>
                          <td className="px-2 py-1 flex gap-2">
                            <button
                              onClick={() => handleEditDetail(idx)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDetail(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 text-right font-medium">
                    Total: {getTotalGeneral().toFixed(4)}
                  </div>
                </div>
              </div>
            )}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observación:</label>
              <textarea
                value={formData.observacion}
                onChange={(e) => handleInputChange('observacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t z-10">
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Regresar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Recepciones</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 px-3 pb-3 overflow-x-auto flex-nowrap whitespace-nowrap">
          <button
            onClick={() => {
              setShowForm(true);
              if (nextId) {
                setFormData(prev => ({ ...prev, idRecepcion: nextId.toString() }));
              }
            }}
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
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDeleteRecepcion}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm">
            Subir Nube
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm">
            Salir
          </button>
        </div>
      </div>
      <div className="p-4">
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {errorMessage}
          </div>
        )}
        <div className="overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  FÍSICO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  FECHA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  LOTE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  CICLO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GRANJA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PROPIETARIO
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  TOTALKILOS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                  SUBIDA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recepciones?.map((row, index) => {
                const ciclo = ciclos.find(c => c.cicloid?.toString() === row.idciclo);
                const granja = granjas.find(g => g.idgranja?.toString() === row.idgranja);
                const propietario = propietarios.find(p => p.idpropietario?.toString() === row.idpropietario);
                return (
                <tr
                  key={index}
                  onClick={() => setSelectedRow(index)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.foliofisico}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.fecha}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.lote}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{ciclo ? `${ciclo.año}-${ciclo.ciclo}` : row.idciclo}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{granja ? granja.granja : row.idgranja}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{propietario ? propietario.nombre : row.idpropietario}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {detallesPorRecepcion[row.id]?.reduce((sum, d) => sum + d.total, 0).toFixed(3) || '0'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.subida}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {selectedRow !== null && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Detalle</h3>
            <div className="text-xs text-gray-600 mb-2">
              Drag a column header here to group by that column
            </div>
            <div className="mb-2 text-sm text-blue-600 font-medium">
              Recepción ID: {recepciones[selectedRow].id} -{' '}
              {granjas.find(g => g.idgranja?.toString() === recepciones[selectedRow].idgranja)?.granja || recepciones[selectedRow].idgranja} -{' '}
              {propietarios.find(p => p.idpropietario?.toString() === recepciones[selectedRow].idpropietario)?.nombre || recepciones[selectedRow].idpropietario}
            </div>
            <table className="w-full mt-2 text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-2 py-1 text-left">ESTANQUE</th>
                  <th className="px-2 py-1 text-left">TARAS</th>
                  <th className="px-2 py-1 text-left">KGXTARA</th>
                  <th className="px-2 py-1 text-left">T. KILOGRAMOS</th>
                  <th className="px-2 py-1 text-left">BASURA</th>
                  <th className="px-2 py-1 text-left">TOTAL</th>
                  <th className="px-2 py-1 text-left">P. PROMEDIO</th>
                </tr>
              </thead>
              <tbody>
                {getDetalleRecepcion().map((detalle, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-2 py-1">{detalle.estanque}</td>
                    <td className="px-2 py-1">{detalle.taras.toFixed(2)}</td>
                    <td className="px-2 py-1">{detalle.kgxTara.toFixed(2)}</td>
                    <td className="px-2 py-1">{detalle.tKilogramos.toFixed(2)}</td>
                    <td className="px-2 py-1">{detalle.basura.toFixed(2)}</td>
                    <td className="px-2 py-1">{detalle.total.toFixed(2)}</td>
                    <td className="px-2 py-1">{detalle.pPromedio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-right">
              <span className="text-sm font-medium text-gray-700">
                Total: {getDetalleRecepcion().reduce((sum, item) => sum + item.total, 0).toFixed(2)} kg
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}