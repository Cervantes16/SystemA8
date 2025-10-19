import axios from 'axios';

const API_URL = '/api/puestos'; // Adjust this base URL as per your backend configuration

interface Puesto {
  puestoid: number;
  puesto: string;
  estatus: number;
}

interface FormData {
  puestoid?: number;
  puesto: string;
  estatus: number;
}

// Get all puestos
export const getPuestos = async (): Promise<Puesto[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener los puestos');
  }
};

// Create a new puesto
export const createPuesto = async (data: FormData): Promise<Puesto> => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al crear el puesto');
  }
};

// Update an existing puesto
export const updatePuesto = async (puestoid: number, data: FormData): Promise<Puesto> => {
  try {
    const response = await axios.put(`${API_URL}/${puestoid}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al actualizar el puesto');
  }
};

// Toggle puesto status (active/inactive)
export const toggleStatusPuesto = async (puestoid: number): Promise<Puesto> => {
  try {
    const response = await axios.patch(`${API_URL}/${puestoid}/toggle`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al cambiar el estatus del puesto');
  }
};