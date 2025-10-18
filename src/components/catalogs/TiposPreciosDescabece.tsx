import React, { useState, useEffect } from "react";
import { Plus, Edit, Printer, Trash2, Save, X, Loader2 } from "lucide-react";
import {
  getTiposPreciosDescabece,
  createTipoPrecioDescabece,
  updateTipoPrecioDescabece,
  deleteTipoPrecioDescabece,
} from "../../api/tiposPreciosDescabeceApi";

interface TipoPrecioDescabece {
  precioid: number;
  precio: number;
  estatus: number;
}

interface FormData {
  precioid: string;
  precio: string;
  estatus: string;
}

const TiposPreciosDescabece: React.FC = () => {
  const [tiposPrecios, setTiposPrecios] = useState<TipoPrecioDescabece[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    precioid: "",
    precio: "",
    estatus: "1",
  });

  // Cargar tipos de precios desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTiposPreciosDescabece();
        setTiposPrecios(data);
      } catch (error) {
        console.error("Error cargando tipos de precios descabece:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tipoPrecioData = {
      precio: parseFloat(formData.precio),
      estatus: parseInt(formData.estatus),
    };

    if (formData.precioid) {
      // Actualizar
      const updated = await updateTipoPrecioDescabece(parseInt(formData.precioid), tipoPrecioData);
      if (updated) {
        setTiposPrecios((prev) =>
          prev.map((t) =>
            t.precioid === updated.precioid ? { ...t, ...updated } : t
          )
        );
      }
    } else {
      // Crear
      const created = await createTipoPrecioDescabece(tipoPrecioData);
      if (created) {
        setTiposPrecios((prev) => [...prev, created]);
      }
    }
    setShowForm(false);
    setFormData({ precioid: "", precio: "", estatus: "1" });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const tipoPrecio = tiposPrecios[selectedRow];
      setFormData({
        precioid: tipoPrecio.precioid.toString(),
        precio: tipoPrecio.precio.toString(),
        estatus: tipoPrecio.estatus.toString(),
      });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const tipoPrecio = tiposPrecios[selectedRow];
      const deleted = await deleteTipoPrecioDescabece(tipoPrecio.precioid);
      if (deleted) {
        setTiposPrecios((prev) => prev.filter((_, index) => index !== selectedRow));
        setSelectedRow(null);
      }
    }
  };

  // === UI ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="ml-2 text-gray-600">Cargando tipos de precios descabece...</span>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="flex-1 bg-white h-full flex flex-col">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.precioid ? "Modificar Tipo de Precio" : "Nuevo Tipo de Precio"}
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
                value={formData.precioid || tiposPrecios.length + 1}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio:
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => handleInputChange("precio", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estatus:
              </label>
              <select
                value={formData.estatus}
                onChange={(e) => handleInputChange("estatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
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
            Consulta de Tipos de Precios Descabece
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
          {/*<button
            onClick={() => console.log("Imprimir tipos de precios descabece")}
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
          </button>*/}
        </div>
      </div>

      {/* Tabla con scroll */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PRECIO
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ESTATUS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tiposPrecios.map((tipoPrecio, index) => (
              <tr
                key={tipoPrecio.precioid}
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
                  {tipoPrecio.precioid}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {tipoPrecio.precio}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {tipoPrecio.estatus === 1 ? "Activo" : "Inactivo"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TiposPreciosDescabece;