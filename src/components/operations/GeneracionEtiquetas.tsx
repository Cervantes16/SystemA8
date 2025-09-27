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
}

interface DetalleEtiqueta {
  id: number;
  fecha: string;
  sLote: string;
  talla: string;
  cartones: number;
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

const GeneracionEtiquetas: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fechaEmpaque: "2025-09-20",
    diaJuliano: "263",
    lote: "2",
    sublote: "1",
    granja: 1, // ID
    talla: 1,  // ID
    camarones: "1.00",
    presentacionKgs: "0.000",
    presentacionLbs: "0.000",
    producto: "CAMARON",
    uniformidad: "0.000",
    metabisulfato: true,
    horaEmpaque: "12:30",
    nombrePlanta: "PLANTA LAS AGUILAS",
    zDesigner: "ZDesigner ZD220-203dpi ZPL",
    consecutivo: 1,
    numeroCartones: 1,
    numeroEtiquetas: 1,
  });

  const [detalleEtiquetas, setDetalleEtiquetas] = useState<DetalleEtiqueta[]>([
    { id: 1, fecha: "20/09/2025", sLote: "1", talla: "41-50", cartones: 162 },
    { id: 2, fecha: "20/09/2025", sLote: "1", talla: "51-60", cartones: 100 },
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
    
    // aquí supongo que cada cartón es formData.presentacionKgs kilos exactos
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
    alert(
      `Se imprimirán ${formData.numeroEtiquetas} Etiquetas, para un Total de ${formData.numeroCartones} Cartones.`
    );
  };

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
          {/* Tabla Sublotes */}
          <div className="bg-white rounded shadow border">
            <div className="bg-blue-100 p-2 font-bold text-sm text-gray-700">
              Detalles Sublotes
            </div>
            <div className="divide-y text-sm">
              {detalleEtiquetas.map((d) => (
                <div key={d.id} className="grid grid-cols-5 text-center p-2">
                  <span>{d.talla}</span>
                  <span>{d.sLote}</span>
                  <span>{d.cartones}</span>
                  <span>{d.cartones}</span>
                  <span>0.00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla Lote */}
          <div className="bg-white rounded shadow border">
            <div className="p-2 text-red-600 font-bold">Lote:</div>
            <div className="divide-y text-sm">
              {detalleEtiquetas.map((d) => (
                <div key={d.id} className="grid grid-cols-4 text-center p-2">
                  <span>{d.id}</span>
                  <span>{d.fecha}</span>
                  <span>{d.sLote}</span>
                  <span>{d.talla}</span>
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
