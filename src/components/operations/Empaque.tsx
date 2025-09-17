import React, { useEffect, useState } from "react";
import {
  PlusSquare,
  Edit3,
  Printer,
  FilePlus,
  Upload,
  Trash2,
  ArrowLeftCircle,
  ArrowDownCircle,
  Search,
  Save,
} from "lucide-react";

/*
  Empaques.tsx
  Versión moderna con look similar a la imagen: panel lateral, toolbar superior y formulario-modal centrado.
  - Sin dependencias externas (shadcn) para evitar errores de imports.
  - Usa TailwindCSS para estilos (ya asumidos en tu proyecto Vite).
*/

// --- UI primitives (simples, autónomos) ---
const IconBtn = ({ title, children, className = "", ...props }: any) => (
  <button
    title={title}
    className={
      "flex items-center gap-2 px-3 py-2 rounded-md shadow-sm text-sm text-white " + className
    }
    {...props}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, className = "", ...props }: any) => (
  <button
    {...props}
    className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm border ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }: any) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const Input = (props: any) => (
  <input {...props} className={`w-full px-2 py-1 border rounded text-sm ${props.className || ""}`} />
);

const Select = (props: any) => (
  <select {...props} className={`w-full px-2 py-1 border rounded text-sm ${props.className || ""}`} />
);

