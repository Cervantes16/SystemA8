import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { Printer, RefreshCw, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
//import axios from 'axios';
import {
  getCiclos,
  getBodegas,
  getUbicaciones,
  getGranjas,
  getTallas,
  getRecepciones,
  getDetalleEtiquetas,
  getBarcodes,
  createEtiquetas,
  deleteCajaPorBarcode,
} from '../../api/empaqueApi';

interface Ciclo {
  cicloid: number;
  año: string;
  ciclo: string;
  status: string;
}

interface Bodega {
  bodegaid: number;
  bodega: string;
  lugar: string;
  foranea: string;
  estatus: string;
}

interface Ubicacion {
  ubicacionid: number;
  bodegaid: number;
  bahia: string;
  seccion: string;
  piso: string;
  fondo: string;
  codigoubicacion: string;
  qrubicacion: string;
  tarimaid: number | null;
  estado: string;
  ultimamod: string;
}

interface Recepcion {
  recepcionid: number;
  foliofisico: string;
  lote: number;
  fecha: string;
  granjaid: number;
  taras: string;
  totalkilogramos: string;
  carroid: number;
  choferid: number;
  observacion: string;
  propietarioid: number;
  cicloid: number;
  procesada: string;
  maquila: string;
  subida: string;
  status: string;
}

interface Granja {
  granjaid: number;
  granja: string;
  propietarioid: number;
}

interface Talla {
  tallaid: number;
  talla: string;
  ccabeza: string;
}

interface FormData {
  fechaEmpaque: string;
  diaJuliano: string;
  lote: string;
  cicloid: number;
  granja: number;
  talla: number;
  camarones: string;
  presentacionKgs: string;
  presentacionLbs: string;
  producto: string;
  uniformidad: string;
  metabisulfato: boolean;
  horaEmpaque: string;
  nombrePlanta: string;
  zDesigner: string;
  numeroCartones: number;
  bodega: number;
  bahia: string;
  seccion: string;
  fondo: string;
  piso: string;
  posicion: string;
  tarima: string;
}

interface DetalleEtiqueta {
  id: number;
  fecha: string;
  diajuliano: string;
  slote: string;
  cicloid: number;
  tallaid: number;
  talla: string;
  cartones: number;
  kgs: number;
  producto: string;
}

interface DeleteForm {
  lote: string;
  cicloid: number;
  granja: string;
  talla: string;
  producto: string;
  kilos: number;
  cantidadEliminar: number;
  motivo: string;
}

interface Etiqueta {
  barcode: string;
  qrContent: string;
}

const GeneracionEtiquetas: React.FC = () => {
  const { user, isLoading: authLoading, error: authError, userPermissions, token, logout } = useAuth();
  const navigate = useNavigate();
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [recepciones, setRecepciones] = useState<Recepcion[]>([]);
  const [granjas, setGranjas] = useState<Granja[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [availableGranjas, setAvailableGranjas] = useState<Granja[]>([]);
  const [detalleEtiquetas, setDetalleEtiquetas] = useState<DetalleEtiqueta[]>([]);
  const [impresos, setImpresos] = useState<string[]>([]);
  const [eliminados, setEliminados] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fechaEmpaque: new Date().toISOString().split('T')[0],
    //fechaEmpaque: "2025-09-27",
    diaJuliano: '',
    lote: '',
    cicloid: 0,
    granja: 0,
    talla: 0,
    camarones: '',
    presentacionKgs: '',
    presentacionLbs: '',
    producto: 'S/CABEZA',
    uniformidad: '',
    metabisulfato: true,
    horaEmpaque: '',
    nombrePlanta: 'PLANTA LAS AGUILAS',
    zDesigner: 'PDF',
    numeroCartones: 1,
    bodega: 0,
    bahia: '',
    seccion: '',
    fondo: '',
    piso: '',
    posicion: '',
    tarima: '',
  });
  const [deleteForm, setDeleteForm] = useState<DeleteForm>({
    lote: '',
    cicloid: 0,
    granja: '',
    talla: '',
    producto: '',
    kilos: 20,
    cantidadEliminar: 0,
    motivo: '',
  });

  // Authentication and permission checks
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user?.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!userPermissions.some(p => p.permiso === 'GenerarEtiquetas' || p.permiso === '*')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permiso para gestionar etiquetas.</p>
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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ciclosData, bodegasData, ubicacionesData, granjasData, tallasData] = await Promise.all([
          getCiclos(),
          getBodegas(),
          getUbicaciones(),
          getGranjas(),
          getTallas(),
        ]);
        setCiclos(ciclosData);
        setBodegas(bodegasData);
        setUbicaciones(ubicacionesData);
        setGranjas(granjasData);
        setAvailableGranjas(granjasData);
        setTallas(tallasData);

        if (ciclosData.length > 0 && formData.cicloid === 0) {
          const latestCiclo = ciclosData.reduce(
            (latest: Ciclo, ciclo: Ciclo) => (ciclo.cicloid > latest.cicloid ? ciclo : latest),
            ciclosData[0]
          );
          setFormData(prev => ({ ...prev, cicloid: latestCiclo.cicloid }));
          setDeleteForm(prev => ({ ...prev, cicloid: latestCiclo.cicloid }));
        } else if (ciclosData.length === 0) {
          setError('No hay ciclos disponibles. Por favor, verifica el servidor.');
          toast.error('No hay ciclos disponibles. Por favor, verifica el servidor.');
        }
      } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
        // 🔹 Oculta el error después de 4 segundos
        setTimeout(() => setError(null), 4000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch recepciones and detalle etiquetas
  useEffect(() => {
    const fetchRecepcionesAndEtiquetas = async () => {
      if (formData.cicloid !== 0 && formData.lote !== '') {
        try {
          const [recepcionesData, detalleEtiquetasData, barcodesData] = await Promise.all([
            getRecepciones(formData.cicloid, formData.lote),
            getDetalleEtiquetas(formData.cicloid, formData.lote),
            getBarcodes(formData.cicloid, formData.lote),
          ]);
          console.log('Fetched recepciones:', recepcionesData);
          console.log('Fetched detalleEtiquetas:', detalleEtiquetasData);
          console.log('Fetched barcodes:', barcodesData);
          setRecepciones(recepcionesData);
          setDetalleEtiquetas(detalleEtiquetasData);
          setImpresos(barcodesData);

          const fechasUnicas = Array.from(new Set(recepcionesData.map((r: Recepcion) => r.fecha).filter(Boolean))).sort();
          if (fechasUnicas.length > 0) {
            const rawFecha = fechasUnicas[0];

            // Normaliza la fecha (acepta 'YYYY-MM-DD' o 'YYYY-MM-DDTHH:mm:ssZ')
            const fechaLocal = new Date(rawFecha);

            if (!isNaN(fechaLocal.getTime())) {
              const fechaFormateada = fechaLocal.toISOString().split('T')[0];
              setFormData(prev => ({ ...prev, fechaEmpaque: fechaFormateada }));
            } else {
              console.error('⚠️ Fecha inválida:', rawFecha);
            }
          }
          const granjaIds = Array.from(new Set(recepcionesData.map((r: Recepcion) => Number(r.granjaid))));
          const filteredGranjas = granjas.filter(g => granjaIds.includes(g.granjaid));
          setAvailableGranjas(filteredGranjas.length > 0 ? filteredGranjas : granjas);

          if (filteredGranjas.length > 0) {
            setFormData(prev => ({ ...prev, granja: filteredGranjas[0].granjaid }));
          } else {
            setFormData(prev => ({ ...prev, granja: 0 }));
            toast.warn('No hay granjas disponibles para el ciclo y lote seleccionados.');
          }
        } catch (err: any) {
          setError(err.message);
          setDetalleEtiquetas([]);
          setImpresos([]);
          setAvailableGranjas(granjas);
          setFormData(prev => ({ ...prev, granja: 0 }));
          toast.error(err.message);
          // 🔹 Oculta el error después de 4 segundos
          setTimeout(() => setError(null), 4000);
        }
      } else {
        setAvailableGranjas(granjas);
        setRecepciones([]);
        setDetalleEtiquetas([]);
        setImpresos([]);
        setFormData(prev => ({ ...prev, granja: 0 }));
      }
    };
    fetchRecepcionesAndEtiquetas();
  }, [formData.cicloid, formData.lote, granjas]);

  // Update Julian day
  useEffect(() => {
    if (formData.fechaEmpaque) {
      const [year, month, day] = formData.fechaEmpaque.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      const startOfYear = new Date(year, 0, 1);
      const diff = date.getTime() - startOfYear.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const diaJuliano = Math.floor(diff / oneDay) + 1;
      setFormData(prev => ({
        ...prev,
        diaJuliano: String(diaJuliano).padStart(3, '0'),
      }));
    }
  }, [formData.fechaEmpaque]);

  // Update posicion
  useEffect(() => {
    if (formData.bodega && formData.bahia && formData.seccion && formData.fondo && formData.piso) {
      const posicion = `${formData.bahia}-${formData.seccion}${formData.fondo}${formData.piso}`;
      const isValid = ubicaciones.some(
        u => u.bodegaid === formData.bodega && u.codigoubicacion === posicion && u.estado === 'vacío'
      );
      setFormData(prev => ({
        ...prev,
        posicion: isValid ? posicion : '',
      }));
      if (!isValid && formData.bahia && formData.seccion && formData.fondo && formData.piso) {
        toast.error('La posición seleccionada no es válida o no está disponible (no está vacía).');
      }
    } else {
      setFormData(prev => ({ ...prev, posicion: '' }));
    }
  }, [formData.bodega, formData.bahia, formData.seccion, formData.fondo, formData.piso, ubicaciones]);

  const getNextFolio = (lote: string, tallaId: number, producto: string, kgs: number, diaJuliano: string, cicloid: number): number => {
    const selectedTalla = tallas.find(t => t.tallaid === tallaId);
    if (!selectedTalla) {
      toast.error('Talla seleccionada no válida.');
      return 1;
    }
    const matchingEntries = detalleEtiquetas.filter(
      detalle =>
        detalle.slote === lote &&
        detalle.cicloid === cicloid &&
        detalle.tallaid === tallaId &&
        detalle.producto === producto &&
        detalle.kgs === kgs &&
        detalle.diajuliano === diaJuliano
    );
    const totalCartones = matchingEntries.reduce((sum, entry) => sum + entry.cartones, 0);
    const idGranja = String(formData.granja).padStart(3, '0');
    const idTalla = String(tallaId).padStart(2, '0');
    const kilosFormateados = String(parseInt(String(kgs), 10)).padStart(3, '0');
    const idProducto = producto === 'S/CABEZA' ? '01' : '02';
    const ciclo = ciclos.find(c => c.cicloid === cicloid);
    const año = ciclo ? ciclo.año : '2025';
    const prefix = `${lote.padStart(4, '0')}${idGranja}${idTalla}${diaJuliano}${año}${kilosFormateados}${idProducto}`;
    const matchingBarcodes = impresos
      .filter(barcode => barcode.startsWith(prefix))
      .map(barcode => parseInt(barcode.slice(-4)))
      .sort((a, b) => b - a);
    const lastFolio = matchingBarcodes.length > 0 ? matchingBarcodes[0] : 0;
    return Math.max(totalCartones, lastFolio) + 1;
  };

  const codigos = useMemo(() => {
    if (formData.talla <= 0 || tallas.length === 0) return [];
    const codes = Array.from({ length: formData.numeroCartones }, (_, i) => {
      const idGranja = String(formData.granja).padStart(3, '0');
      const idTalla = String(formData.talla).padStart(2, '0');
      const startFolio = getNextFolio(
        formData.lote,
        formData.talla,
        formData.producto,
        parseFloat(formData.presentacionKgs),
        formData.diaJuliano,
        formData.cicloid
      );
      const numeroEtiqueta = String(startFolio + i).padStart(4, '0');
      const kilosFormateados = String(parseInt(formData.presentacionKgs, 10)).padStart(3, '0');
      const idProducto = formData.producto === 'S/CABEZA' ? '01' : '02';
      const ciclo = ciclos.find(c => c.cicloid === formData.cicloid);
      const año = ciclo ? ciclo.año : '2025';
      const barcode = `${formData.lote.padStart(4, '0')}${idGranja}${idTalla}${formData.diaJuliano.padStart(3, '0')}${año}${kilosFormateados}${idProducto}${numeroEtiqueta}`;
      const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';
      const qrContent = `Planta: ${formData.nombrePlanta}, Granja: ${granjas.find(g => g.granjaid === formData.granja)?.granja || ''}, Talla: ${tallas.find(t => t.tallaid === formData.talla)?.talla || ''}, Lote: ${formData.lote}, Ciclo: ${cicloDisplay}, Camarones: ${formData.camarones}, Pres.: ${formData.presentacionKgs}, DiaJuliano: ${formData.diaJuliano}, Producto: ${formData.producto === 'S/CABEZA' ? 'S/CABEZA' : 'C/CABEZA'}, Uniformidad: ${parseFloat(formData.uniformidad).toFixed(2)}, Barras: ${barcode}`;
      return { barcode, qrContent };
    });
    console.log('Generated codigos:', codes);
    return codes;
  }, [
    formData.talla,
    formData.numeroCartones,
    formData.lote,
    formData.granja,
    formData.producto,
    formData.presentacionKgs,
    formData.diaJuliano,
    formData.cicloid,
    formData.nombrePlanta,
    formData.camarones,
    formData.uniformidad,
    tallas,
    granjas,
    ciclos,
  ]);

  const getBodegaOptions = () => {
    if (!formData.bodega) {
      return { bahias: [], secciones: [], fondos: [], pisos: [] };
    }
    const configs = ubicaciones.filter(u => u.bodegaid === formData.bodega && u.estado === 'vacío');
    const bahias = Array.from(new Set(configs.map(c => c.bahia))).sort();
    const secciones = Array.from(new Set(configs.map(c => c.seccion))).sort((a, b) => a - b);
    const fondos = Array.from(new Set(configs.map(c => c.fondo))).sort();
    const pisos = Array.from(new Set(configs.map(c => c.piso))).sort();
    return { bahias, secciones, fondos, pisos };
  };

  const { bahias, secciones, fondos, pisos } = getBodegaOptions();

  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
    setFormData(prev => {
      let updated = { ...prev, [field]: value };
      if (field === 'presentacionKgs') {
        const kgs = parseFloat(String(value)) || 0;
        updated.presentacionLbs = (kgs * 2.20462).toFixed(3);
      }
      if (field === 'presentacionLbs') {
        const lbs = parseFloat(String(value)) || 0;
        updated.presentacionKgs = (lbs / 2.20462).toFixed(3);
      }
      if (field === 'numeroCartones') {
        updated.numeroCartones = parseInt(String(value)) || 0;
      }
      if (field === 'bodega') {
        updated.bahia = '';
        updated.seccion = '';
        updated.fondo = '';
        updated.piso = '';
        updated.posicion = '';
      }
      if (field === 'cicloid') {
        const newValue = Number(value);
        if (isNaN(newValue) || newValue === 0) {
          toast.error('Por favor, seleccione un ciclo válido.');
          return prev;
        }
        updated.cicloid = newValue;
        updated.lote = '';
        updated.granja = 0;
      }
      if (field === 'lote') {
        updated.granja = 0;
      }
      if (field === 'talla') {
        const selectedTallaId = Number(value);
        const selectedTalla = tallas.find(t => t.tallaid === selectedTallaId);
        if (selectedTalla) {
          const range = selectedTalla.talla.split('-');
          if (range.length === 2) {
            const minCamarones = range[0].trim();
            updated.camarones = minCamarones;
          }
          updated.producto = selectedTalla.ccabeza === 'S' ? 'C/CABEZA' : 'S/CABEZA';
        } else {
          updated.camarones = '';
          updated.producto = 'S/CABEZA';
          toast.warn('Talla no encontrada. Seleccione una talla válida.');
        }
      }
      return updated;
    });
  };

  const handleDeleteFormChange = (field: keyof DeleteForm, value: string | number) => {
    setDeleteForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'cicloid') {
        const newValue = Number(value);
        if (isNaN(newValue) || newValue === 0) {
          toast.error('Por favor, seleccione un ciclo válido.');
          return prev;
        }
        updated.cicloid = newValue;
      }
      return updated;
    });
  };

  const handlePrint = async () => {
    if (formData.numeroCartones <= 0) {
      toast.error('Por favor, ingrese un número válido de etiquetas/cartones.');
      return;
    }
    if (
      !formData.fechaEmpaque ||
      !formData.cicloid ||
      formData.granja === 0 ||
      !formData.bodega ||
      !formData.posicion ||
      !formData.talla
    ) {
      const missingFields = [];
      if (!formData.fechaEmpaque) missingFields.push('fecha');
      if (!formData.cicloid) missingFields.push('ciclo');
      if (formData.granja === 0) missingFields.push('granja');
      if (!formData.bodega) missingFields.push('bodega');
      if (!formData.posicion) missingFields.push('posición');
      if (!formData.talla) missingFields.push('talla');
      toast.error(`Por favor, complete todos los campos requeridos: ${missingFields.join(', ')}`);
      return;
    }
    const selectedTalla = tallas.find(t => t.tallaid === formData.talla);
    if (!selectedTalla) {
      toast.error('La talla seleccionada no es válida.');
      return;
    }
    const [year, month, day] = formData.fechaEmpaque.split('-').map(Number);
    const fechaLocal = new Date(year, month - 1, day);
    const fechaFormateada = fechaLocal.toLocaleDateString('es-ES', {
      timeZone: 'America/Mazatlan',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    if (fechaFormateada === 'Invalid Date') {
      toast.error('La fecha de empaque no es válida.');
      return;
    }
    if (codigos.length === 0) {
      toast.error('No se generaron códigos de barras. Verifique la talla seleccionada.');
      return;
    }

    const ciclo = ciclos.find(c => c.cicloid === formData.cicloid);
    const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';
    const jsonEtiquetas = codigos.map(codigo => {
      const fechaCaduca = new Date(fechaLocal);
      fechaCaduca.setFullYear(fechaCaduca.getFullYear() + 2);
      const folio = codigo.barcode.slice(-4);
      const leyendaAlergias = 'Este producto puede causar alergias en personas suceptibles.';
      const leyendaAlimentaria = 'El consumo crudo o poco cocido puede incrementar el riesgo de adquirir una enfermedad alimentaria.';
      return {
        folio,
        detalleid: String(detalleEtiquetas.length + 1), // Temporary ID, will be updated by server
        Planta: formData.nombrePlanta,
        Granja: granjas.find(g => g.granjaid === formData.granja)?.granja || '',
        Granjaid: String(formData.granja),
        TipoCamarón: formData.producto === 'S/CABEZA' ? 'S/CABEZA' : 'C/CABEZA',
        Talla: selectedTalla.talla,
        Tallaid: String(formData.talla),
        Lote: `${formData.lote}-${cicloDisplay}`,
        Empaque: fechaFormateada,
        DiaJuliano: formData.diaJuliano,
        LoteId: formData.lote,
        CicloId: formData.cicloid,
        C_Antes_De: fechaCaduca.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        Peso: formData.presentacionKgs,
        Hora: formData.horaEmpaque,
        Camarones: parseFloat(formData.camarones) > 0 ? formData.camarones : null,
        Uniformidad: parseFloat(formData.uniformidad).toFixed(2),
        Metabisulfito: formData.metabisulfato ? 'SÍ' : 'NO',
        Bodega: bodegas.find(b => b.bodegaid === formData.bodega)?.bodega || '',
        Posicion: formData.posicion,
        Tarima: formData.tarima || 'N/A',
        LeyendaAlergias: leyendaAlergias,
        LeyendaAlimentaria: leyendaAlimentaria,
        Barras: codigo.barcode,
        QRContent: codigo.qrContent,
      };
    });

    const payload = {
      Etiquetas: jsonEtiquetas,
      configuracion: { impresora: formData.zDesigner },
    };

    try {
      const response = await createEtiquetas(payload);
      console.log('Server response:', response);
      // Update state with server data
      setDetalleEtiquetas(response.detalleEtiquetas || []);
      setImpresos(response.barcodes || []);
      if (response.warning) {
        toast.warn(`${response.message} Advertencia: ${response.warning}`);
      } else {
        toast.success(`Se imprimirán ${formData.numeroCartones} etiquetas, para un total de ${formData.numeroCartones} cartones.`);
      }

      // Clear form to prevent duplicate submissions
      setFormData({
        fechaEmpaque: new Date().toISOString().split('T')[0],
        diaJuliano: '',
        lote: formData.lote,
        cicloid: formData.cicloid,
        granja: 0,
        talla: 0,
        camarones: '',
        presentacionKgs: '',
        presentacionLbs: '',
        producto: 'S/CABEZA',
        uniformidad: '',
        metabisulfato: true,
        horaEmpaque: '',
        nombrePlanta: 'PLANTA LAS AGUILAS',
        zDesigner: 'PDF',
        numeroCartones: 1,
        bodega: 0,
        bahia: '',
        seccion: '',
        fondo: '',
        piso: '',
        posicion: '',
        tarima: '',
      });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
      // 🔹 Oculta el error después de 4 segundos
      setTimeout(() => setError(null), 4000);
    }
  };

  const handleDelete = async () => {
    const { lote, cicloid, talla, producto, kilos, cantidadEliminar, motivo } = deleteForm;

    // 1. Input Validation
    if (!lote || !cicloid || !talla || !producto || kilos <= 0 || cantidadEliminar <= 0 || !motivo) {
      toast.error('Por favor, complete todos los campos del formulario de eliminación.');
      return;
    }

    // 2. Talla Validation
    const selectedTalla = tallas.find(t => t.talla === talla);
    if (!selectedTalla) {
      toast.error('La talla seleccionada no es válida.');
      return;
    }

    // 3. Find Matching Etiquetas
    const matchingEntries = detalleEtiquetas.filter(
      detalle =>
        Number(detalle.slote) === Number(lote) &&
        Number(detalle.cicloid) === Number(cicloid) &&
        Number(detalle.tallaid) === Number(selectedTalla.tallaid) &&
        detalle.producto === producto &&
        Number(detalle.kgs) === Number(kilos) &&
        Number(detalle.diajuliano) === Number(formData.diaJuliano)
    );
    const totalAvailableCartons = matchingEntries.reduce((sum, entry) => sum + entry.cartones, 0);
    console.log('Matching entries:', matchingEntries, 'Total cartons:', totalAvailableCartons);

    if (totalAvailableCartons < cantidadEliminar) {
      toast.error(`No hay suficientes cartones para eliminar. Disponibles: ${totalAvailableCartons}`);
      return;
    }

    // 4. Generate Barcode Prefix
    const idGranja = String(formData.granja).padStart(3, '0');
    const idTalla = String(selectedTalla.tallaid).padStart(2, '0');
    const kilosFormateados = String(parseInt(kilos.toString(), 10)).padStart(3, '0');
    const idProducto = producto === 'S/CABEZA' ? '01' : '02';
    const ciclo = ciclos.find(c => c.cicloid === cicloid);
    const año = ciclo ? ciclo.año : '';
    const prefix = `${lote.padStart(4, '0')}${idGranja}${idTalla}${formData.diaJuliano}${año}${kilosFormateados}${idProducto}`;
    console.log('Barcode prefix:', prefix);

    // 5. Identify Barcodes to Delete
    const matchingBarcodes = impresos
      .filter(barcode => barcode.startsWith(prefix))
      .map(barcode => ({ barcode, folio: parseInt(barcode.slice(-4)) }))
      .sort((a, b) => b.folio - a.folio);
    if (matchingBarcodes.length < cantidadEliminar) {
      toast.error(`No hay suficientes códigos de barras para eliminar. Disponibles: ${matchingBarcodes.length}`);
      return;
    }
    const deletedBarcodes = matchingBarcodes.slice(0, cantidadEliminar).map(b => b.barcode);
    console.log('Deleted barcodes:', deletedBarcodes);

    // 6. Call Backend to Persist Deletion
    try {
      if (!token || !user?.id) {
        toast.error('No estás autenticado. Por favor, inicia sesión.');
        navigate('/login');
        return;
      }
      const failedBarcodes: string[] = [];
      for (const barcode of deletedBarcodes) {
        try {
          await deleteCajaPorBarcode(barcode, motivo, user.id);
        } catch (error: any) {
          if (error.response?.status === 404) {
            failedBarcodes.push(barcode);
          } else {
            throw error; // Rethrow other errors
          }
        }
      }
      if (failedBarcodes.length > 0) {
        toast.warn(`No se pudieron eliminar ${failedBarcodes.length} cajas (no encontradas o ya eliminadas).`);
      }
      toast.success(`Se eliminaron ${deletedBarcodes.length - failedBarcodes.length} etiquetas en el servidor.`);

      // Refresh data from server
      try {
        const [detalleEtiquetasData, barcodesData] = await Promise.all([
          getDetalleEtiquetas(formData.cicloid, formData.lote),
          getBarcodes(formData.cicloid, formData.lote),
        ]);
        console.log('Refreshed detalleEtiquetas after delete:', detalleEtiquetasData);
        console.log('Refreshed barcodes after delete:', barcodesData);
        setDetalleEtiquetas(detalleEtiquetasData);
        setImpresos(barcodesData);
      } catch (err: any) {
        console.error('Error refreshing data:', err);
        toast.error('Error al actualizar datos después de la eliminación.');
      }

      setShowDeleteModal(false);
      setDeleteForm({
        lote: '',
        cicloid: ciclos[ciclos.length - 1]?.cicloid || 0,
        granja: '',
        talla: '',
        producto: '',
        kilos: 20,
        cantidadEliminar: 0,
        motivo: '',
      });
    } catch (error: any) {
      console.error('Error deleting etiquetas:', error);
      if (error.response?.status === 401) {
        logout();
        toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        navigate('/login');
      } else {
        toast.error('Error al eliminar etiquetas en el servidor: ' + error.message);
      }
    }
  };

  const totalPorLoteTallaProducto = detalleEtiquetas.reduce(
    (acc, detalle) => {
      const ciclo = ciclos.find(c => c.cicloid === detalle.cicloid);
      const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';
      const key = `${detalle.fecha}-${detalle.slote}-${detalle.cicloid}-${detalle.talla}-${detalle.producto}`;
      if (!acc[key]) {
        acc[key] = {
          fecha: detalle.fecha,
          lote: detalle.slote,
          cicloid: detalle.cicloid,
          cicloDisplay,
          talla: detalle.talla,
          producto: detalle.producto,
          cartones: 0,
          kgs: detalle.kgs,
        };
      }
      acc[key].cartones += detalle.cartones;
      return acc;
    },
    {} as Record<string, { fecha: string; lote: string; cicloid: number; cicloDisplay: string; talla: string; producto: string; cartones: number; kgs: number }>
  );

  const registros = Object.values(totalPorLoteTallaProducto);
  const totalCartones = registros.reduce((sum, registro) => sum + registro.cartones, 0);
  const totalKgs = registros.reduce((sum, registro) => sum + registro.cartones * registro.kgs, 0);

  const uniqueLotes = Array.from(
    new Set(detalleEtiquetas.filter(d => d.cicloid === deleteForm.cicloid).map(d => d.slote))
  );
  const uniqueTallas = Array.from(
    new Set(
      detalleEtiquetas
        .filter(d => d.cicloid === deleteForm.cicloid)
        .map(d => d.tallaid)
        .map(tallaid => tallas.find(t => t.tallaid === tallaid)?.talla || '')
    )
  ).filter(talla => talla !== '');
  const uniqueProductos = Array.from(
    new Set(detalleEtiquetas.filter(d => d.cicloid === deleteForm.cicloid).map(d => d.producto))
  );

  const EtiquetaPrint = forwardRef<HTMLDivElement>((props, ref) => {
    const [year, month, day] = formData.fechaEmpaque.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    const fechaCaduca = new Date(fecha);
    fechaCaduca.setFullYear(fechaCaduca.getFullYear() + 2);
    const ciclo = ciclos.find(c => c.cicloid === formData.cicloid);
    const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';
    const selectedTalla = tallas.find(t => t.tallaid === formData.talla);

    if (!codigos[0] || !selectedTalla) {
      return null;
    }

    return (
      <div ref={ref} style={{ width: '300px', padding: '20px', border: '1px solid #000', fontSize: '12px' }}>
        <div><strong>Planta:</strong> {formData.nombrePlanta}</div>
        <div><strong>Ciclo:</strong> {cicloDisplay}</div>
        <div><strong>Bodega:</strong> {bodegas.find(b => b.bodegaid === formData.bodega)?.bodega || ''}</div>
        <div><strong>Posición:</strong> {formData.posicion}</div>
        <div><strong>Talla:</strong> {selectedTalla.talla}</div>
        <div><strong>Tipo Camarón:</strong> {formData.producto === 'S/CABEZA' ? 'S/CABEZA' : 'C/CABEZA'}</div>
        <div><strong>Granja:</strong> {granjas.find(g => g.granjaid === formData.granja)?.granja || ''}</div>
        <div><strong>Peso:</strong> {formData.presentacionKgs} kg</div>
        <div><strong>Empaque:</strong> {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
        <div><strong>C. Antes De:</strong> {fechaCaduca.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
        <div><strong>No Lote:</strong> {formData.lote}</div>
        <div><strong>Lote:</strong> {`Lote ${formData.lote}-${cicloDisplay}`}</div>
        <div><strong>Hora:</strong> {formData.horaEmpaque}</div>
        {formData.camarones && <div><strong>Camarones:</strong> {formData.camarones}</div>}
        <div><strong>Uniformidad:</strong> {parseFloat(formData.uniformidad).toFixed(2)}</div>
        <div><strong>Metabisulfito:</strong> {formData.metabisulfato ? 'SÍ' : 'NO'}</div>
        <div><strong>Barras:</strong> {codigos[0]?.barcode || ''}</div>
        <div><strong>Leyenda Alergias:</strong> Este producto puede causar alergias en personas suceptibles.</div>
        <div><strong>Leyenda Alimentaria:</strong> El consumo crudo o poco cocido puede incrementar el riesgo de adquirir una enfermedad alimentaria.</div>
        <div style={{ marginTop: '10px' }}>
          <Barcode value={codigos[0]?.barcode || ''} height={50} displayValue={true} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <QRCodeSVG value={codigos[0]?.qrContent || ''} size={50} level="M" />
        </div>
      </div>
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-100 min-h-screen overflow-y-auto p-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm text-center p-3">{error}</div>
      )}
      <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 border-b">
        <h2 className="text-lg font-medium text-gray-900">Generación de Etiquetas</h2>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setFormData({
              fechaEmpaque: new Date().toISOString().split('T')[0],
              diaJuliano: '',
              lote: '',
              cicloid: ciclos[ciclos.length - 1]?.cicloid || 0,
              granja: 0,
              talla: 0,
              camarones: '',
              presentacionKgs: '',
              presentacionLbs: '',
              producto: 'S/CABEZA',
              uniformidad: '',
              metabisulfato: true,
              horaEmpaque: '',
              nombrePlanta: 'PLANTA LAS AGUILAS',
              zDesigner: 'PDF',
              numeroCartones: 1,
              bodega: 0,
              bahia: '',
              seccion: '',
              fondo: '',
              piso: '',
              posicion: '',
              tarima: '',
            })}
            className="px-3 py-2 bg-green-500 text-white rounded flex items-center gap-1 text-sm hover:bg-green-600"
          >
            <Plus size={16} /> Nuevo
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-2 bg-red-600 text-white rounded flex items-center gap-1 text-sm hover:bg-red-700"
          >
            <Trash2 size={16} /> Eliminar
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-3 py-2 bg-gray-600 text-white rounded flex items-center gap-1 text-sm hover:bg-gray-700"
          >
            <ArrowLeft size={16} /> Volver
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Eliminar Etiquetas</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label>Ciclo</label>
                <select
                  value={deleteForm.cicloid}
                  onChange={e => handleDeleteFormChange('cicloid', Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {ciclos.map(ciclo => (
                    <option key={ciclo.cicloid} value={ciclo.cicloid}>{`${ciclo.año}-${ciclo.ciclo}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Lote</label>
                <select
                  value={deleteForm.lote}
                  onChange={e => handleDeleteFormChange('lote', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Seleccionar</option>
                  {uniqueLotes.map(lote => (
                    <option key={lote} value={lote}>{lote}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Talla</label>
                <select
                  value={deleteForm.talla}
                  onChange={e => handleDeleteFormChange('talla', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Seleccionar</option>
                  {uniqueTallas.map(talla => (
                    <option key={talla} value={talla}>{talla}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Producto</label>
                <select
                  value={deleteForm.producto}
                  onChange={e => handleDeleteFormChange('producto', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Seleccionar</option>
                  {uniqueProductos.map(producto => (
                    <option key={producto} value={producto}>
                      {producto === 'S/CABEZA' ? 'S/CABEZA' : 'C/CABEZA'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Kilos</label>
                <input
                  type="number"
                  value={deleteForm.kilos}
                  onChange={e => handleDeleteFormChange('kilos', parseInt(e.target.value) || 0)}
                  className="w-full border px-2 py-1 rounded"
                  min="0"
                />
              </div>
              <div>
                <label>Cantidad a Eliminar</label>
                <input
                  type="number"
                  value={deleteForm.cantidadEliminar}
                  onChange={e => handleDeleteFormChange('cantidadEliminar', parseInt(e.target.value) || 0)}
                  className="w-full border px-2 py-1 rounded"
                  min="0"
                />
              </div>
              <div>
                <label>Motivo</label>
                <input
                  type="text"
                  value={deleteForm.motivo}
                  onChange={e => handleDeleteFormChange('motivo', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="font-bold text-blue-600 mb-2">Detalle Etiqueta</h3>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div>
                <label>Ciclo</label>
                <select
                  value={formData.cicloid}
                  onChange={e => handleInputChange('cicloid', Number(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {ciclos.map(ciclo => (
                    <option key={ciclo.cicloid} value={ciclo.cicloid}>{`${ciclo.año}-${ciclo.ciclo}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Fecha (Empaque)</label>
                <input
                  type="date"
                  value={formData.fechaEmpaque}
                  onChange={e => handleInputChange('fechaEmpaque', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label>Día Juliano</label>
                <input
                  type="text"
                  value={formData.diaJuliano}
                  readOnly
                  className="w-full border px-2 py-1 rounded bg-gray-100"
                />
              </div>
              <div>
                <label>Lote</label>
                <input
                  type="text"
                  value={formData.lote}
                  onChange={e => handleInputChange('lote', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm mt-3">
              <div>
                <label>Granja</label>
                <select
                  value={formData.granja}
                  onChange={e => handleInputChange('granja', parseInt(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                  disabled={availableGranjas.length === 0}
                >
                  <option value={0}>Seleccionar</option>
                  {availableGranjas.map(g => (
                    <option key={g.granjaid} value={g.granjaid}>{g.granja}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Talla</label>
                <select
                  value={formData.talla}
                  onChange={e => handleInputChange('talla', parseInt(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {tallas.map(t => (
                    <option key={t.tallaid} value={t.tallaid}>{t.talla}</option>
                  ))}
                </select>
              </div>
              <div>
                <label># Camarones</label>
                <input
                  type="number"
                  value={formData.camarones}
                  onChange={e => handleInputChange('camarones', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label>Uniformidad</label>
                <input
                  type="number"
                  value={formData.uniformidad}
                  onChange={e => handleInputChange('uniformidad', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  step="0.01"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <label>Presentación (Kgs)</label>
                <input
                  type="number"
                  value={formData.presentacionKgs}
                  onChange={e => handleInputChange('presentacionKgs', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  step="0.001"
                />
              </div>
              <div>
                <label>Presentación (Lbs)</label>
                <input
                  type="number"
                  value={formData.presentacionLbs}
                  onChange={e => handleInputChange('presentacionLbs', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  step="0.001"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <label>Producto</label>
                <select
                  value={formData.producto}
                  onChange={e => handleInputChange('producto', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="S/CABEZA">S/CABEZA</option>
                  <option value="C/CABEZA">C/CABEZA</option>
                </select>
              </div>
              <div>
                <label>Hora Empaque</label>
                <input
                  type="time"
                  value={formData.horaEmpaque}
                  onChange={e => handleInputChange('horaEmpaque', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <input
                type="checkbox"
                checked={formData.metabisulfato}
                onChange={e => handleInputChange('metabisulfato', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Metabisulfato</span>
            </div>
            <div className="grid grid-cols-5 gap-3 text-sm mt-3">
              <div>
                <label>Bodega</label>
                <select
                  value={formData.bodega}
                  onChange={e => handleInputChange('bodega', parseInt(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {bodegas.map(b => (
                    <option key={b.bodegaid} value={b.bodegaid}>{b.bodega}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Bahía</label>
                <select
                  value={formData.bahia}
                  onChange={e => handleInputChange('bahia', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {bahias.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Sección</label>
                <select
                  value={formData.seccion}
                  onChange={e => handleInputChange('seccion', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {secciones.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Fondo</label>
                <select
                  value={formData.fondo}
                  onChange={e => handleInputChange('fondo', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {fondos.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Piso</label>
                <select
                  value={formData.piso}
                  onChange={e => handleInputChange('piso', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {pisos.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <label>Posición</label>
                <input
                  type="text"
                  value={formData.posicion}
                  readOnly
                  className="w-full border px-2 py-1 rounded bg-gray-100"
                />
              </div>
              <div>
                <label>Tarima</label>
                <input
                  type="text"
                  value={formData.tarima}
                  onChange={e => handleInputChange('tarima', e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow border max-h-[400px] overflow-y-auto mt-4">
            <h2 className="text-lg font-semibold">Vista previa</h2>
            <div className="space-y-6">

              {codigos.map(c => c.barcode).join(", ")}
              {/*{codigos.length > 0 ? (
                codigos.map((codigo, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-2">
                    <p className="font-mono">{codigo.barcode}</p>
                    <Barcode value={codigo.barcode} height={60} displayValue={true} />
                    <QRCodeSVG value={codigo.qrContent} size={120} level="M" />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600">No hay códigos de barras para mostrar.</p>
              )}*/}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded shadow border">
            <div className="bg-blue-100 p-2 font-bold text-sm text-gray-700">Registro:</div>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-7 text-center p-2 font-bold">
                <span>Fecha</span>
                <span>Lote</span>
                <span>Ciclo</span>
                <span>Talla</span>
                <span>Cartones</span>
                <span>(Kgs)</span>
                <span>Producto</span>
              </div>
              {registros.length > 0 ? (
                registros.map((registro, idx) => (
                  <div key={idx} className="grid grid-cols-7 text-center p-2">
                    <span>{registro.fecha}</span>
                    <span>{registro.lote}</span>
                    <span>{registro.cicloDisplay}</span>
                    <span>{registro.talla}</span>
                    <span>{registro.cartones}</span>
                    <span>{registro.kgs}</span>
                    <span>{registro.producto === 'S/CABEZA' ? 'S/CABEZA' : 'C/CABEZA'}</span>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center">No hay registros disponibles</div>
              )}
              <div className="grid grid-cols-7 text-center p-2 font-bold">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span>Total Cartones: {totalCartones}</span>
                <span>Total Kgs: {totalKgs.toFixed(2)}</span>
                <span></span>
              </div>
            </div>
          </div>
          <div className="bg-yellow-100 p-4 rounded shadow border text-sm">
            <h4 className="font-bold">Configuración de Etiquetas</h4>
            <div className="mt-2">
              <label>Nombre Planta</label>
              <input
                type="text"
                value={formData.nombrePlanta}
                onChange={e => handleInputChange('nombrePlanta', e.target.value)}
                className="w-full border px-2 py-1 rounded mt-1"
              />
            </div>
            <div className="mt-2">
              <label>Impresora</label>
              <input
                type="text"
                value={formData.zDesigner}
                onChange={e => handleInputChange('zDesigner', e.target.value)}
                className="w-full border px-2 py-1 rounded mt-1"
              />
            </div>
            <div className="mt-2">
              <label>Número de Etiquetas/Cartones</label>
              <input
                type="number"
                value={formData.numeroCartones}
                onChange={e => handleInputChange('numeroCartones', parseInt(e.target.value))}
                className="w-full border px-2 py-1 rounded mt-1"
                min="1"
              />
            </div>
          </div>
          <div className="bg-yellow-200 p-3 text-center font-bold text-green-600 rounded shadow">
            Se Imprimirán {formData.numeroCartones} Etiquetas, para un Total de {formData.numeroCartones} Cartones.
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700"
            >
              <Printer size={18} /> Imprimir
            </button>
            <button
              onClick={() => {
                setFormData({
                  fechaEmpaque: new Date().toISOString().split('T')[0],
                  diaJuliano: '',
                  lote: '',
                  cicloid: ciclos[ciclos.length - 1]?.cicloid || 0,
                  granja: 0,
                  talla: 0,
                  camarones: '',
                  presentacionKgs: '',
                  presentacionLbs: '',
                  producto: 'S/CABEZA',
                  uniformidad: '',
                  metabisulfato: true,
                  horaEmpaque: '',
                  nombrePlanta: 'PLANTA LAS AGUILAS',
                  zDesigner: 'PDF',
                  numeroCartones: 1,
                  bodega: 0,
                  bahia: '',
                  seccion: '',
                  fondo: '',
                  piso: '',
                  posicion: '',
                  tarima: '',
                });
                setError(null);
                setDetalleEtiquetas([]);
                setImpresos([]);
              }}
              className="px-6 py-2 bg-green-600 text-white rounded flex items-center gap-2 hover:bg-green-700"
            >
              <RefreshCw size={18} /> Refrescar
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded flex items-center gap-2 hover:bg-gray-700"
            >
              <ArrowLeft size={18} /> Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneracionEtiquetas;