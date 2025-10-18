import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Save, Search, X, Printer } from 'lucide-react';
import { getCarros } from '../../api/carrosApi';
import { useAuth } from '../../context/AuthContext';

interface RecepcionItem {
  recepcionid?: number;
  foliofisico: string;
  fecha: string;
  lote: string;
  cicloid: string;
  propietarioid: string;
  granjaid: string;
  carroid: string;
  choferid: string;
  totalKilos: number;
  subida: string;
  maquila?: string;
}

interface RecepcionDetalle {
  estanque: number;
  taras: number;
  kilogramosxtara: number;
  kilogramosbasura: number;
  totalkilogramos: number;
  pesopromedio: number;
}

interface Granja {
  granjaid?: number | string;
  granja?: string;
  status?: string;
  propietarioid?: number | string;
}

interface Ciclo {
  cicloid?: number | string;
  año?: string;
  ciclo?: string;
  status?: string;
}

interface Propietario {
  propietarioid?: number | string;
  nombre?: string;
  status?: string;
}

interface Carro {
  carroid?: number | string;
  placas?: string;
  status?: string;
}

interface Chofer {
  choferid?: number | string;
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
  const [filteredGranjas, setFilteredGranjas] = useState<Granja[]>([]);
  const [formData, setFormData] = useState({
    recepcionid: '',
    foliofisico: '',
    lote: '',
    fecha: new Date().toISOString().split('T')[0],
    cicloid: '',
    propietarioid: '',
    granjaid: '',
    carroid: '',
    choferid: '',
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
      console.log('API Response (recepciones):', res.data);
      let recepcionesArray: RecepcionItem[] = [];
      if (Array.isArray(res.data)) {
        recepcionesArray = res.data.map((r: RecepcionItem) => ({
          ...r,
          recepcionid: String(r.recepcionid),
          granjaid: String(r.granjaid),
          carroid: String(r.carroid),
          choferid: String(r.choferid),
          propietarioid: String(r.propietarioid),
          cicloid: String(r.cicloid),
          lote: String(r.lote),
        }));
      } else if (Array.isArray(res.data.recepciones)) {
        recepcionesArray = res.data.recepciones.map((r: RecepcionItem) => ({
          ...r,
          recepcionid: String(r.recepcionid),
          granjaid: String(r.granjaid),
          carroid: String(r.carroid),
          choferid: String(r.choferid),
          propietarioid: String(r.propietarioid),
          cicloid: String(r.cicloid),
          lote: String(r.lote),
        }));
      } else {
        console.error('API no devolvió un array de recepciones', res.data);
        setErrorMessage('Error: No se pudieron cargar las recepciones.');
        return;
      }
      setRecepciones(recepcionesArray);

      const detalles: { [key: number]: RecepcionDetalle[] } = {};
      await Promise.all(
        recepcionesArray.map(async (r) => {
          const id = parseInt(r.recepcionid || '0');
          if (!id) {
            console.warn(`Skipping reception with invalid ID:`, r);
            return;
          }
          try {
            const dRes = await axios.get(`http://localhost:3000/api/recepcion/${id}/detalles`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log(`Request URL for id ${id}:`, `http://localhost:3000/api/recepcion/${id}/detalles`);
            console.log(`Details response for id ${id}:`, dRes.data);
            if (Array.isArray(dRes.data)) {
              detalles[id] = dRes.data;
            } else if (Array.isArray(dRes.data.detalles)) {
              detalles[id] = dRes.data.detalles;
            } else {
              detalles[id] = [];
              console.warn(`Unexpected details format for id ${id}, setting empty array`, dRes.data);
            }
          } catch (error) {
            console.error(`Error al obtener detalles de recepción ${id}`, error);
            if (error) {
              console.warn(`No details found for reception ${id}, setting empty array`);
              detalles[id] = [];
            } else {
              detalles[id] = [];
            }
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
      const normalizedGranjas = res.data.map((granja: Granja) => ({
        ...granja,
        granjaid: String(granja.granjaid),
        propietarioid: String(granja.propietarioid),
      }));
      setGranjas(normalizedGranjas);
      console.log('Normalized Granjas:', normalizedGranjas);
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
      const normalizedCiclos = res.data.map((ciclo: Ciclo) => ({
        ...ciclo,
        cicloid: String(ciclo.cicloid),
      }));
      setCiclos(normalizedCiclos);
      console.log('Normalized Ciclos:', normalizedCiclos);
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
      const normalizedPropietarios = res.data.map((propietario: Propietario) => ({
        ...propietario,
        propietarioid: String(propietario.propietarioid),
      }));
      setPropietarios(normalizedPropietarios);
      console.log('Normalized Propietarios:', normalizedPropietarios);
    } catch (error) {
      console.error('Error fetching propietarios:', error);
      setErrorMessage('Error al cargar los propietarios.');
    }
  };

  const fetchCarros = async () => {
    try {
      const res = await getCarros();
      console.log('Carros Response:', res);
      let carrosArray: Carro[] = [];
      if (Array.isArray(res)) {
        carrosArray = res;
      } else if (res.data && Array.isArray(res.data)) {
        carrosArray = res.data;
      } else {
        console.warn('Unexpected carros response format:', res);
        carrosArray = [];
      }
      const normalizedCarros = carrosArray.map((carro: Carro) => ({
        ...carro,
        carroid: String(carro.carroid),
      }));
      setCarros(normalizedCarros);
      console.log('Normalized Carros:', normalizedCarros);
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
      const normalizedChoferes = res.data.map((chofer: Chofer) => ({
        ...chofer,
        choferid: String(chofer.choferid),
      }));
      setChoferes(normalizedChoferes);
      console.log('Normalized Choferes:', normalizedChoferes);
    } catch (error) {
      console.error('Error fetching choferes:', error);
      setErrorMessage('Error al cargar los choferes.');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const newValue = field === 'fecha' || field === 'foliofisico' || field === 'lote' || field === 'estanque' || field === 'observacion' || field === 'cicloid' || field === 'propietarioid' || field === 'granjaid' || field === 'carroid' || field === 'choferid' || field === 'esMaquilla' ? value : parseFloat(value) || 0;
      const newData = { ...prev, [field]: newValue };

      if (field === 'taras' || field === 'kgxTara') {
        const taras = field === 'taras' ? newValue : prev.taras;
        const kgxTara = field === 'kgxTara' ? newValue : prev.kgxTara;
        newData.totalKilos = parseFloat((taras * kgxTara).toFixed(4)) || 0;
      }

      if (field === 'propietarioid') {
        newData.granjaid = '';
        const selectedPropietarioId = String(value);
        const filtered = granjas.filter((granja) => granja.propietarioid === selectedPropietarioId);
        setFilteredGranjas(filtered);
        console.log('Filtered Granjas in handleInputChange:', filtered);
      }

      return newData;
    });
    setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.recepcionid) return 'El ID de recepción es requerido';
    if (!formData.foliofisico) return 'El folio físico es requerido';
    if (!formData.lote) return 'El lote es requerido';
    if (!formData.fecha) return 'La fecha es requerida';
    if (!formData.cicloid) return 'El ciclo es requerido';
    if (!formData.propietarioid) return 'El propietario es requerido';
    if (!formData.granjaid) return 'La granja es requerida';
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

    const newRecepcion = {
      foliofisico: formData.foliofisico,
      lote: formData.lote,
      fecha: formData.fecha,
      granjaid: formData.granjaid,
      taras: formData.taras,
      totalkilogramos: getTotalGeneral(),
      carroid: formData.carroid || null,
      choferid: formData.choferid || null,
      observacion: formData.observacion,
      propietarioid: formData.propietarioid,
      cicloid: formData.cicloid,
      procesada: 'N',
      maquila: formData.esMaquilla ? 'Y' : 'N',
      subida: 'N',
      status: 'A',
    };
    const detalles = detalleItems.map(d => ({
      foliofisico: formData.foliofisico,
      estanque: d.estanque,
      pPromedio: d.pesopromedio,
      taras: d.taras,
      kgxTara: d.kilogramosxtara,
      basura: d.kilogramosbasura,
      totalkgs: d.totalkilogramos,
    }));

    try {
      const response = await axios.post('http://localhost:3000/api/recepcion', { ...newRecepcion, detalles }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response:', response.data);
      fetchRecepciones();
      fetchNextId();
      resetForm();
    } catch (error) {
      console.error('Error al guardar recepción', error);
      setErrorMessage('Error al guardar la recepción. Verifica los detalles.');
    }
  };

  const handleDeleteRecepcion = async () => {
    if (selectedRow === null) return;
    const recepcionId = recepciones[selectedRow].recepcionid;
    if (!recepcionId) {
      console.error('No valid recepcionId for deletion');
      return;
    }
    try {
      await axios.delete(`http://localhost:3000/api/recepcion/${recepcionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRecepciones();
      fetchNextId();
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
      estanque: parseInt(formData.estanque) || 0,
      taras: formData.taras || 0,
      kilogramosxtara: formData.kgxTara || 0,
      kilogramosbasura: formData.kgBasura || 0,
      totalkilogramos: (formData.totalKilos || 0) - (formData.kgBasura || 0),
      pesopromedio: formData.pPromedio || 0,
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
      estanque: String(detail.estanque),
      taras: detail.taras,
      kgxTara: detail.kilogramosxtara,
      kgBasura: detail.kilogramosbasura,
      totalKilos: detail.totalkilogramos,
      pPromedio: detail.pesopromedio,
    }));
    setEditingDetailIndex(index);
  };

  const getTotalGeneral = () => detalleItems.reduce((total, item) => total + Number(item.totalkilogramos), 0);

  const resetForm = () => {
    setShowForm(false);
    setSelectedRow(null);
    setDetalleItems([]);
    setEditingDetailIndex(null);
    setErrorMessage('');
    setFilteredGranjas([]);
    setFormData({
      recepcionid: nextId?.toString() || '',
      foliofisico: '',
      lote: '',
      fecha: new Date().toISOString().split('T')[0],
      cicloid: '',
      propietarioid: '',
      granjaid: '',
      carroid: '',
      choferid: '',
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
    
    console.log('Recepcion seleccionada:', recepcion);
    console.log('Carros disponibles:', carros);
    console.log('Choferes disponibles:', choferes);

  // Actualizar filteredGranjas basado en el propietario de la recepción
    const selectedPropietarioId = String(recepcion.propietarioid);
    const filtered = granjas.filter((granja) => granja.propietarioid === selectedPropietarioId);
    setFilteredGranjas(filtered);
    console.log('Filtered Granjas:', filtered);

    // Verificar si granjaid, carroid y choferid existen en las listas correspondientes
    const granjaExists = filtered.some((granja) => String(granja.granjaid) === String(recepcion.granjaid));
    const carroExists = carros.some((carro) => String(carro.carroid) === String(recepcion.carroid));
    const choferExists = choferes.some((chofer) => String(chofer.choferid) === String(recepcion.choferid));

    if (!granjaExists && recepcion.granjaid) {
      console.warn(`Granja con id ${recepcion.granjaid} no encontrada para propietario ${selectedPropietarioId}`);
      setErrorMessage(`Granja con id ${recepcion.granjaid} no encontrada. Por favor, selecciona otra granja.`);
    }
    if (!carroExists && recepcion.carroid) {
      console.warn(`Carro con id ${recepcion.carroid} no encontrado en la lista de carros`);
      setErrorMessage(`Carro con id ${recepcion.carroid} no encontrado. Por favor, selecciona otro carro.`);
    }
    if (!choferExists && recepcion.choferid) {
      console.warn(`Chofer con id ${recepcion.choferid} no encontrado en la lista de choferes`);
      setErrorMessage(`Chofer con id ${recepcion.choferid} no encontrado. Por favor, selecciona otro chofer.`);
    }

        // Formatear la fecha para el input type="date"
  const formattedFecha = recepcion.fecha ? recepcion.fecha.split('T')[0] : new Date().toISOString().split('T')[0];

  // Actualizar formData con todos los valores de la recepción seleccionada
  setFormData({
      recepcionid: String(recepcion.recepcionid) || '',
      foliofisico: recepcion.foliofisico || '',
      lote: String(recepcion.lote) || '',
      fecha: formattedFecha,
      cicloid: String(recepcion.cicloid) || '',
      propietarioid: String(recepcion.propietarioid) || '',
      granjaid: String(recepcion.granjaid) || '',
      carroid: String(recepcion.carroid) || '',
      choferid: String(recepcion.choferid) || '',
      taras: 0,
      kgxTara: 45.0,
      kgBasura: 0,
      pPromedio: 0,
      estanque: '',
      totalKilos: 0,
      observacion: 'SIN OBSERVACION',
      esMaquilla: recepcion.maquila === 'Y',
    });

    // Cargar los detalles de la recepción seleccionada
    setDetalleItems([...getDetalleRecepcion()]);
    setShowForm(true);
    setEditingDetailIndex(null);

    console.log('FormData después de modificar:', {
      recepcionid: String(recepcion.recepcionid) || '',
      foliofisico: recepcion.foliofisico || '',
      lote: String(recepcion.lote) || '',
      fecha: formattedFecha,
      cicloid: String(recepcion.cicloid) || '',
      propietarioid: String(recepcion.propietarioid) || '',
      granjaid: String(recepcion.granjaid) || '',
      carroid: String(recepcion.carroid) || '',
      choferid: String(recepcion.choferid) || '',
      taras: 0,
      kgxTara: 45.0,
      kgBasura: 0,
      pPromedio: 0,
      estanque: '',
      totalKilos: 0,
      observacion: 'SIN OBSERVACION',
      esMaquilla: recepcion.maquila === 'Y',
    });
  };

  const getDetalleRecepcion = (): RecepcionDetalle[] => {
    if (selectedRow === null) return [];
    const recepcionId = recepciones[selectedRow].recepcionid;
    return detallesPorRecepcion[recepcionId || 0] || [];
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
                  value={formData.recepcionid}
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
                  value={formData.cicloid}
                  onChange={(e) => handleInputChange('cicloid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  {ciclos?.map((ciclo) => (
                    <option key={ciclo.cicloid} value={ciclo.cicloid}>
                      {`${ciclo.año}-${ciclo.ciclo}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
                <div className="flex">
                  <select
                    value={formData.propietarioid}
                    onChange={(e) => handleInputChange('propietarioid', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {propietarios?.map((propietario) => (
                      <option key={propietario.propietarioid} value={propietario.propietarioid}>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Granja:</label>
                <div className="flex">
                  <select
                    value={formData.granjaid}
                    onChange={(e) => handleInputChange('granjaid', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.propietarioid}
                  >
                    <option value="">Seleccionar...</option>
                    {filteredGranjas.map((granja) => (
                      <option key={granja.granjaid} value={granja.granjaid}>
                        {granja.granja}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                    disabled={!formData.propietarioid}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carro:</label>
                <div className="flex">
                  <select
                    value={formData.carroid}
                    onChange={(e) => handleInputChange('carroid', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {carros?.map((carro) => (
                      <option key={carro.carroid} value={carro.carroid}>
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
                    value={formData.choferid}
                    onChange={(e) => handleInputChange('choferid', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    {choferes?.map((chofer) => (
                      <option key={chofer.choferid} value={chofer.choferid}>
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
                    onChange={(e) => handleInputChange('taras', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KgXTara:</label>
                  <input
                    type="number"
                    value={formData.kgxTara}
                    onChange={(e) => handleInputChange('kgxTara', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kg Basura:</label>
                  <input
                    type="number"
                    value={formData.kgBasura}
                    onChange={(e) => handleInputChange('kgBasura', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">P.Promedio:</label>
                  <input
                    type="number"
                    value={formData.pPromedio}
                    onChange={(e) => handleInputChange('pPromedio', e.target.value)}
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
                          <td className="px-2 py-1">{Number(item.taras).toFixed(4)}</td>
                          <td className="px-2 py-1">{Number(item.kilogramosxtara).toFixed(4)}</td>
                          <td className="px-2 py-1">{Number(item.totalkilogramos).toFixed(4)}</td>
                          <td className="px-2 py-1">{Number(item.kilogramosbasura).toFixed(4)}</td>
                          <td className="px-2 py-1">{Number(item.pesopromedio).toFixed(4)}</td>
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
                setFormData(prev => ({ ...prev, recepcionid: String(nextId) }));
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
                const ciclo = ciclos.find(c => c.cicloid === row.cicloid);
                const granja = granjas.find(g => g.granjaid === row.granjaid);
                const propietario = propietarios.find(p => p.propietarioid === row.propietarioid);
                return (
                <tr
                  key={index}
                  onClick={() => setSelectedRow(index)}
                  className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{row.recepcionid}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.foliofisico}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.fecha.split('T')[0]}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.lote}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{ciclo ? `${ciclo.año}-${ciclo.ciclo}` : row.cicloid}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{granja ? granja.granja : row.granjaid}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{propietario ? propietario.nombre : row.propietarioid}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {detallesPorRecepcion[row.recepcionid || 0]?.reduce((sum, d) => sum + Number(d.totalkilogramos), 0).toFixed(3) || '0'}
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
              Recepción ID: {recepciones[selectedRow].recepcionid} -{' '}
              {granjas.find(g => g.granjaid === recepciones[selectedRow].granjaid)?.granja || recepciones[selectedRow].granjaid} -{' '}
              {propietarios.find(p => p.propietarioid === recepciones[selectedRow].propietarioid)?.nombre || recepciones[selectedRow].propietarioid}
            </div>
            <table className="w-full mt-2 text-sm">
              <thead>
                <tr className="bg-blue-100">
                  <th className="px-2 py-1 text-left">ESTANQUE</th>
                  <th className="px-2 py-1 text-left">TARAS</th>
                  <th className="px-2 py-1 text-left">KGXTARA</th>
                  <th className="px-2 py-1 text-left">BASURA</th>
                  <th className="px-2 py-1 text-left">TOTAL</th>
                  <th className="px-2 py-1 text-left">P. PROMEDIO</th>
                </tr>
              </thead>
              <tbody>
                {getDetalleRecepcion().map((detalle, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-2 py-1">{detalle.estanque}</td>
                    <td className="px-2 py-1">{Number(detalle.taras).toFixed(2)}</td>
                    <td className="px-2 py-1">{Number(detalle.kilogramosxtara).toFixed(2)}</td>
                    <td className="px-2 py-1">{Number(detalle.kilogramosbasura).toFixed(2)}</td>
                    <td className="px-2 py-1">{Number(detalle.totalkilogramos).toFixed(2)}</td>
                    <td className="px-2 py-1">{Number(detalle.pesopromedio).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-right">
              <span className="text-sm font-medium text-gray-700">
                Total: {getDetalleRecepcion().reduce((sum, item) => sum + Number(item.totalkilogramos), 0).toFixed(2)} kg
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}