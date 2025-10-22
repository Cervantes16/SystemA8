import axios from 'axios';

interface Bodega {
  bodegaid: number;
  bodega: string;
  lugar: string;
  foranea: string;
  estatus: string;
}

interface FormData {
  bodegaid?: number;
  bodega: string;
  lugar: string;
  foranea: string;
  estatus: string;
}

const API_URL = 'http://localhost:3000/api/bodegas';

// Get all bodegas
export const getBodegas = async (): Promise<Bodega[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching bodegas:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a las bodegas.');
    } else {
      throw new Error('Error al obtener las bodegas. Intenta de nuevo.');
    }
  }
};

// Get a single bodega by ID
export const getBodegaById = async (id: number): Promise<Bodega> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching bodega with ID ${id}:`, error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a esta bodega.');
    } else if (error.response?.status === 404) {
      throw new Error('Bodega no encontrada.');
    } else {
      throw new Error('Error al obtener la bodega. Intenta de nuevo.');
    }
  }
};

// Create a new bodega
export const createBodega = async (data: FormData): Promise<Bodega> => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating bodega:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para crear bodegas.');
    } else {
      throw new Error('Error al crear la bodega. Intenta de nuevo.');
    }
  }
};

// Update an existing bodega
export const updateBodega = async (id: number, data: FormData): Promise<Bodega> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating bodega with ID ${id}:`, error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para modificar bodegas.');
    } else if (error.response?.status === 404) {
      throw new Error('Bodega no encontrada.');
    } else {
      throw new Error('Error al modificar la bodega. Intenta de nuevo.');
    }
  }
};

// Delete a bodega
export const deleteBodega = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    console.error(`Error deleting bodega with ID ${id}:`, error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para eliminar bodegas.');
    } else if (error.response?.status === 404) {
      throw new Error('Bodega no encontrada.');
    } else {
      throw new Error('Error al eliminar la bodega. Intenta de nuevo.');
    }
  }
};