import React, { useState, useEffect } from "react";
import { Printer, RefreshCw, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Barcode from "react-barcode";

// Define interfaces for TypeScript
interface FormData {
  fechaEmpaque: string;
  diaJuliano: string;
  lote: string;
  sublote: string;
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
  bahia: string;
  seccion: string;
  fondo: string;
  piso: string;
  posicion: string;
}

interface DetalleEtiqueta {
  id: number;
  fecha: string;
  sLote: string;
  talla: string;
  cartones: number;
  kgs: number;
  producto: string;
  posicion: string;
}

interface DeleteForm {
  lote: string;
  talla: string;
  producto: string;
  cantidadEliminar: number;
  motivo: string;
}

// Opciones
const granjas = [
  { id: 69, nombre: "AGUILAS" }, // Updated IdGranja to 069
  { id: 2, nombre: "SAN PEDRO" },
];

const tallas = [
  { id: 1, rango: "41-50" },
  { id: 2, rango: "51-60" },
  { id: 3, rango: "61-70" },
];

const bahias = Array.from({ length: 10 }, (_, i) => String(i + 1));
const secciones = Array.from({ length: 5 }, (_, i) => String(i + 1));
const fondos = ["A", "B", "C"];
const pisos = ["1", "2", "3"];

const GeneracionEtiquetas: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fechaEmpaque: "2025-09-20",
    diaJuliano: "263",
    lote: "1",
    sublote: "1",
    granja: 69, // Updated to match IdGranja 069
    talla: 2, // Set to 51-60 for testing
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
    bahia: "1",
    seccion: "1",
    fondo: "A",
    piso: "1",
    posicion: "1-1A1",
  });

  const [detalleEtiquetas, setDetalleEtiquetas] = useState<DetalleEtiqueta[]>([
    { id: 1, fecha: "20/09/2025", sLote: "1", talla: "41-50", cartones: 5, kgs: 20, producto: "SIN_CABEZA", posicion: "1-1A1" },
    { id: 2, fecha: "20/09/2025", sLote: "1", talla: "41-50", cartones: 2, kgs: 20, producto: "CON_CABEZA", posicion: "1-1A1" },
    { id: 3, fecha: "20/09/2025", sLote: "1", talla: "51-60", cartones: 8, kgs: 20, producto: "SIN_CABEZA", posicion: "1-2B1" },
  ]);

  const [impresos, setImpresos] = useState<string[]>([
    "0001009012622025020010001", // Updated IdGranja to 069
    "0001009012622025020010002",
    "0001009012622025020010003",
    "0001009012622025020010004",
    "0001009012622025020010005",
    "0001009012622025020020001",
    "0001009012622025020020002",
    "0001009012622025020010001",
    "0001009012622025020010002",
    "0001009012622025020010003",
    "0001009012622025020010004",
    "0001009012622025020010005",
    "0001009012622025020010006",
    "0001009012622025020010007",
    "0001009012622025020010008",
  ]);

  const [eliminados, setEliminados] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteForm, setDeleteForm] = useState<DeleteForm>({
    lote: "",
    talla: "",
    producto: "",
    cantidadEliminar: 0,
    motivo: "",
  });

  // Actualizar día Juliano cuando cambia la fecha
  useEffect(() => {
    const date = new Date(formData.fechaEmpaque);
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const diaJuliano = Math.floor(diff / oneDay);
    setFormData((prev) => ({ ...prev, diaJuliano: String(diaJuliano).padStart(3, "0") }));
  }, [formData.fechaEmpaque]);

  // Actualizar posición cuando cambian bahia, seccion, fondo o piso
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      posicion: `${prev.bahia}-${prev.seccion}${prev.fondo}${prev.piso}`,
    }));
  }, [formData.bahia, formData.seccion, formData.fondo, formData.piso]);

  // Manejar cambios en inputs y sincronizar Kgs ↔ Lbs
  const handleInputChange = (field: keyof FormData, value: string | boolean | number) => {
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

      return updated;
    });
  };

  // Manejar cambios en el formulario de eliminación
  const handleDeleteFormChange = (field: keyof DeleteForm, value: string | number) => {
    setDeleteForm((prev) => ({ ...prev, [field]: value }));
  };

  // Obtener el próximo consecutivo para un lote, talla y producto
  const getNextFolio = (lote: string, tallaId: number, producto: string): number => {
    const idGranja = String(formData.granja).padStart(3, "0");
    const idTalla = String(tallaId).padStart(2, "0");
    const anio = new Date(formData.fechaEmpaque).getFullYear();
    const kilosFormateados = String(parseInt(formData.presentacionKgs, 10)).padStart(3, "0");
    const idProducto = producto === "SIN_CABEZA" ? "01" : "02";
    const prefix = `${lote.padStart(4, "0")}${idGranja}${idTalla}${formData.diaJuliano}${anio}${kilosFormateados}${idProducto}`;

    const matchingBarcodes = impresos.filter((barcode) => barcode.startsWith(prefix));
    if (matchingBarcodes.length === 0) return 1;

    const folios = matchingBarcodes.map((barcode) => parseInt(barcode.slice(-4)));
    return Math.max(...folios) + 1;
  };

  // Genera lista de códigos de barras para previsualizar
  const codigos = Array.from({ length: formData.numeroCartones }, (_, i) => {
    const idGranja = String(formData.granja).padStart(3, "0");
    const idTalla = String(formData.talla).padStart(2, "0");
    const startFolio = getNextFolio(formData.lote, formData.talla, formData.producto);
    const numeroEtiqueta = String(startFolio + i).padStart(4, "0");
    const anio = new Date(formData.fechaEmpaque).getFullYear();
    const kilosFormateados = String(parseInt(formData.presentacionKgs, 10)).padStart(3, "0");
    const idProducto = formData.producto === "SIN_CABEZA" ? "01" : "02";

    return (
      formData.lote.padStart(4, "0") +
      idGranja +
      idTalla +
      formData.diaJuliano.padStart(3, "0") +
      anio +
      kilosFormateados +
      idProducto +
      numeroEtiqueta
    );
  });

  const handlePrint = () => {
    if (formData.numeroCartones <= 0) {
      alert("Por favor, ingrese un número válido de etiquetas/cartones.");
      return;
    }

    // Add new barcodes to impresos
    setImpresos((prev) => [...prev, ...codigos]);

    // Add new entry to detalleEtiquetas
    const nuevaEntrada: DetalleEtiqueta = {
      id: detalleEtiquetas.length + 1,
      fecha: new Date(formData.fechaEmpaque).toLocaleDateString("es-ES"),
      sLote: formData.sublote,
      talla: tallas.find((t) => t.id === formData.talla)?.rango || "",
      cartones: formData.numeroCartones,
      kgs: parseFloat(formData.presentacionKgs),
      producto: formData.producto,
      posicion: formData.posicion,
    };
    setDetalleEtiquetas((prev) => [...prev, nuevaEntrada]);

    alert(
      `Se imprimirán ${formData.numeroCartones} Etiquetas, para un Total de ${formData.numeroCartones} Cartones.`
    );
  };

  const handleDelete = () => {
    const { lote, talla, producto, cantidadEliminar, motivo } = deleteForm;
    if (!lote || !talla || !producto || cantidadEliminar <= 0 || !motivo) {
      alert("Por favor, complete todos los campos del formulario de eliminación.");
      return;
    }

    // Find matching entries and calculate total available cartons
    const matchingEntries = detalleEtiquetas
      .filter(
        (detalle) =>
          detalle.sLote === lote &&
          detalle.talla === talla &&
          detalle.producto === producto
      )
      .sort((a, b) => b.id - a.id);
    const totalAvailableCartons = matchingEntries.reduce((sum, entry) => sum + entry.cartones, 0);

    if (totalAvailableCartons < cantidadEliminar) {
      alert(`No hay suficientes cartones para eliminar. Disponibles: ${totalAvailableCartons}`);
      return;
    }

    let remainingToDelete = cantidadEliminar;
    const newDetalleEtiquetas = [...detalleEtiquetas];
    const deletedBarcodes: string[] = [];

    // Generate barcode prefix for deletion
    const idGranja = String(formData.granja).padStart(3, "0");
    const idTalla = tallas.find((t) => t.rango === talla)?.id.toString().padStart(2, "0") || "01";
    const anio = new Date(formData.fechaEmpaque).getFullYear();
    const kilosFormateados = String(parseInt(String(matchingEntries[0]?.kgs || 20), 10)).padStart(3, "0");
    const idProducto = producto === "SIN_CABEZA" ? "01" : "02";
    const prefix = `${lote.padStart(4, "0")}${idGranja}${idTalla}${formData.diaJuliano}${anio}${kilosFormateados}${idProducto}`;

    const matchingBarcodes = impresos
      .filter((barcode) => barcode.startsWith(prefix))
      .map((barcode) => ({ barcode, folio: parseInt(barcode.slice(-4)) }))
      .sort((a, b) => b.folio - a.folio);

    // Delete cartons and collect barcodes
    for (let i = 0; i < matchingBarcodes.length && remainingToDelete > 0; i++) {
      const { barcode } = matchingBarcodes[i];
      deletedBarcodes.push(barcode);
      remainingToDelete--;
    }

    // Update detalleEtiquetas
    for (let i = 0; i < matchingEntries.length && remainingToDelete >= 0; i++) {
      const entry = matchingEntries[i];
      const entryIndex = newDetalleEtiquetas.findIndex((e) => e.id === entry.id);
      if (entryIndex !== -1) {
        if (newDetalleEtiquetas[entryIndex].cartones <= remainingToDelete) {
          remainingToDelete -= newDetalleEtiquetas[entryIndex].cartones;
          newDetalleEtiquetas.splice(entryIndex, 1);
        } else {
          newDetalleEtiquetas[entryIndex].cartones -= remainingToDelete;
          remainingToDelete = 0;
        }
      }
    }

    setDetalleEtiquetas(newDetalleEtiquetas);
    setImpresos((prev) => prev.filter((barcode) => !deletedBarcodes.includes(barcode)));
    setEliminados((prev) => [...prev, ...deletedBarcodes]);
    setShowDeleteModal(false);
    setDeleteForm({ lote: "", talla: "", producto: "", cantidadEliminar: 0, motivo: "" });
    alert(`Se eliminaron ${cantidadEliminar} etiquetas. Motivo: ${motivo}`);
  };

  // Aggregating cartons by sLote, talla, producto, and posicion
  const totalPorLoteTallaProductoPosicion = detalleEtiquetas.reduce((acc, detalle) => {
    const key = `${detalle.sLote}-${detalle.talla}-${detalle.producto}-${detalle.posicion}`;
    if (!acc[key]) {
      acc[key] = {
        lote: detalle.sLote,
        talla: detalle.talla,
        producto: detalle.producto,
        posicion: detalle.posicion,
        cartones: 0,
        kgs: detalle.kgs,
      };
    }
    acc[key].cartones += detalle.cartones;
    return acc;
  }, {} as Record<string, { lote: string; talla: string; producto: string; posicion: string; cartones: number; kgs: number }>);

  // Convert object to array for rendering
  const registros = Object.values(totalPorLoteTallaProductoPosicion);

  // Calculate totals
  const totalCartones = registros.reduce((sum, registro) => sum + registro.cartones, 0);
  const totalKgs = registros.reduce((sum, registro) => sum + registro.cartones * registro.kgs, 0);

  // Get unique lotes, tallas, and productos for delete form
  const uniqueLotes = Array.from(new Set(detalleEtiquetas.map((d) => d.sLote)));
  const uniqueTallas = Array.from(new Set(detalleEtiquetas.map((d) => d.talla)));
  const uniqueProductos = Array.from(new Set(detalleEtiquetas.map((d) => d.producto)));

  return (
    <div className="flex-1 bg-gray-100 min-h-screen overflow-y-auto p-4">
      {/* HEADER */}
      <div className="flex items-center gap-2 bg-gray-200 px-4 py-2 border-b">
        <button className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <Plus size={16} /> Nuevo
        </button>
        <button className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <Edit size={16} /> Modificar
        </button>
        <button
          onClick={handlePrint}
          className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm"
        >
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

      {/* MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Eliminar Etiquetas</h3>
            <div className="space-y-4 text-sm">
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
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {/* LEFT FORM */}
        <div className="space-y-4">
          {/* Detalle Etiqueta */}
          <div className="bg-white p-4 rounded shadow border">
            <h3 className="font-bold text-blue-600 mb-2">Detalle Etiqueta</h3>
            <div className="grid grid-cols-4 gap-3 text-sm">
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
                <select value={formData.granja} onChange={(e) => handleInputChange("granja", parseInt(e.target.value))} className="w-full border px-2 py-1 rounded">
                  <option value={0}>Seleccionar</option>
                  {granjas.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </div>
              <div>
                <label>Talla</label>
                <select value={formData.talla} onChange={(e) => handleInputChange("talla", parseInt(e.target.value))} className="w-full border px-2 py-1 rounded">
                  <option value={0}>Seleccionar</option>
                  {tallas.map((t) => <option key={t.id} value={t.id}>{t.rango}</option>)}
                </select>
              </div>
              <div>
                <label># Camarones</label>
                <input type="number" value={formData.camarones} onChange={(e) => handleInputChange("camarones", e.target.value)} className="w-full border px-2 py-1 rounded" />
              </div>
              <div>
                <label>Uniformidad</label>
                <input type="number" value={formData.uniformidad} onChange={(e) => handleInputChange("uniformidad", e.target.value)} className="w-full border px-2 py-1 rounded" />
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

            <div className="grid grid-cols-4 gap-3 text-sm mt-3">
              <div>
                <label>Bahía</label>
                <select
                  value={formData.bahia}
                  onChange={(e) => handleInputChange("bahia", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
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
                >
                  <option value="">Seleccionar</option>
                  {pisos.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <label>Posición</label>
              <input
                type="text"
                value={formData.posicion}
                readOnly
                className="w-full border px-2 py-1 rounded bg-gray-100"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded shadow border max-h-[400px] overflow-y-auto mt-4">
            <h2 className="text-lg font-semibold">Vista previa</h2>
            <div className="space-y-6">
              {codigos.map((codigo, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <p className="font-mono">{codigo}</p>
                  <Barcode value={codigo} height={60} displayValue={true} />
                </div>
              ))}
            </div>
          </div>

          {impresos.length > 0 && (
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
          )}

          {eliminados.length > 0 && (
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
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">
          <div className="bg-white rounded shadow border">
            <div className="bg-blue-100 p-2 font-bold text-sm text-gray-700">
              Registro:
            </div>
            <div className="divide-y text-sm">
              <div className="grid grid-cols-6 text-center p-2 font-bold">
                <span>Lote</span>
                <span>Talla</span>
                <span>Cartones</span>
                <span>(Kgs)</span>
                <span>Producto</span>
                <span>Posición</span>
              </div>
              {registros.map((registro, idx) => (
                <div key={idx} className="grid grid-cols-6 text-center p-2">
                  <span>{registro.lote}</span>
                  <span>{registro.talla}</span>
                  <span>{registro.cartones}</span>
                  <span>{registro.kgs}</span>
                  <span>{registro.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}</span>
                  <span>{registro.posicion}</span>
                </div>
              ))}
              <div className="grid grid-cols-6 text-center p-2 font-bold">
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
          <div className="bg-red-100 text-center p-3 font-bold text-red-700 rounded shadow">
            Se Imprimirán {formData.numeroCartones} Etiquetas, para un Total de{" "}
            {formData.numeroCartones} Cartones.
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
            >
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