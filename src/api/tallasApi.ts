// src/api/tallasApi.ts
import axios from "axios";

const API_URL = "http://localhost:3000/api/tallas";

export const getTallas = async () => {
  try {
    const res = await axios.get(API_URL);
    // si el backend responde vacío o null, devolvemos []
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error al obtener tallas:", error);
    return [];
  }
};

export const getTallaById = async (id: number) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data ?? null;
  } catch (error) {
    console.error(`Error al obtener talla con id ${id}:`, error);
    return null;
  }
};

export const createTalla = async (talla: {
  talla: string;
  ccabeza: string;
  status: string;
}) => {
  try {
    const res = await axios.post(API_URL, talla);
    return res.data ?? null;
  } catch (error) {
    console.error("Error al crear talla:", error);
    return null;
  }
};

export const updateTalla = async (
  id: number,
  talla: { talla: string; ccabeza: string; status: string }
) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, talla);
    return res.data ?? null;
  } catch (error) {
    console.error(`Error al actualizar talla con id ${id}:`, error);
    return null;
  }
};

export const deleteTalla = async (id: number) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data ?? null;
  } catch (error) {
    console.error(`Error al eliminar talla con id ${id}:`, error);
    return null;
  }
};
