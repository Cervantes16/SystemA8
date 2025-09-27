import React, { useState, useEffect } from "react";
import { Printer, RefreshCw, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import Barcode from "react-barcode";

// Define interfaces for TypeScript
interface FormData {
  fechaEmpaque: string;
  diaJuliano: string;
  lote: string;
  sublote: string;
  granja: number; // ahora ID
  talla: number;  // ahora ID
  camarones: string;
  presentacionKgs: string;
  presentacionLbs: string;
  producto: string;
  uniformidad: string;
  metabisulfato: boolean;
  horaEmpaque: string;
  nombrePlanta: string;
  zDesigner: string;
  consecutivo: number;
  numeroCartones: number;
  numeroEtiquetas: number;
  bahia: string; // New field for warehouse position
  seccion: string; // New field for warehouse position
  fondo: string; // New field for warehouse position
  piso: string; // New field for warehouse position
  posicion: string; // Combined position (e.g., "1-1-A-1")
}

interface DetalleEtiqueta {
  id: number;
  fecha: string;
  sLote: string;
  talla: string;
  cartones: number;
  kgs: number;
  producto: string;
  posicion: string; // New field for warehouse position
}

// Opciones
const granjas = [
  { id: 1, nombre: "AGUILAS" },
  { id: 2, nombre: "SAN PEDRO" },
];

const tallas = [
  { id: 1, rango: "41-50" },
  { id: 2, rango: "51-60" },
  { id: 3, rango: "61-70" },
];

const bahias = Array.from({ length: 10 }, (_, i) => String(i + 1)); // 1 to 10
const secciones = Array.from({ length: 5 }, (_, i) => String(i + 1)); // 1 to 5
const fondos = ["A", "B", "C"];
const pisos = ["1", "2", "3"];

const GeneracionEtiquetas: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fechaEmpaque: "2025-09-20",
    diaJuliano: "263",
    lote: "1",
    sublote: "1",
    granja: 1,
    talla: 1,
    camarones: "1.00",
    presentacionKgs: "20.000",
    presentacionLbs: "44.092",
    producto: "SIN_CABEZA",
    uniformidad: "0.000",
    metabisulfato: true,
    horaEmpaque: "12:30",
    nombrePlanta: "PLANTA LAS AGUILAS",
    zDesigner: "ZDesigner ZD220-203dpi ZPL",
    consecutivo: 1,
    numeroCartones: 1,
    numeroEtiquetas: 1,
    bahia: "1",
    seccion: "1",
    fondo: "A",
    piso: "1",
    posicion: "1-1-A-1",
  });

  const [detalleEtiquetas, setDetalleEtiquetas] = useState<DetalleEtiqueta[]>([
    { id: 1, fecha: "20/09/2025", sLote: "1", talla: "41-50", cartones: 3, kgs: 20, producto: "SIN_CABEZA", posicion: "1-1A1" },
    { id: 2, fecha: "20/09/2025", sLote: "1", talla: "41-50", cartones: 2, kgs: 20, producto: "CON_CABEZA", posicion: "1-1A1" },
    { id: 3, fecha: "20/09/2025", sLote: "1", talla: "51-60", cartones: 8, kgs: 20, producto: "SIN_CABEZA", posicion: "1-2B1" },
  ]);

  const [impresos, setImpresos] = useState<string[]>([]);

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
        updated.presentacionLbs = (kgs * 2.20462).toFixed(3); // Convertir a libras
      }

      if (field === "presentacionLbs") {
        const lbs = parseFloat(String(value)) || 0;
        updated.presentacionKgs = (lbs / 2.20462).toFixed(3); // Convertir a kilos
      }

      return updated;
    });
  };

  // Genera lista de códigos de barras para previsualizar
  const codigos = Array.from({ length: formData.numeroCartones }, (_, i) => {
    const idGranja = String(formData.granja).padStart(3, "0");
    const idTalla = String(formData.talla).padStart(2, "0");
    const numeroEtiqueta = String(formData.consecutivo + i).padStart(4, "0");
    const anio = new Date(formData.fechaEmpaque).getFullYear();
    
    // Usar presentacionKgs para kilosFormateados
    const kilosFormateados = String(parseInt(formData.presentacionKgs, 10)).padStart(3, "0");

    // producto: 01 = sin cabeza, 02 = con cabeza
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
    setImpresos(codigos);
    // Actualizar el consecutivo
    const nuevoConsecutivo = formData.consecutivo + formData.numeroCartones;
    setFormData((prev) => ({ ...prev, consecutivo: nuevoConsecutivo }));
    // Agregar nueva entrada a detalleEtiquetas
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
      `Se imprimirán ${formData.numeroEtiquetas} Etiquetas, para un Total de ${formData.numeroCartones} Cartones.`
    );
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
        <button className="px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm text-red-600">
          <Trash2 size={16} /> Eliminar
        </button>
        <button className="ml-auto px-3 py-2 bg-white border rounded flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Salir
        </button>
      </div>

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
                />
              </div>
              <div>
                <label>Presentación (Lbs)</label>
                <input
                  type="number"
                  value={parseFloat(formData.presentacionLbs)}
                  onChange={(e) => handleInputChange("presentacionLbs", e.target.value)}
                  className="w-full border px-2 py-1 rounded"
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

            {/* Posición en Bodega */}
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

          {/* VISTA PREVIA CON SCROLL */}
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

          {/* ÚLTIMOS IMPRESOS */}
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
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-4">
          {/* Total Etiquetas por Lote, Talla, Producto y Posición */}
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
              </div>
              {registros.map((registro, idx) => (
                <div key={idx} className="grid grid-cols-6 text-center p-2">
                  <span>{registro.lote}</span>
                  <span>{registro.talla}</span>
                  <span>{registro.cartones}</span>
                  <span>{registro.kgs}</span>
                  <span>{registro.producto === "SIN_CABEZA" ? "S/CABEZA" : "C/CABEZA"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CONFIGURACION DE ETIQUETAS */}
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
              <label>Consecutivo Actual</label>
              <input
                type="number"
                value={formData.consecutivo}
                onChange={(e) => handleInputChange("consecutivo", parseInt(e.target.value))}
                className="w-full border px-2 py-1 rounded mt-1"
              />
            </div>
            <div className="mt-2">
              <label>Número de Etiquetas/Cartones</label>
              <input
                type="number"
                value={formData.numeroEtiquetas}
                onChange={(e) => handleInputChange("numeroEtiquetas", parseInt(e.target.value))}
                className="w-full border px-2 py-1 rounded mt-1"
              />
            </div>
          </div>
          {/* MENSAJE EN ROJO */}
          <div className="bg-red-100 text-center p-3 font-bold text-red-700 rounded shadow">
            Se Imprimirán {formData.numeroEtiquetas} Etiquetas, para un Total de{" "}
            {formData.numeroCartones} Cartones.
          </div>

          {/* BOTONES */}
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