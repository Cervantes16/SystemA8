import axios from 'axios';

const baseUrl = 'http://localhost:3000/api/propietarios';

export const getPropietarios = () => axios.get(baseUrl);
export const createPropietario = (data: any) => axios.post(baseUrl, data);
export const updatePropietario = (id: number, data: any) => axios.put(`${baseUrl}/${id}`, data);
export const deletePropietario = (id: number) => axios.delete(`${baseUrl}/${id}`);
