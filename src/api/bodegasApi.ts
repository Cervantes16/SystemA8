const API_URL = 'http://localhost:3000/api/bodegas'; // ajusta si tu puerto es otro

export const getBodegas = async () => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.json();
};

export const getBodegaById = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.json();
};

export const createBodega = async (data: any) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateBodega = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteBodega = async (id: number) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  return res.json();
};
