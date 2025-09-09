import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/proveedores';

export const getProveedores = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const createProveedor = async (data: any) => {
  const res = await axios.post(BASE_URL, data);
  return res.data;
};

export const updateProveedor = async (id: number, data: any) => {
  const res = await axios.put(`${BASE_URL}/${id}`, data);
  return res.data;
};

export const deleteProveedor = async (id: number) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data;
};
