import axios from "axios";

const API_URL = "http://localhost:3000/api/tipos-precios-descabece";

export const getTiposPreciosDescabece = async () => {
  try {
    const res = await axios.get(API_URL);
    // Si el backend responde vacío o null, devolvemos []
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error al obtener tipos de precios descabece:", error);
    return [];
  }
};

export const getTipoPrecioDescabeceById = async (id: number) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data ?? null;
  } catch (error) {
    console.error(`Error al obtener tipo de precio descabece con id ${id}:`, error);
    return null;
  }
};

export const createTipoPrecioDescabece = async (tipoPrecio: {
  precio: number;
  estatus: number;
}) => {
  try {
    const res = await axios.post(API_URL, tipoPrecio);
    return res.data ?? null;
  } catch (error) {
    console.error("Error al crear tipo de precio descabece:", error);
    return null;
  }
};

export const updateTipoPrecioDescabece = async (
  id: number,
  tipoPrecio: { precio: number; estatus: number }
) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, tipoPrecio);
    return res.data ?? null;
  } catch (error) {
    console.error(`Error al actualizar tipo de precio descabece con id ${id}:`, error);
    return null;
  }
};

export const deleteTipoPrecioDescabece = async (id: number) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data ?? null;
  } catch (error) {
    console.error(`Error al eliminar tipo de precio descabece con id ${id}:`, error);
    return null;
  }
};