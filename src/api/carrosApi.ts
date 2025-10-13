import axios from 'axios';

interface Carro {
  carroid: number;
  placas: string;
  marca: string;
  modelo: string;
  status: 'A' | 'I';
}

interface FormData {
  carroid?: number;
  placas: string;
  marca: string;
  modelo: string;
  status: 'A' | 'I';
}

const API_URL = 'http://localhost:3000/api/carros';

// Get all carros
export const getCarros = async (): Promise<Carro[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching carros:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a los carros.');
    } else {
      throw new Error('Error al obtener los carros. Intenta de nuevo.');
    }
  }
};

// Create a new carro
export const createCarro = async (data: FormData): Promise<Carro> => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating carro:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para crear carros.');
    } else {
      throw new Error('Error al crear el carro. Intenta de nuevo.');
    }
  }
};

// Update an existing carro
export const updateCarro = async (id: number, data: FormData): Promise<Carro> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error(`Error updating carro with ID ${id}:`, error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para modificar carros.');
    } else if (error.response?.status === 404) {
      throw new Error('Carro no encontrado.');
    } else {
      throw new Error('Error al modificar el carro. Intenta de nuevo.');
    }
  }
};

// Toggle carro status (A/I)
export const toggleCarroStatus = async (id: number): Promise<Carro> => {
  try {
    const response = await axios.put(`${API_URL}/${id}/status`);
    return response.data;
  } catch (error: any) {
    console.error(`Error toggling status for carro with ID ${id}:`, error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para cambiar el estado de carros.');
    } else if (error.response?.status === 404) {
      throw new Error('Carro no encontrado.');
    } else {
      throw new Error('Error al cambiar el estado del carro. Intenta de nuevo.');
    }
  }
};