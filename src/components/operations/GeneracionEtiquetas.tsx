import React, { useState, useEffect } from "react";
import axios from "axios";
import { Printer, RefreshCw, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
//import ReactToPrint from "react-to-print";
import { toast } from "react-toastify";
import { useAuth } from '../../context/AuthContext';

// Define interfaces for TypeScript
interface Ciclo {
  cicloid: number;
  año: string; // e.g., '2025'
  ciclo: string; // e.g., '1'
  status: string; // e.g., 'A'
}

interface Bodega {
  bodegaid: number;
  bodega: string; // e.g., 'Casa blanca s'
  lugar: string; // e.g., 'Casa blanca'
  foranea: string; // e.g., 'N'
  estatus: string; // e.g., 'A'
}

interface Ubicacion {
  ubicacionid: number;
  bodegaid: number;
  bahia: string;
  seccion: string;
  piso: string;
  fondo: string;
  codigoubicacion: string; // e.g., '1-1A1'
  qrubicacion: string;
  tarimaid: number | null;
  estado: string; // e.g., 'vacío'
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
  granja: string; // e.g., 'DUBAI'
  propietarioid: number;
}

interface Talla {
  tallaid: number;
  talla: string; // e.g., 'U10'
}

interface FormData {
  fechaEmpaque: string;
  diaJuliano: string;
  lote: string;
  cicloid: number; // Added for cycle selection
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
  bodega: number; // New: Bodega ID
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
  diaJuliano: string;
  sLote: string;
  cicloid: number; // Added for cycle
  talla: string;
  cartones: number;
  kgs: number;
  producto: string;
  posicion: string;
}

interface DeleteForm {
  lote: string;
  cicloid: number; // Added for cycle
  talla: string;
  producto: string;
  cantidadEliminar: number;
  motivo: string;
}

// Opciones
const granjas = [
  { granjaid: 1, nombre: "AGUILAS" },
  { granjaid: 2, nombre: "SAN PEDRO" },
];

const tallas = [
  { tallaid: 1, talla: "41-50" },
  { tallaid: 2, talla: "51-60" },
  { tallaid: 3, talla: "61-70" },
];

const GeneracionEtiquetas: React.FC = () => {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [bodegas, setBodegas] = useState<Bodega[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [recepciones, setRecepciones] = useState<Recepcion[]>([]);
  const [granjas, setGranjas] = useState<Granja[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [availableGranjas, setAvailableGranjas] = useState<Granja[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fechaEmpaque: "2025-09-27",
    diaJuliano: "270",
    lote: "1",
    cicloid: 0, // Will be set to latest cycle
    granja: 0,
    talla: 0,
    camarones: "1.00",
    presentacionKgs: "20.000",
    presentacionLbs: "44.092",
    producto: "SIN_CABEZA",
    uniformidad: "0.000",
    metabisulfato: true,
    horaEmpaque: "12:30",
    nombrePlanta: "PLANTA LAS AGUILAS",
    zDesigner: "ZDesigner ZD220-203dpi ZPL",
    numeroCartones: 1,
    bodega: 0, // Initialize as unselected
    bahia: "",
    seccion: "",
    fondo: "",
    piso: "",
    posicion: "",
    tarima: "",
  });

const [detalleEtiquetas, setDetalleEtiquetas] = useState<DetalleEtiqueta[]>([
    { id: 1, fecha: "27/09/2025", diaJuliano: "270", sLote: "1", cicloid: 1, talla: "41-50", cartones: 5, kgs: 20, producto: "SIN_CABEZA", posicion: "1-1A1" },
    { id: 2, fecha: "27/09/2025", diaJuliano: "270", sLote: "1", cicloid: 1, talla: "51-60", cartones: 8, kgs: 20, producto: "SIN_CABEZA", posicion: "1-2B1" },
  ]);

  const [impresos, setImpresos] = useState<string[]>([
    "0001001012702025020010001",
    "0001001012702025020010002",
    "0001001012702025020010003",
    "0001001012702025020010004",
    "0001001012702025020010005",
    "0001001022702025020010001",
    "0001001022702025020010002",
    "0001001022702025020010003",
    "0001001022702025020010004",
    "0001001022702025020010005",
    "0001001022702025020010006",
    "0001001022702025020010007",
    "0001001022702025020010008",
  ]);

  const [eliminados, setEliminados] = useState<string[]>([
    "0001001012702025020020001",
    "0001001012702025020020002",
  ]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteForm, setDeleteForm] = useState<DeleteForm>({
    lote: "",
    cicloid: 0, // Will be set to latest cycle
    talla: "",
    producto: "",
    cantidadEliminar: 0,
    motivo: "",
  });

  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ciclos
        const ciclosResponse = await axios.get('http://localhost:3000/api/ciclos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const activeCiclos = ciclosResponse.data
          .filter((c: Ciclo) => c.status === 'A' && c.cicloid != null && !isNaN(Number(c.cicloid)))
          .map((c: Ciclo) => ({
            ...c,
            cicloid: Number(c.cicloid),
          }));
        console.log("Ciclos obtenidos:", activeCiclos); // Depuración
        setCiclos(activeCiclos);

        // Fetch bodegas
        const bodegasResponse = await axios.get('http://localhost:3000/api/bodegas', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Bodegas obtenidas:", bodegasResponse.data); // Depuración
        setBodegas(bodegasResponse.data);

        // Fetch ubicaciones (only estado = 'vacío')
        const ubicacionesResponse = await axios.get('http://localhost:3000/api/ubicaciones', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Ubicaciones obtenidas:", ubicacionesResponse.data); // Depuración
        setUbicaciones(ubicacionesResponse.data);

        // Fetch granjas
        const granjasResponse = await axios.get('http://localhost:3000/api/granjas', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const validGranjas = granjasResponse.data
          .filter((g: Granja) => g.granjaid != null && !isNaN(Number(g.granjaid)))
          .map((g: Granja) => ({
            ...g,
            granjaid: Number(g.granjaid),
          }));
        console.log("Granjas obtenidas:", validGranjas);
        setGranjas(validGranjas);
        setAvailableGranjas(validGranjas); // Inicializar availableGranjas

        // Fetch tallas
        const tallasResponse = await axios.get('http://localhost:3000/api/tallas/active', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const validTallas = tallasResponse.data
          .filter((t: Talla) => t.tallaid != null && !isNaN(Number(t.tallaid)))
          .map((t: Talla) => ({
            ...t,
            tallaid: Number(t.tallaid),
          }));
        console.log("Tallas obtenidas:", validTallas);
        setTallas(validTallas);

        // Set default to latest cycle
        if (activeCiclos.length > 0 && formData.cicloid === 0) {
          const latestCiclo = activeCiclos.reduce(
            (latest: Ciclo, ciclo: Ciclo) => 
              ciclo.cicloid > latest.cicloid ? ciclo : latest, 
              activeCiclos[0]
          );
          console.log("Ciclo inicial seleccionado:", latestCiclo);
          setFormData((prev) => ({ ...prev, cicloid: latestCiclo.cicloid }));
          setDeleteForm((prev) => ({ ...prev, cicloid: latestCiclo.cicloid }));
        } else if (activeCiclos.length === 0) {
          console.warn("No se encontraron ciclos válidos");
          setError("No hay ciclos disponibles. Por favor, verifica el servidor.");
        }
      } catch (err) {
        setError('Error al obtener datos del servidor');
        toast.error('Error al obtener datos del servidor');
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  // Fetch recepciones cuando cambian cicloid y lote
  useEffect(() => {
    const fetchRecepciones = async () => {
      if (formData.cicloid !== 0 && formData.lote !== "") {
        try {
          const reciboResponse = await axios.get(
            `http://localhost:3000/api/recepcion/g/${formData.cicloid}/${formData.lote}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Recepciones obtenidas:", reciboResponse.data);
          const validRecepciones = reciboResponse.data.filter(
            (r: Recepcion) => r.status === 'A' && r.granjaid != null && !isNaN(Number(r.granjaid))
          );
          setRecepciones(validRecepciones);

          // Filtrar granjas según granjaid de las recepciones
          const granjaIds = Array.from(new Set(validRecepciones.map((r: Recepcion) => Number(r.granjaid))));
          const filteredGranjas = granjas.filter((g) => granjaIds.includes(g.granjaid));
          console.log("Granjas disponibles filtradas:", filteredGranjas);
          setAvailableGranjas(filteredGranjas.length > 0 ? filteredGranjas : granjas);

          // Actualizar formData.granja si no es válida
          if (filteredGranjas.length > 0 && !filteredGranjas.some((g) => g.granjaid === formData.granja)) {
            setFormData((prev) => ({ ...prev, granja: filteredGranjas[0].granjaid }));
          } else if (filteredGranjas.length === 0) {
            toast.warn("No hay granjas disponibles para el ciclo y lote seleccionados.");
            setFormData((prev) => ({ ...prev, granja: 0 }));
          }
        } catch (err) {
          console.error("Error al obtener recepciones:", err);
          setError("Error al obtener recepciones. Mostrando todas las granjas.");
          setAvailableGranjas(granjas); // Fallback a todas las granjas
          setFormData((prev) => ({ ...prev, granja: 0 }));
          toast.error("Error al obtener recepciones del servidor.");
        }
      } else {
        // Si no hay ciclo o lote, usar todas las granjas
        setAvailableGranjas(granjas);
        setRecepciones([]);
      }
    };
    fetchRecepciones();
  }, [formData.cicloid, formData.lote, granjas, token]);

    // Actualizar día Juliano cuando cambia la fecha
  useEffect(() => {
    if (formData.fechaEmpaque) {
      const [year, month, day] = formData.fechaEmpaque.split("-").map(Number);
      const date = new Date(year, month - 1, day); 
      const startOfYear = new Date(year, 0, 1);
      const diff = date.getTime() - startOfYear.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const diaJuliano = Math.floor(diff / oneDay) + 1;
      setFormData((prev) => ({
        ...prev,
        diaJuliano: String(diaJuliano).padStart(3, "0"),
      }));
    }
  }, [formData.fechaEmpaque]);

  // Actualizar posición cuando cambian bahia, seccion, fondo o piso
  useEffect(() => {
    if (formData.bodega && formData.bahia && formData.seccion && formData.fondo && formData.piso) {
      const posicion = `${formData.bahia}-${formData.seccion}${formData.fondo}${formData.piso}`;
      const isValid = ubicaciones.some(
        (u) => u.bodegaid === formData.bodega && u.codigoubicacion === posicion && u.estado === "vacío"
      );
      setFormData((prev) => ({
        ...prev,
        posicion: isValid ? posicion : "",
      }));
      if (!isValid && formData.bahia && formData.seccion && formData.fondo && formData.piso) {
        toast.error("La posición seleccionada no es válida o no está disponible (no está vacía).");
      }
    } else {
      setFormData((prev) => ({ ...prev, posicion: "" }));
    }
  }, [formData.bodega, formData.bahia, formData.seccion, formData.fondo, formData.piso, ubicaciones]);

  // Obtener opciones válidas para bahia, seccion, fondo y piso según bodega
  const getBodegaOptions = () => {
    if (!formData.bodega) {
      return { bahias: [], secciones: [], fondos: [], pisos: [] };
    }
    const configs = ubicaciones.filter((u) => u.bodegaid === formData.bodega && u.estado === "vacío");
    const bahias = Array.from(new Set(configs.map((c) => c.bahia))).sort();
    //const secciones = Array.from(new Set(configs.map((c) => c.seccion))).sort();
    const secciones = Array.from(new Set(configs.map((c) => c.seccion))).sort();
    const fondos = Array.from(new Set(configs.map((c) => c.fondo))).sort();
    const pisos = Array.from(new Set(configs.map((c) => c.piso))).sort();
    return { bahias, secciones, fondos, pisos };
  };

  const { bahias, secciones, fondos, pisos } = getBodegaOptions();

  // Manejar cambios en inputs y sincronizar Kgs ↔ Lbs
  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
    console.log(`Cambiando ${field} a:`, value); // Depuración
    setFormData((prev) => {
      let updated = { ...prev, [field]: value };
      if (field === "presentacionKgs") {
        const kgs = parseFloat(String(value)) || 0;
        updated.presentacionLbs = (kgs * 2.20462).toFixed(3);
      }
      if (field === "presentacionLbs") {
        const lbs = parseFloat(String(value)) || 0;
        updated.presentacionKgs = (lbs / 2.20462).toFixed(3);
      }
      if (field === "numeroCartones") {
        updated.numeroCartones = parseInt(String(value)) || 0;
      }
      if (field === "bodega") {
        // Reset position fields when bodega changes
        updated.bahia = "";
        updated.seccion = "";
        updated.fondo = "";
        updated.piso = "";
        updated.posicion = "";
      }
      if (field === "cicloid") {
        const newValue = Number(value);
        if (isNaN(newValue) || newValue === 0) {
          console.warn("Valor de cicloid no válido:", value);
          toast.error("Por favor, seleccione un ciclo válido.");
          return prev; // No actualizar si el valor no es válido
        }
        updated.cicloid = newValue;
        updated.granja = 0; // Resetear granja al cambiar ciclo
      }
      if (field === "lote") {
        updated.granja = 0; // Resetear granja al cambiar lote
      }
      console.log("Nuevo estado formData:", updated); // Depuración
      return updated;
    });
  };

  // Manejar cambios en el formulario de eliminación
  const handleDeleteFormChange = (field: keyof DeleteForm, value: string | number) => {
    console.log(`Cambiando deleteForm.${field} a:`, value); // Depuración
    setDeleteForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "cicloid") {
        const newValue = Number(value);
        if (isNaN(newValue) || newValue === 0) {
          console.warn("Valor de cicloid no válido en deleteForm:", value);
          toast.error("Por favor, seleccione un ciclo válido.");
          return prev;
        }
        updated.cicloid = newValue;
      }
      console.log("Nuevo estado deleteForm:", updated); // Depuración
      return updated;
    });
 };

  // Obtener el próximo consecutivo para un lote, talla, producto, kgs y diaJuliano
  const getNextFolio = (lote: string, tallaId: number, producto: string, kgs: number, diaJuliano: string, cicloid: number): number => {
    const tallaNombre = tallas.find((t) => t.tallaid === tallaId)?.talla || "";
    const matchingEntries = detalleEtiquetas.filter(
      (detalle) =>
        detalle.sLote === lote &&
        detalle.cicloid === cicloid &&
        detalle.talla === tallaNombre &&
        detalle.producto === producto &&
        detalle.kgs === kgs &&
        detalle.diaJuliano === diaJuliano
    );
    const totalCartones = matchingEntries.reduce((sum, entry) => sum + entry.cartones, 0);
    const idGranja = String(formData.granja).padStart(3, "0");
    const idTalla = String(tallaId).padStart(2, "0");
    const kilosFormateados = String(parseInt(String(kgs), 10)).padStart(3, "0");
    const idProducto = producto === "SIN_CABEZA" ? "01" : "02";
    const ciclo = ciclos.find((c) => c.cicloid === cicloid);
    const año = ciclo ? ciclo.año : "2025"; // Fallback to current year
    const prefix = `${lote.padStart(4, "0")}${idGranja}${idTalla}${diaJuliano}${año}${kilosFormateados}${idProducto}`;
    const matchingBarcodes = impresos
      .filter((barcode) => barcode.startsWith(prefix))
      .map((barcode) => parseInt(barcode.slice(-4)))
      .sort((a, b) => b - a);
    const lastFolio = matchingBarcodes.length > 0 ? matchingBarcodes[0] : 0;
    return Math.max(totalCartones, lastFolio) + 1;
  };

  // Genera lista de códigos de barras para previsualizar
  const codigos = Array.from({ length: formData.numeroCartones }, (_, i) => {
    const idGranja = String(formData.granja).padStart(3, "0");
    const idTalla = String(formData.talla).padStart(2, "0");
    const startFolio = getNextFolio(
      formData.lote,
      formData.talla,
      formData.producto,
      parseFloat(formData.presentacionKgs),
      formData.diaJuliano,
      formData.cicloid
    );
    const numeroEtiqueta = String(startFolio + i).padStart(4, "0");
    const kilosFormateados = String(parseInt(formData.presentacionKgs, 10)).padStart(3, "0");
    const idProducto = formData.producto === "SIN_CABEZA" ? "01" : "02";
    const ciclo = ciclos.find((c) => c.cicloid === formData.cicloid);
    const año = ciclo ? ciclo.año : "2025"; // Fallback to current year
    const barcode = (
      formData.lote.padStart(4, "0") +
      idGranja +
      idTalla +
      formData.diaJuliano.padStart(3, "0") +
      año +
      kilosFormateados +
      idProducto +
      numeroEtiqueta
    );
    const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';
    const qrContent = `Planta: ${formData.nombrePlanta}, Granja: ${granjas.find(g => g.granjaid === formData.granja)?.nombre || ''}, Talla: ${tallas.find(t => t.tallaid === formData.talla)?.talla || ''}, Lote: ${formData.lote}, Ciclo: ${cicloDisplay}, Camarones: ${formData.camarones}, Pres.: ${formData.presentacionKgs}, DiaJuliano: ${formData.diaJuliano}, Producto: ${formData.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}, Uniformidad: ${parseFloat(formData.uniformidad).toFixed(2)}, Bodega: ${bodegas.find(b => b.id === formData.bodega)?.nombre || ''}, Posicion: ${formData.posicion}, Barras: ${barcode}`;
    //    const qrContent = `Planta: ${formData.nombrePlanta}, Granja: ${granjas.find(g => g.granjaid === formData.granja)?.nombre || ''}, Talla: ${tallas.find(t => t.tallaid === formData.talla)?.talla || ''}, Lote: ${formData.lote}, Ciclo: ${cicloDisplay}, Camarones: ${formData.camarones}, Pres.: ${formData.presentacionKgs}, DiaJuliano: ${formData.diaJuliano}, Producto: ${formData.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}, Uniformidad: ${parseFloat(formData.uniformidad).toFixed(2)}, Bodega: ${bodegas.find(b => b.bodegaid === formData.bodega)?.bodega || ''}, Posicion: ${formData.posicion}, Barras: ${barcode}`;
    return { barcode, qrContent };
  });

  const handlePrint = () => {
    if (formData.numeroCartones <= 0) {
      toast.error("Por favor, ingrese un número válido de etiquetas/cartones.");
      return;
    }
    
    if (!formData.fechaEmpaque || !formData.cicloid || !formData.granja || !formData.bodega || !formData.posicion || !formData.talla) {
      toast.error("Por favor, complete todos los campos requeridos: fecha, ciclo, granja, talla, bodega y posición.");
      return;
    }

    const [year, month, day] = formData.fechaEmpaque.split("-").map(Number);
    const fechaLocal = new Date(year, month - 1, day);

    const fechaFormateada = fechaLocal.toLocaleDateString("es-ES", {
      timeZone: "America/Mazatlan",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (fechaFormateada === "Invalid Date") {
      toast.error("La fecha de empaque no es válida.");
      return;
    }

    const ciclo = ciclos.find((c) => c.cicloid === formData.cicloid);
    const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';

    // Crear el array de JSON con los datos de las etiquetas
    const jsonEtiquetas = codigos.map((codigo) => {
      const fechaCaduca = new Date(fechaLocal);
      fechaCaduca.setFullYear(fechaCaduca.getFullYear() + 2);
      const leyendaAlergias = "Este producto puede causar alergias en personas suceptibles.";
      const leyendaAlimentaria = "El consumo crudo o poco cocido puede incrementar el riesgo de adquirir una enfermedad alimentaria.";

      return {
        Planta: formData.nombrePlanta,
        Granja: granjas.find(g => g.granjaid === formData.granja)?.granja || '',
        TipoCamarón: formData.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA",
        Talla: tallas.find(t => t.tallaid === formData.talla)?.talla || '',
        Lote: `${formData.lote}-${cicloDisplay}`,
        Empaque: fechaFormateada,
        C_Antes_De: fechaCaduca.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
        Peso: `${formData.presentacionKgs} kgs`,
        Hora: formData.horaEmpaque,
        Camarones: parseFloat(formData.camarones) > 0 ? formData.camarones : null,
        Uniformidad: parseFloat(formData.uniformidad).toFixed(2),
        Metabisulfito: formData.metabisulfato ? "SÍ" : "NO",
        Bodega: bodegas.find(b => b.bodegaid === formData.bodega)?.bodega || '',
        Posicion: formData.posicion,
        Barras: codigo.barcode,
        LeyendaAlergias: leyendaAlergias,
        LeyendaAlimentaria: leyendaAlimentaria,
        QRContent: codigo.qrContent,
      };
    });

    // Mostrar el JSON en la consola (puedes modificarlo para guardarlo o enviarlo a otro lugar)
    console.log("JSON de etiquetas:", JSON.stringify(jsonEtiquetas, null, 2));

    // Actualizar estados
    setImpresos((prev) => [...prev, ...codigos.map(c => c.barcode)]);
    const nuevaEntrada: DetalleEtiqueta = {
      id: detalleEtiquetas.length + 1,
      fecha: fechaFormateada,
      diaJuliano: formData.diaJuliano,
      sLote: formData.lote,
      cicloid: formData.cicloid,
      talla: tallas.find((t) => t.tallaid === formData.talla)?.talla || "",
      cartones: formData.numeroCartones,
      kgs: parseFloat(formData.presentacionKgs),
      producto: formData.producto,
      posicion: formData.posicion,
    };
    setDetalleEtiquetas((prev) => [...prev, nuevaEntrada]);
    toast.success(`Se imprimirán ${formData.numeroCartones} Etiquetas, para un Total de ${formData.numeroCartones} Cartones.`);
  };

  const handleDelete = () => {
    const { lote, cicloid, talla, producto, cantidadEliminar, motivo } = deleteForm;
    if (!lote || !cicloid || !talla || !producto || cantidadEliminar <= 0 || !motivo) {
      toast.error("Por favor, complete todos los campos del formulario de eliminación.");
      return;
    }

    // Encontrar entradas coincidentes usando diaJuliano
    const matchingEntries = detalleEtiquetas
      .filter(
        (detalle) =>
          detalle.sLote === lote &&
          detalle.cicloid === cicloid &&
          detalle.talla === talla &&
          detalle.producto === producto &&
          detalle.kgs === parseFloat(formData.presentacionKgs) &&
          detalle.diaJuliano === formData.diaJuliano
      )
      .sort((a, b) => b.id - a.id); // Ordenar por ID descendente
    const totalAvailableCartons = matchingEntries.reduce((sum, entry) => sum + entry.cartones, 0);

    if (totalAvailableCartons < cantidadEliminar) {
      toast.error(`No hay suficientes cartones para eliminar. Disponibles: ${totalAvailableCartons}`);
      return;
    }

    let remainingToDelete = cantidadEliminar;
    const newDetalleEtiquetas = [...detalleEtiquetas];
    const deletedBarcodes: string[] = [];

    // Generar prefijo de código de barras para eliminación
    const idGranja = String(formData.granja).padStart(3, "0");
    const idTalla = tallas.find((t) => t.talla === talla)?.tallaid.toString().padStart(2, "0") || "01";
    const kilosFormateados = String(parseInt(String(matchingEntries[0]?.kgs || 20), 10)).padStart(3, "0");
    const idProducto = producto === "SIN_CABEZA" ? "01" : "02";    
    const ciclo = ciclos.find((c) => c.cicloid === cicloid);
    const año = ciclo ? ciclo.año : "2025"; // Fallback to current year
    const prefix = `${lote.padStart(4, "0")}${idGranja}${idTalla}${formData.diaJuliano}${año}${kilosFormateados}${idProducto}`;

    const matchingBarcodes = impresos
      .filter((barcode) => barcode.startsWith(prefix))
      .map((barcode) => ({ barcode, folio: parseInt(barcode.slice(-4)) }))
      .sort((a, b) => b.folio - a.folio);
    // Verificar que haya suficientes códigos de barras para eliminar
    if (matchingBarcodes.length < cantidadEliminar) {
      toast.error(`No hay suficientes códigos de barras para eliminar. Disponibles: ${matchingBarcodes.length}`);
      return;
    }

    // Eliminar cartones y recolectar códigos de barras
    for (let i = 0; i < cantidadEliminar && i < matchingBarcodes.length; i++) {
      const { barcode } = matchingBarcodes[i];
      deletedBarcodes.push(barcode);
    }

    // Actualizar detalleEtiquetas
    for (let i = 0; i < matchingEntries.length && remainingToDelete > 0; i++) {
      const entry = matchingEntries[i];
      const entryIndex = newDetalleEtiquetas.findIndex((e) => e.id === entry.id);
      if (entryIndex === -1) {
        console.warn(`Entrada con ID ${entry.id} no encontrada en detalleEtiquetas`);
        continue;
      }
      if (newDetalleEtiquetas[entryIndex].cartones <= remainingToDelete) {
        // Eliminar la entrada completa si los cartones a eliminar son >= a los cartones de la entrada
        remainingToDelete -= newDetalleEtiquetas[entryIndex].cartones;
        newDetalleEtiquetas.splice(entryIndex, 1);
      } else {
        // Reducir los cartones de la entrada
        newDetalleEtiquetas[entryIndex].cartones -= remainingToDelete;
        remainingToDelete = 0;
      }
    }

    // Verificar si se eliminaron todos los cartones necesarios
    if (remainingToDelete > 0) {
      toast.error(`Error: No se pudieron eliminar todos los cartones solicitados. Faltan ${remainingToDelete} cartones.`);
      return;
    }

    // Actualizar estados
    setDetalleEtiquetas(newDetalleEtiquetas);
    setImpresos((prev) => prev.filter((barcode) => !deletedBarcodes.includes(barcode)));
    setEliminados((prev) => [...prev, ...deletedBarcodes]);
    setShowDeleteModal(false);
    setDeleteForm({ lote: "", cicloid: ciclos[ciclos.length - 1]?.cicloid || 0, talla: "", producto: "", cantidadEliminar: 0, motivo: "" });
    toast.success(`Se eliminaron ${cantidadEliminar} etiquetas. Motivo: ${motivo}`);
  };

  // Agregar cartones por fecha, sLote, cicloid, talla, producto y posición
  const totalPorLoteTallaProductoPosicion = detalleEtiquetas.reduce((acc, detalle) => {
    const ciclo = ciclos.find((c) => c.cicloid === detalle.cicloid);
    const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';
    const key = `${detalle.fecha}-${detalle.sLote}-${detalle.cicloid}-${detalle.talla}-${detalle.producto}-${detalle.posicion}`;
    if (!acc[key]) {
      acc[key] = {
        fecha: detalle.fecha,
        lote: detalle.sLote,
        cicloid: detalle.cicloid,
        cicloDisplay: cicloDisplay,
        talla: detalle.talla,
        producto: detalle.producto,
        posicion: detalle.posicion,
        cartones: 0,
        kgs: detalle.kgs,
      };
    }
    acc[key].cartones += detalle.cartones;
    return acc;
  }, {} as Record<string, { fecha: string; lote: string; cicloid: number; cicloDisplay: string; talla: string; producto: string; posicion: string; cartones: number; kgs: number }>);

  const registros = Object.values(totalPorLoteTallaProductoPosicion);
  const totalCartones = registros.reduce((sum, registro) => sum + registro.cartones, 0);
  const totalKgs = registros.reduce((sum, registro) => sum + registro.cartones * registro.kgs, 0);
  const uniqueLotes = Array.from(new Set(detalleEtiquetas
    .filter((d) => d.cicloid === deleteForm.cicloid)
    .map((d) => d.sLote)
  ));
  const uniqueTallas = Array.from(new Set(detalleEtiquetas
    .filter((d) => d.cicloid === deleteForm.cicloid)
    .map((d) => d.talla)
  ));
  const uniqueProductos = Array.from(new Set(detalleEtiquetas
    .filter((d) => d.cicloid === deleteForm.cicloid)
    .map((d) => d.producto)
  ));
  
  const EtiquetaPrint = React.forwardRef<HTMLDivElement>((props, ref) => {
    const [year, month, day] = formData.fechaEmpaque.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);
    const fechaCaduca = new Date(fecha);
    fechaCaduca.setFullYear(fechaCaduca.getFullYear() + 2);
    const mostrarCamarones = true;
    const leyendaAlergias = "Este producto puede causar alergias en personas suceptibles.";
    const leyendaAlimentaria = "El consumo crudo o poco cocido puede incrementar el riesgo de adquirir una enfermedad alimentaria.";
    const ciclo = ciclos.find(c => c.cicloid === formData.cicloid);
    const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';

    return (
      <div ref={ref} style={{ width: "300px", padding: "20px", border: "1px solid #000", fontSize: "12px" }}>
        <div><strong>Planta:</strong> {formData.nombrePlanta}</div>
        <div><strong>Ciclo:</strong> {cicloDisplay}</div>
        <div><strong>Bodega:</strong> {bodegas.find(b => b.bodegaid === formData.bodega)?.bodega || ''}</div>
        <div><strong>Posición:</strong> {formData.posicion}</div>
        <div><strong>Talla:</strong> {tallas.find(t => t.tallaid === formData.talla)?.talla || ''}</div>
        <div><strong>Tipo Camarón:</strong> {formData.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}</div>
        <div><strong>Granja:</strong> {granjas.find(g => g.granjaid === formData.granja)?.granja || ''}</div>
        <div><strong>Peso:</strong> {formData.presentacionKgs} kg</div>
        <div><strong>Empaque:</strong> {fecha.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
        <div><strong>C. Antes De:</strong> {fechaCaduca.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
        <div><strong>No Lote:</strong> {formData.lote}</div>
        <div><strong>Lote:</strong> {`Lote ${formData.lote}-${cicloDisplay}`}</div>
        <div><strong>Hora:</strong> {formData.horaEmpaque}</div>
        {mostrarCamarones && <div><strong>Camarones:</strong> {formData.camarones}</div>}
        <div><strong>Uniformidad:</strong> {parseFloat(formData.uniformidad).toFixed(2)}</div>
        <div><strong>Metabisulfito:</strong> {formData.metabisulfato ? "SI" : "NO"}</div>
        <div><strong>Barras:</strong> {codigos[0]?.barcode || ''}</div>
        <div><strong>Leyenda Alergias:</strong> {leyendaAlergias}</div>
        <div><strong>Leyenda Alimentaria:</strong> {leyendaAlimentaria}</div>
        <div style={{ marginTop: "10px" }}>
          <Barcode value={codigos[0]?.barcode || ''} height={50} displayValue={true} />
        </div>
        <div style={{ marginTop: "10px" }}>
          <QRCodeSVG value={codigos[0]?.qrContent || ''} size={50} level="M" />
        </div>
      </div>
    );
  });

  return (
    <div className="flex-1 bg-gray-100 min-h-screen overflow-y-auto p-4">
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</div>}
      <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 border-b">
        <button className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <Plus size={16} /> Nuevo
        </button>
        <button className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <Edit size={16} /> Modificar
        </button>
        <button onClick={handlePrint} className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <Printer size={16} /> Imprimir
        </button>
        <button className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <Printer size={16} /> Imprimir con Salidas
        </button>
        <button className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <RefreshCw size={16} /> Subir Nube
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm text-red-600"
        >
          <Trash2 size={16} /> Eliminar
        </button>
        <button className="ml-auto px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Salir
        </button>
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
                  onChange={(e) => {
                    console.log("Valor crudo de ciclo seleccionado en deleteForm:", e.target.value);
                    const value = Number(e.target.value);
                    console.log("Ciclo seleccionado en deleteForm:", value);
                    handleDeleteFormChange("cicloid", value);
                  }}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {ciclos.map((ciclo) => (
                    <option key={ciclo.cicloid} value={ciclo.cicloid}>{`${ciclo.año}-${ciclo.ciclo}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Lote</label>
                <select
                  value={deleteForm.lote}
                  onChange={(e) => handleDeleteFormChange("lote", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Seleccionar</option>
                  {uniqueLotes.map((lote) => (
                    <option key={lote} value={lote}>{lote}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Talla</label>
                <select
                  value={deleteForm.talla}
                  onChange={(e) => handleDeleteFormChange("talla", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Seleccionar</option>
                  {uniqueTallas.map((talla) => (
                    <option key={talla} value={talla}>{talla}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Producto</label>
                <select
                  value={deleteForm.producto}
                  onChange={(e) => handleDeleteFormChange("producto", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="">Seleccionar</option>
                  {uniqueProductos.map((producto) => (
                    <option key={producto} value={producto}>
                      {producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Cantidad a Eliminar</label>
                <input
                  type="number"
                  value={deleteForm.cantidadEliminar}
                  onChange={(e) => handleDeleteFormChange("cantidadEliminar", parseInt(e.target.value) || 0)}
                  className="w-full border px-2 py-1 rounded"
                  min="0"
                />
              </div>
              <div>
                <label>Motivo</label>
                <input
                  type="text"
                  value={deleteForm.motivo}
                  onChange={(e) => handleDeleteFormChange("motivo", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancelar
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">
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
                  onChange={(e) => {
                    console.log("Valor crudo de ciclo seleccionado:", e.target.value);
                    const value = Number(e.target.value);
                    console.log("Ciclo seleccionado:", value);
                    handleInputChange("cicloid", value);
                  }}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {ciclos.map((ciclo) => (
                    <option key={ciclo.cicloid} value={ciclo.cicloid}>{`${ciclo.año}-${ciclo.ciclo}`}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Fecha (Empaque)</label>
                <input
                  type="date"
                  value={formData.fechaEmpaque}
                  onChange={(e) => handleInputChange("fechaEmpaque", e.target.value)}
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
                  onChange={(e) => handleInputChange("lote", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-sm mt-3">
              <div>
                <label>Granja</label>
                <select
                  value={formData.granja}
                  onChange={(e) => handleInputChange("granja", parseInt(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                  disabled={availableGranjas.length === 0}
                >
                  <option value={0}>Seleccionar</option>
                  {availableGranjas.map((g) => (
                    <option key={g.granjaid} value={g.granjaid}>{g.granja}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Talla</label>
                <select
                  value={formData.talla}
                  onChange={(e) => handleInputChange("talla", parseInt(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {tallas.map((t) => (
                    <option key={t.tallaid} value={t.tallaid}>{t.talla}</option>
                  ))}
                </select>
              </div>
              <div>
                <label># Camarones</label>
                <input
                  type="number"
                  value={formData.camarones}
                  onChange={(e) => handleInputChange("camarones", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label>Uniformidad</label>
                <input
                  type="number"
                  value={formData.uniformidad}
                  onChange={(e) => handleInputChange("uniformidad", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mt-3">
              <div>
                <label>Presentación (Kgs)</label>
                <input
                  type="number"
                  value={parseFloat(formData.presentacionKgs)}
                  onChange={(e) => handleInputChange("presentacionKgs", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  step="0.001"
                />
              </div>
              <div>
                <label>Presentación (Lbs)</label>
                <input
                  type="number"
                  value={parseFloat(formData.presentacionLbs)}
                  onChange={(e) => handleInputChange("presentacionLbs", e.target.value)}
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
                  onChange={(e) => handleInputChange("producto", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value="SIN_CABEZA">S/CABEZA</option>
                  <option value="CON_CABEZA">C/CABEZA</option>
                </select>
              </div>
              <div>
                <label>Hora Empaque</label>
                <input
                  type="time"
                  value={formData.horaEmpaque}
                  onChange={(e) => handleInputChange("horaEmpaque", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <input
                type="checkbox"
                checked={formData.metabisulfato}
                onChange={(e) => handleInputChange("metabisulfato", e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Metabisulfato</span>
            </div>            
            <div className="grid grid-cols-5 gap-3 text-sm mt-3">
              <div>
                <label>Bodega</label>
                <select
                  value={formData.bodega}
                  onChange={(e) => handleInputChange("bodega", parseInt(e.target.value))}
                  className="w-full border px-2 py-1 rounded"
                >
                  <option value={0}>Seleccionar</option>
                  {bodegas.map((b) => (
                    <option key={b.bodegaid} value={b.bodegaid}>{b.bodega}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Bahía</label>
                <select
                  value={formData.bahia}
                  onChange={(e) => handleInputChange("bahia", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {bahias.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Sección</label>
                <select
                  value={formData.seccion}
                  onChange={(e) => handleInputChange("seccion", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {secciones.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Fondo</label>
                <select
                  value={formData.fondo}
                  onChange={(e) => handleInputChange("fondo", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {fondos.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Piso</label>
                <select
                  value={formData.piso}
                  onChange={(e) => handleInputChange("piso", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                  disabled={!formData.bodega}
                >
                  <option value="">Seleccionar</option>
                  {pisos.map((p) => (
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
                  onChange={(e) => handleInputChange("tarima", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow border max-h-[400px] overflow-y-auto mt-4">
            <h2 className="text-lg font-semibold">Vista previa</h2>
            <div className="space-y-6">
              {codigos.map(c => c.barcode).join(", ")}
               {/*{codigos.map((codigo, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-2">
                 <p className="font-mono">{codigo.barcode}</p>
                  <Barcode value={codigo.barcode} height={60} displayValue={true} />
                  <QRCodeSVG value={codigo.qrContent} size={120} level="M" />
                </div>
              ))}*/}
            </div>
          </div>
          {/*<div className="bg-white p-4 rounded shadow border max-h-[400px] overflow-y-auto mt-4">
            <h2 className="text-lg font-semibold">Vista Previa</h2>
            <div className="space-y-6">
              {codigos.map((codigo, idx) => {
                const ciclo = ciclos.find(c => c.cicloid === formData.cicloid);
                const cicloDisplay = ciclo ? `${ciclo.año}-${ciclo.ciclo}` : '';
                return (
                <div
                  key={idx}
                  style={{ width: "300px", padding: "20px", border: "1px solid #000", fontSize: "12px" }}
                >
                  <div><strong>{formData.nombrePlanta}</strong></div>
                  <div><strong>{cicloDisplay}</strong></div>
                  <div><strong>{bodegas.find(b => b.id === formData.bodega)?.nombre || ''}</strong></div>
                  <div><strong>{formData.posicion}</strong></div>
                  <div><strong>{tallas.find(t => t.tallaid === formData.talla)?.talla || ''}</strong></div>
                  <div><strong>{formData.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}</strong></div>
                  <div><strong>{granjas.find(g => g.granjaid === formData.granja)?.nombre || ''}</strong></div>
                  <div><strong>L {`${formData.lote}-${cicloDisplay}`}</strong></div>
                  <div><strong>Empaque:</strong> {new Date(formData.fechaEmpaque).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}</div>
                  <div>
                    <strong>C. Antes De:</strong> {new Date(new Date(formData.fechaEmpaque).setFullYear(new Date(formData.fechaEmpaque).getFullYear() + 2)).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </div>
                  <div><strong>Conserve -18 °C</strong></div>
                  <div><strong>Metabisulfito:</strong> {formData.metabisulfato ? "SI" : "NO"}</div>
                  <div><strong>Cont. Nto. {formData.presentacionKgs} kgs.</strong></div>
                  <div><strong>Hora:</strong> {formData.horaEmpaque}</div>
                  {parseFloat(formData.camarones) > 0 && <div><strong>Camarones:</strong> {formData.camarones}</div>}
                  <div><strong>Uniformidad:</strong> {parseFloat(formData.uniformidad).toFixed(2)}</div>
                  <div><strong>Barras:</strong> {codigo.barcode}</div>
                  <div><strong>Leyenda Alergias:</strong> Contiene alérgenos (crustáceos)</div>
                  <div><strong>Leyenda Alimentaria:</strong> Producto alimenticio</div>
                  <div style={{ marginTop: "10px" }}>
                    <Barcode value={codigo.barcode} height={50} displayValue={true} />
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <QRCodeSVG value={codigo.qrContent} size={100} level="M" />
                  </div>
                </div>
              ))}
            </div>
          </div>*/}
          {/*impresos.length > 0 && (
            <div className="bg-white p-4 rounded shadow border mt-4">
              <h2 className="text-lg font-semibold text-red-600">Últimos impresos</h2>
              <div className="space-y-6">
                {impresos.map((codigo, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <p className="font-mono">{codigo}</p>
                    <Barcode value={codigo} height={60} displayValue={true} />
                  </div>
                ))}
              </div>
            </div>
          )*/}
          {/*eliminados.length > 0 && (
            <div className="bg-white p-4 rounded shadow border mt-4">
              <h2 className="text-lg font-semibold text-red-600">Últimos eliminados</h2>
              <div className="space-y-6">
                {eliminados.map((codigo, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <p className="font-mono">{codigo}</p>
                    <Barcode value={codigo} height={60} displayValue={true} />
                  </div>
                ))}
              </div>
            </div>
          )*/}
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded shadow border">
            <div className="bg-blue-100 p-2 font-bold text-sm text-gray-700">Registro:</div>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-8 text-center p-2 font-bold">
                <span>Fecha</span>
                <span>Lote</span>
                <span>Ciclo</span>
                <span>Talla</span>
                <span>Cartones</span>
                <span>(Kgs)</span>
                <span>Producto</span>
                <span>Posición</span>
              </div>
              {registros.map((registro, idx) => (
                <div key={idx} className="grid grid-cols-8 text-center p-2">
                  <span>{registro.fecha}</span>
                  <span>{registro.lote}</span>
                  <span>{registro.cicloDisplay}</span>
                  <span>{registro.talla}</span>
                  <span>{registro.cartones}</span>
                  <span>{registro.kgs}</span>
                  <span>{registro.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}</span>
                  <span>{registro.posicion}</span>
                </div>
              ))}
              <div className="grid grid-cols-8 text-center p-2 font-bold">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span>Total Cartones: {totalCartones}</span>
                <span>Total Kgs: {totalKgs}</span>
                <span></span>
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
                onChange={(e) => handleInputChange("nombrePlanta", e.target.value)}
                className="w-full border px-2 py-1 rounded mt-1"
              />
            </div>
            <div className="mt-2">
              <label>Impresora</label>
              <input
                type="text"
                value={formData.zDesigner}
                onChange={(e) => handleInputChange("zDesigner", e.target.value)}
                className="w-full border px-2 py-1 rounded mt-1"
              />
            </div>
            <div className="mt-2">
              <label>Número de Etiquetas/Cartones</label>
              <input
                type="number"
                value={formData.numeroCartones}
                onChange={(e) => handleInputChange("numeroCartones", parseInt(e.target.value))}
                className="w-full border px-2 py-1 rounded mt-1"
              />
            </div>
          </div>
          <div className="bg-yellow-200 p-3 text-center font-bold text-green-600 rounded shadow">
            Se Imprimirán {formData.numeroCartones} Etiquetas, para un Total de {formData.numeroCartones} Cartones.
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={handlePrint} className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2">
              <Printer size={18} /> Imprimir
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded flex items-center gap-2">
              <RefreshCw size={18} /> Refrescar
            </button>
            <button className="px-6 py-2 bg-gray-600 text-white rounded flex items-center gap-2">
              <ArrowLeft size={18} /> Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneracionEtiquetas;