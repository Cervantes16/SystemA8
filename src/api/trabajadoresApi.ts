import axios from 'axios';

const API_URL = '/api/trabajadores'; // Adjust this base URL as per your backend configuration

interface Trabajador {
  trabajadorid: number;
  notrabajador: string;
  nombre: string;
  domicilio: string;
  telefono: string;
  correo: string;
  sueldo: number;
  estatus: number;
  puesto: string;
  fotografia: string | null;
}

interface FormData {
  notrabajador: string;
  puestoid: number;
  nombre: string;
  domicilio: string;
  telefono: string;
  correo: string;
  sueldo: number;
  estatus: number;
  fotografia?: File | null;
}

// Get all trabajadores
export const getTrabajadores = async (): Promise<Trabajador[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener los trabajadores');
  }
};

// Get a single trabajador by notrabajador
export const getTrabajador = async (notrabajador: string): Promise<Trabajador> => {
  try {
    const response = await axios.get(`${API_URL}/${notrabajador}`);
    return response.data[0]; // Assuming the backend returns an array with one item
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener el trabajador');
  }
};

// Create a new trabajador
export const createTrabajador = async (data: FormData): Promise<Trabajador> => {
  try {
    const formData = new FormData();
    formData.append('notrabajador', data.notrabajador);
    formData.append('puestoid', data.puestoid.toString());
    formData.append('nombre', data.nombre);
    formData.append('domicilio', data.domicilio);
    formData.append('telefono', data.telefono);
    formData.append('correo', data.correo);
    formData.append('sueldo', data.sueldo.toString());
    formData.append('estatus', data.estatus.toString());
    if (data.fotografia) {
      formData.append('fotografia', data.fotografia);
    }

    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al crear el trabajador');
  }
};

// Update an existing trabajador
export const updateTrabajador = async (trabajadorid: number, data: FormData): Promise<Trabajador> => {
  try {
    const formData = new FormData();
    formData.append('notrabajador', data.notrabajador);
    formData.append('puestoid', data.puestoid.toString());
    formData.append('nombre', data.nombre);
    formData.append('domicilio', data.domicilio);
    formData.append('telefono', data.telefono);
    formData.append('correo', data.correo);
    formData.append('sueldo', data.sueldo.toString());
    formData.append('estatus', data.estatus.toString());
    if (data.fotografia) {
      formData.append('fotografia', data.fotografia);
    }

    const response = await axios.put(`${API_URL}/${trabajadorid}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al actualizar el trabajador');
  }
};

// Toggle trabajador status (active/inactive)
export const toggleStatusTrabajador = async (trabajadorid: number): Promise<Trabajador> => {
  try {
    const response = await axios.patch(`${API_URL}/${trabajadorid}/toggle`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al cambiar el estatus del trabajador');
  }
};