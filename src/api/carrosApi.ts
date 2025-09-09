const API_URL = "http://localhost:3000/api/carros"; // Ajusta si tu endpoint es diferente

// -------------------- Consultas --------------------

// Obtener todos los carros
export const getCarros = async () => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) throw new Error('Error al obtener carros');
  return res.json();
};

// Obtener carro por ID
export const getCarroById = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) throw new Error('Error al obtener carro');
  return res.json();
};

// -------------------- Creación / Modificación --------------------

// Crear carro
export const createCarro = async (data: {
  placas: string;
  marca: string;
  modelo: string;
  status: 'A' | 'I';
}) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al crear carro');
  return res.json();
};

// Modificar carro
export const updateCarro = async (id: number, data: {
  placas: string;
  marca: string;
  modelo: string;
  status: 'A' | 'I';
}) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al actualizar carro');
  return res.json();
};

// -------------------- Estado --------------------

// Alternar estado Activo/Inactivo
export const toggleCarroStatus = async (idcarro: number) => {
  const res = await fetch(`${API_URL}/${idcarro}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!res.ok) throw new Error('Error al cambiar estado del carro');
  return res.json();
};

// Marcar carro como inactivo (no eliminar)
export const markCarroInactive = async (idcarro: number) => {
  const carro = await getCarroById(idcarro);
  return await updateCarro(idcarro, { ...carro, status: 'I' });
};
