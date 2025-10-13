// src/components/catalogs/Tallas.tsx
import React, { useState, useEffect } from "react";
import { Plus, Edit, Printer, Trash2, Save, X, Loader2 } from "lucide-react";
import {
  getTallas,
  createTalla,
  updateTalla,
  deleteTalla,
} from "../../api/tallasApi";

interface Talla {
  tallaid: number;
  talla: string;
  ccabeza: string;
  status: string;
}

interface FormData {
  tallaid: string;
  talla: string;
  ccabeza: string;
  status: string;
}

const Tallas: React.FC = () => {
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    tallaid: "",
    talla: "",
    ccabeza: "",
    status: "A",
  });

  // cargar tallas desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTallas();
        setTallas(data);
      } catch (error) {
        console.error("Error cargando tallas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tallaid) {
      // actualizar
      const updated = await updateTalla(parseInt(formData.tallaid), formData);
      if (updated) {
        setTallas((prev) =>
          prev.map((t) =>
            t.tallaid === updated.tallaid ? { ...t, ...updated } : t
          )
        );
      }
    } else {
      // crear
      const created = await createTalla(formData);
      if (created) {
        setTallas((prev) => [...prev, created]);
      }
    }
    setShowForm(false);
    setFormData({ tallaid: "", talla: "", ccabeza: "", status: "A" });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const talla = tallas[selectedRow];
      setFormData({
        tallaid: talla.tallaid.toString(),
        talla: talla.talla,
        ccabeza: talla.ccabeza,
        status: talla.status,
      });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const talla = tallas[selectedRow];
      const deleted = await deleteTalla(talla.tallaid);
      if (deleted) {
        setTallas((prev) => prev.filter((_, index) => index !== selectedRow));
        setSelectedRow(null);
      }
    }
  };

  // === UI ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Cargando tallas...</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="flex-1 bg-white h-full flex flex-col">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.tallaid ? "Modificar Talla" : "Nueva Talla"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 flex-1 flex flex-col"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID:
              </label>
              <input
                type="text"
                value={formData.tallaid || tallas.length + 1}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talla:
              </label>
              <input
                type="text"
                value={formData.talla}
                onChange={(e) => handleInputChange("talla", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cabeza:
              </label>
              <input
                type="text"
                value={formData.ccabeza}
                onChange={(e) => handleInputChange("ccabeza", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Volver
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white h-full flex flex-col">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">
            Consulta de Tallas
          </h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => setShowForm(true)}
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
            onClick={() => console.log("Imprimir tallas")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm">
            Salir
          </button>
        </div>
      </div>

      {/* tabla con scroll */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TALLA
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CABEZA
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tallas.map((talla, index) => (
              <tr
                key={talla.tallaid}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index
                    ? "bg-blue-100"
                    : index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {talla.tallaid}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {talla.talla}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {talla.ccabeza}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tallas;