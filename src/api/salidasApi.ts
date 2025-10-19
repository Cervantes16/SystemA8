import axios from 'axios';

const API_URL = '/api/salidas'; // Consistent with empaqueApi.ts

interface Cliente {
  clienteid: number;
  cliente: string; // Changed from 'nombre' to match backend data
}

interface Talla {
  tallaid: number;
  talla: string;
}

interface Caja {
  cajaid: number;
  barcode: string;
  lote: string;
  propietario: string;
  tallaid: number;
  granja: string;
  fechaEntrada: string;
  posicion: string;
}

interface SalidaFormData {
  clienteid: number;
  cajas: { cajaid: number; barcode: string; tallaid: number; lote: string; granja: string; propietario: string }[];
}

export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching clientes:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener los clientes. Intenta de nuevo.');
  }
};

export const getTallasDisponibles = async (): Promise<Talla[]> => {
  try {
    const response = await axios.get(`${API_URL}/tallas-disponibles`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tallas disponibles:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener las tallas disponibles. Intenta de nuevo.');
  }
};

export const getCajasPorTalla = async (tallaid: number): Promise<Caja[]> => {
  try {
    const response = await axios.get(`${API_URL}/cajas/talla/${tallaid}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cajas por talla:', error);
    throw new Error(error.response?.data?.error || 'Error al obtener las cajas por talla. Intenta de nuevo.');
  }
};

export const createSalida = async (data: SalidaFormData): Promise<void> => {
  try {
    await axios.post(`${API_URL}/salidas`, data);
  } catch (error: any) {
    console.error('Error creating salida:', error);
    throw new Error(error.response?.data?.error || 'Error al registrar la salida. Intenta de nuevo.');
  }
};