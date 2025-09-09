import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../../api/productosApi";
import axios from "axios";

interface Producto {
  idproducto: number;
  idtalla: number;
  producto: string;
  talla: string;
  precio: number;
  status: string;
}

interface Talla {
  idtalla: number;
  talla: string;
}

interface FormData {
  idproducto?: number;
  idtalla: number;
  producto: string;
  precio: number;
  status: string;
}

const Productos: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    idtalla: 0,
    producto: "",
    precio: 0,
    status: "A",
  });

  // ====== Cargar productos y tallas ======
  useEffect(() => {
    fetchProductos();
    fetchTallas();
  }, []);

  const fetchProductos = async () => {
    try {
      const res = await getProductos();
      setProductos(
        res.data.map((p: any) => ({
          ...p,
          precio: Number(p.precio), // aseguramos que sea número
        }))
      );
    } catch (err) {
      console.error("Error cargando productos", err);
    }
  };

  const fetchTallas = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/tallas");
      setTallas(res.data);
    } catch (err) {
      console.error("Error cargando tallas", err);
    }
  };

  // ====== Manejo de formulario ======
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.idproducto) {
        await updateProducto(formData.idproducto, formData);
      } else {
        await createProducto(formData);
      }
      fetchProductos();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error("Error guardando producto", err);
    }
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const producto = productos[selectedRow];
      setFormData({
        idproducto: producto.idproducto,
        idtalla: producto.idtalla,
        producto: producto.producto,
        precio: producto.precio,
        status: producto.status,
      });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const id = productos[selectedRow].idproducto;
      try {
        await deleteProducto(id);
        fetchProductos();
        setSelectedRow(null);
      } catch (err) {
        console.error("Error eliminando producto", err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      idtalla: 0,
      producto: "",
      precio: 0,
      status: "A",
    });
  };

  // ====== Formulario ======
  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.idproducto ? "Modificar Producto" : "Nuevo Producto"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {formData.idproducto && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID:
                </label>
                <input
                  type="text"
                  value={formData.idproducto}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producto:
              </label>
              <input
                type="text"
                value={formData.producto}
                onChange={(e) =>
                  handleInputChange("producto", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Talla:
              </label>
              <select
                value={formData.idtalla}
                onChange={(e) =>
                  handleInputChange("idtalla", Number(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value={0}>Seleccione talla</option>
                {tallas.map((t) => (
                  <option key={t.idtalla} value={t.idtalla}>
                    {t.talla}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio ($):
              </label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) =>
                  handleInputChange("precio", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado:
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="A">Activo</option>
                <option value="I">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
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

  // ====== Tabla productos ======
  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">
            Consulta de Productos
          </h2>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md"
          >
            <Edit className="w-4 h-4" />
            Modificar
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PRODUCTO
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TALLA
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                PRECIO ($)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                ESTADO
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((producto, index) => (
              <tr
                key={producto.idproducto}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedRow === index ? "bg-blue-100" : ""
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  {producto.idproducto}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {producto.producto}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {producto.talla}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {(Number(producto.precio) || 0).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {producto.status === "A" ? "Activo" : "Inactivo"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Productos;