// --- Component ---
export default function Empaques() {
  // pantalla principal
  const [showForm, setShowForm] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // datos (mock)
  const [empaques, setEmpaques] = useState<any[]>([
    { id: 1, fecha: "06/15/2021", lote: "1", kilos: 5080, cartones: 254, granja: "AGUILAS8", observ: "SIN OBSERVACION", subido: "N" },
    { id: 2, fecha: "06/15/2021", lote: "2", kilos: 3980, cartones: 199, granja: "AGUILAS8", observ: "SIN OBSERVACION", subido: "N" },
  ]);

  // formulario
  const emptyForm = {
    idEmpaque: "",
    fecha: new Date().toISOString().split("T")[0],
    recepcion: "",
    lote: "",
    subLote: "",
    tamanio: "41-50",
    prod: "SICABEZA",
    estanque: "",
    cartones: 0,
    kgXCarton: 0,
    noCam: 0,
    decabece: 0,
    totalKg: 0,
    ubicacion: "",
    observacion: "SIN OBSERVACION",
  };

  const [form, setForm] = useState<any>(emptyForm);

  // detalles y tallas
  const [detalles, setDetalles] = useState<any[]>([]);
  const [tallas, setTallas] = useState<any[]>([]);

  // totales
  const totalKgsCart = detalles.reduce((s, d) => s + (Number(d.totalKg) || 0), 0);
  const totalKgsSueltos = tallas.reduce((s, t) => s + (Number(t.kgs) || 0), 0);
  const kgsRecibidos = Number(form.totalKg) || 0; // podrías separar kgsRecibidos si lo deseas
  const rendimiento = kgsRecibidos > 0 ? ((totalKgsCart + totalKgsSueltos) / kgsRecibidos) * 100 : 0;

  useEffect(() => {
    // mantener totalKg actualizado al cambiar cartones o kgXCarton
    setForm((prev: any) => ({ ...prev, totalKg: (Number(prev.cartones || 0) * Number(prev.kgXCarton || 0)).toFixed(4) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cartones, form.kgXCarton]);

  // abrir nuevo
  function onNuevo() {
    setForm(emptyForm);
    setDetalles([]);
    setTallas([]);
    setShowForm(true);
    setSelectedIndex(null);
  }

  // abrir modificar
  function onModificar() {
    if (selectedIndex === null) return alert("Seleccione un empaque");
    const e = empaques[selectedIndex];
    setForm({
      idEmpaque: e.id,
      fecha: e.fecha,
      recepcion: e.granja,
      lote: e.lote,
      subLote: "",
      tamanio: "41-50",
      prod: "SICABEZA",
      estanque: "",
      cartones: 0,
      kgXCarton: 0,
      noCam: 0,
      decabece: 0,
      totalKg: e.kilos,
      ubicacion: "",
      observacion: e.observ,
    });
    // mock: cargar detalles/tallas asociados
    setDetalles([]);
    setTallas([]);
    setShowForm(true);
  }

  function onGuardar() {
    // validar minimal
    if (!form.fecha || !form.recepcion || !form.lote) {
      return alert("Complete Fecha, Recepción y Lote");
    }
    // si idEmpaque existe -> update
    if (form.idEmpaque) {
      setEmpaques((prev) => prev.map((p) => (p.id === form.idEmpaque ? { ...p, fecha: form.fecha, lote: form.lote, kilos: totalKgsCart + totalKgsSueltos, granja: form.recepcion, observ: form.observacion } : p)));
    } else {
      const newItem = {
        id: empaques.length ? Math.max(...empaques.map((x) => x.id)) + 1 : 1,
        fecha: form.fecha,
        lote: form.lote,
        kilos: totalKgsCart + totalKgsSueltos,
        cartones: totalKgsCart > 0 ? Math.round(totalKgsCart / (form.kgXCarton || 1)) : 0,
        granja: form.recepcion,
        observ: form.observacion,
        subido: "N",
      };
      setEmpaques((prev) => [newItem, ...prev]);
    }
    setShowForm(false);
  }

  function onEliminar() {
    if (selectedIndex === null) return alert("Seleccione un empaque para eliminar");
    const confirm = window.confirm("¿Eliminar empaque?");
    if (!confirm) return;
    setEmpaques((prev) => prev.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
  }

  // agregar detalle (cartones)
  function agregarDetalle() {
    if (!form.subLote || !form.tamanio) return alert("Complete SubLote y Talla");
    if (Number(form.cartones) <= 0 || Number(form.kgXCarton) <= 0) return alert("Cartones y Kg por cartón deben ser mayores a 0");
    const d = {
      id: detalles.length ? Math.max(...detalles.map((x) => x.id)) + 1 : 1,
      estanque: form.estanque,
      descripcion: form.prod,
      talla: form.tamanio,
      camarones: Number(form.noCam || 0),
      cartones: Number(form.cartones || 0),
      kgCarton: Number(form.kgXCarton || 0),
      descabece: Number(form.decabece || 0),
      totalKg: Number(form.cartones || 0) * Number(form.kgXCarton || 0),
      ubicacion: form.ubicacion,
      subLote: form.subLote,
      barras: `0001${String(form.subLote).padStart(3, "0")}020${String(form.tamanio).replace("-", "")}`,
    };
    setDetalles((prev) => [...prev, d]);
  }

  function borrarDetalle(id: number) {
    setDetalles((prev) => prev.filter((x) => x.id !== id));
  }

  // tallas sueltas
  function agregarTallaSueltas() {
    if (!form.tamanio || Number(form.totalKg) <= 0) return alert("Seleccione talla y kilogramos");
    const t = {
      id: tallas.length ? Math.max(...tallas.map((x) => x.id)) + 1 : 1,
      talla: form.tamanio,
      kgs: Number(form.totalKg || 0),
    };
    setTallas((prev) => [...prev, t]);
    setForm((p: any) => ({ ...p, totalKg: 0 }));
  }

  function borrarTalla(id: number) {
    setTallas((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="flex h-screen bg-slate-100 text-sm">

      {/* Main */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconBtn title="Nuevo" className="bg-blue-300 text-black" onClick={onNuevo}>
              <FilePlus size={16} /> Nuevo
            </IconBtn>
            <IconBtn title="Modificar" className="bg-blue-400" onClick={onModificar}>
              <Edit3 size={16} /> Modificar
            </IconBtn>
            <IconBtn title="Imprimir" className="bg-white text-black border-gray-300">
              <Printer size={16} /> Imprimir
            </IconBtn>
            <IconBtn title="ImprimirConSalidas" className="bg-white text-black border-gray-300">
              <Upload size={16} /> Imprimir Con Salidas
            </IconBtn>
            <IconBtn title="SubirNube" className="bg-white text-black border-gray-300">
              <ArrowDownCircle size={16} /> Subir Nube
            </IconBtn>
            <IconBtn title="Eliminar" className="bg-red-500">
              <Trash2 size={16} /> Eliminar
            </IconBtn>
          </div>

          <div>
            <GhostBtn className="px-3 py-1">Salir</GhostBtn>
          </div>
        </div>

        {/* Listado principal (tabla simple) */}
        <Card className="mb-4">
          <div className="p-2 font-semibold text-slate-700">Consulta de Empaques</div>
          <div className="overflow-auto max-h-44">
            <table className="w-full border-t border-slate-200">
              <thead className="bg-slate-100 text-xs text-slate-600">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">FECHA</th>
                  <th className="p-2">LOTE</th>
                  <th className="p-2">KILOGRAMOS</th>
                  <th className="p-2">CARTONES</th>
                  <th className="p-2">GRANJA</th>
                  <th className="p-2">OBSERVACIONES</th>
                  <th className="p-2">SUBIDO</th>
                </tr>
              </thead>
              <tbody>
                {empaques.map((row, i) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedIndex(i)}
                    className={
                      "cursor-pointer hover:bg-slate-50 " + (selectedIndex === i ? "bg-blue-50" : "bg-white")
                    }
                  >
                    <td className="p-2">{row.id}</td>
                    <td className="p-2">{row.fecha}</td>
                    <td className="p-2">{row.lote}</td>
                    <td className="p-2">{Number(row.kilos).toLocaleString()}</td>
                    <td className="p-2">{row.cartones ?? "-"}</td>
                    <td className="p-2">{row.granja}</td>
                    <td className="p-2">{row.observ}</td>
                    <td className="p-2">{row.subido}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Form modal (centrado como la imagen) */}
        {showForm && (
          <div className="fixed inset-0 flex items-start justify-center pt-8 z-40">
            <div className="w-[90%] max-w-[1100px]">
              <Card className="p-0 overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                  <div className="font-semibold">Empacado</div>
                  <div className="text-xs text-slate-500">Id Empaque: {form.idEmpaque || "(nuevo)"}</div>
                </div>

                <div className="p-4 grid grid-cols-12 gap-4">
                  {/* Left form (col-span-8) */}
                  <div className="col-span-8 space-y-3">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <label className="text-xs text-slate-600">Fecha</label>
                        <Input type="date" value={form.fecha} onChange={(e: any) => setForm({ ...form, fecha: e.target.value })} />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-slate-600">Recepción</label>
                        <Input value={form.recepcion} onChange={(e: any) => setForm({ ...form, recepcion: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">Kgs Recibidos</label>
                        <Input value={form.totalKg} onChange={(e: any) => setForm({ ...form, totalKg: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">Lote</label>
                        <Input value={form.lote} onChange={(e: any) => setForm({ ...form, lote: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <GhostBtn onClick={() => { /* buscar etiquetado (F3) */ }}>
                          <Search size={14} /> Abrir Etiquetado
                        </GhostBtn>
                      </div>
                    </div>

                    <hr />

                    <div className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">SubLote</label>
                        <Input value={form.subLote} onChange={(e: any) => setForm({ ...form, subLote: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">Estanque</label>
                        <Input value={form.estanque} onChange={(e: any) => setForm({ ...form, estanque: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">Talla</label>
                        <Select value={form.tamanio} onChange={(e: any) => setForm({ ...form, tamanio: e.target.value })}>
                          <option>41-50</option>
                          <option>51-60</option>
                          <option>61-70</option>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">Cartones</label>
                        <Input value={form.cartones} onChange={(e: any) => setForm({ ...form, cartones: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">Kg X Carton</label>
                        <Input value={form.kgXCarton} onChange={(e: any) => setForm({ ...form, kgXCarton: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-slate-600">Prod</label>
                        <Select value={form.prod} onChange={(e: any) => setForm({ ...form, prod: e.target.value })}>
                          <option>SICABEZA</option>
                          <option>CONCABEZA</option>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-xs text-slate-600">No Cam</label>
                        <Input value={form.noCam} onChange={(e: any) => setForm({ ...form, noCam: e.target.value })} />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-slate-600">Decabece</label>
                        <Input value={form.decabece} onChange={(e: any) => setForm({ ...form, decabece: e.target.value })} />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-slate-600">Total Kg</label>
                        <Input value={Number(form.cartones || 0) * Number(form.kgXCarton || 0)} readOnly />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-slate-600">Ubicación</label>
                        <Input value={form.ubicacion} onChange={(e: any) => setForm({ ...form, ubicacion: e.target.value })} />
                      </div>

                      <div className="col-span-12 flex gap-2 mt-2">
                        <button onClick={agregarDetalle} className="px-3 py-1 bg-cyan-500 text-white rounded flex items-center gap-2">
                          <PlusSquare size={16} /> Agregar
                        </button>
                        <button onClick={() => { setDetalles([]); }} className="px-3 py-1 bg-rose-500 text-white rounded flex items-center gap-2">
                          <Trash2 size={16} /> Limpiar
                        </button>
                        <div className="ml-auto text-xs text-slate-500">{/* barcode placeholder */}</div>
                      </div>

                      {/* tabla de detalles */}
                      <div className="col-span-12">
                        <div className="border rounded bg-white max-h-36 overflow-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-100">
                              <tr>
                                <th className="p-1">ESTANQUE</th>
                                <th className="p-1">DESC</th>
                                <th className="p-1">TALLA</th>
                                <th className="p-1">CARTONES</th>
                                <th className="p-1">KGxCART</th>
                                <th className="p-1">DESCAB.</th>
                                <th className="p-1">TOTAL KG</th>
                                <th className="p-1">UBICAC.</th>
                                <th className="p-1">SUBLOTE</th>
                                <th className="p-1">BARRAS</th>
                                <th className="p-1">ACCION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detalles.map((d) => (
                                <tr key={d.id} className="even:bg-slate-50">
                                  <td className="p-1">{d.estanque}</td>
                                  <td className="p-1">{d.descripcion}</td>
                                  <td className="p-1">{d.talla}</td>
                                  <td className="p-1">{d.cartones.toFixed(2)}</td>
                                  <td className="p-1">{d.kgCarton.toFixed(2)}</td>
                                  <td className="p-1">{d.descabece.toFixed(2)}</td>
                                  <td className="p-1">{d.totalKg.toFixed(4)}</td>
                                  <td className="p-1">{d.ubicacion}</td>
                                  <td className="p-1">{d.subLote}</td>
                                  <td className="p-1">{d.barras}</td>
                                  <td className="p-1">
                                    <button onClick={() => borrarDetalle(d.id)} className="text-red-600">Eliminar</button>
                                  </td>
                                </tr>
                              ))}
                              {detalles.length === 0 && (
                                <tr><td colSpan={11} className="p-2 text-center text-slate-400">Sin detalles</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>

                    <div>
                      <label className="text-xs text-slate-600">Observacion</label>
                      <textarea value={form.observacion} onChange={(e: any) => setForm({ ...form, observacion: e.target.value })} className="w-full border rounded p-2 text-sm" rows={3} />
                    </div>
                  </div>

                  {/* Right side - tallas sueltas */}
                  <div className="col-span-4">
                    <Card className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">Detalle Kilogramos Sueltos</div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-slate-600">Talla</label>
                          <Select value={form.tamanio} onChange={(e: any) => setForm({ ...form, tamanio: e.target.value })}>
                            <option>41-50</option>
                            <option>51-60</option>
                            <option>61-70</option>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Kgs</label>
                          <Input value={form.totalKg} onChange={(e: any) => setForm({ ...form, totalKg: e.target.value })} />
                        </div>

                        <div className="flex gap-2">
                          <button onClick={agregarTallaSueltas} className="px-3 py-1 bg-cyan-500 text-white rounded flex items-center gap-2">
                            <PlusSquare size={16} /> Agregar
                          </button>
                          <button onClick={() => setTallas([])} className="px-3 py-1 bg-rose-500 text-white rounded flex items-center gap-2">
                            <Trash2 size={16} /> Limpiar
                          </button>
                        </div>

                        <div className="border rounded overflow-auto max-h-36 bg-white">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-xs">
                              <tr>
                                <th className="p-2">TALLA</th>
                                <th className="p-2">KGS</th>
                                <th className="p-2">ACCION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tallas.map((t) => (
                                <tr key={t.id} className="even:bg-slate-50">
                                  <td className="p-2">{t.talla}</td>
                                  <td className="p-2">{t.kgs.toFixed(4)}</td>
                                  <td className="p-2"><button onClick={() => borrarTalla(t.id)} className="text-red-600">Eliminar</button></td>
                                </tr>
                              ))}
                              {tallas.length === 0 && <tr><td colSpan={3} className="p-2 text-center text-slate-400">Sin tallas</td></tr>}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 text-xs space-y-1">
                          <div className="flex justify-between"><span>Total Kgs Cart:</span><strong>{totalKgsCart.toFixed(4)}</strong></div>
                          <div className="flex justify-between"><span>Kgs Sueltos:</span><strong>{totalKgsSueltos.toFixed(4)}</strong></div>
                          <div className="flex justify-between"><span>Rendimiento:</span><strong>{rendimiento.toFixed(4)} %</strong></div>
                        </div>
                      </div>
                    </Card>
                  </div>

                </div>

                {/* footer botones grandes */}
                <div className="p-3 border-t flex items-center gap-3 justify-end bg-slate-50">
                  <button onClick={onGuardar} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow">
                    <ArrowDownCircle size={18} /> Guardar
                  </button>
                  <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded">
                    <ArrowLeftCircle size={18} /> Regresar
                  </button>
                </div>

              </Card>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
