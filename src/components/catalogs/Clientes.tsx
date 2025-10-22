// Clientes.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Cliente {
  clienteid: number;
  cliente: string;
  rfc: string;
  domicilio: string;
  telefono: string;
  status: 'A' | 'I';
}

interface FormData {
  clienteid?: number;
  cliente: string;
  rfc: string;
  domicilio: string;
  telefono: string;
  status: 'A' | 'I';
}

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    cliente: '',
    rfc: '',
    domicilio: '',
    telefono: '',
    status: 'A',
  });

  // Cargar clientes desde la API
  const fetchClientes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/clientes');
      setClientes(res.data.filter((c: Cliente) => c.status === 'A'));
    } catch (err) {
      console.error(err);
      toast.error('Error al obtener clientes');
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.clienteid) {
        // Modificar cliente existente
        await axios.put(`http://localhost:3000/api/clientes/${formData.clienteid}`, formData);
        toast.success('Cliente actualizado');
      } else {
        // Crear nuevo cliente
        await axios.post('http://localhost:3000/api/clientes', formData);
        toast.success('Cliente creado');
      }
      setShowForm(false);
      setFormData({ cliente: '', rfc: '', domicilio: '', telefono: '', status: 'A' });
      fetchClientes();
      setSelectedRow(null);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar cliente');
    }
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const cliente = clientes[selectedRow];
      setFormData({ ...cliente });
      setShowForm(true);
    }
  };

  const handleDelete = async () => {
    if (selectedRow !== null) {
      const cliente = clientes[selectedRow];
      try {
        await axios.delete(`http://localhost:3000/api/clientes/${cliente.clienteid}`);
        toast.success('Cliente eliminado');
        fetchClientes();
        setSelectedRow(null);
      } catch (err) {
        console.error(err);
        toast.error('Error al eliminar cliente');
      }
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white p-6">
        <div className="border-b border-gray-200 bg-blue-50 flex justify-between items-center p-3">
          <h2 className="text-lg font-medium text-gray-900">
            {formData.clienteid ? 'Modificar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={formData.cliente}
                onChange={e => handleInputChange('cliente', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">RFC</label>
              <input
                type="text"
                value={formData.rfc}
                onChange={e => handleInputChange('rfc', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Domicilio</label>
              <input
                type="text"
                value={formData.domicilio}
                onChange={e => handleInputChange('domicilio', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={e => handleInputChange('telefono', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white p-6">
      <div className="border-b border-gray-200 bg-blue-50 flex justify-between items-center p-3">
        <h2 className="text-lg font-medium text-gray-900">Consulta de Clientes</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 py-3">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
        <button
          onClick={handleModify}
          disabled={selectedRow === null}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md"
        >
          <Edit className="w-4 h-4" /> Modificar
        </button>
        <button
          onClick={handleDelete}
          disabled={selectedRow === null}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md"
        >
          <Trash2 className="w-4 h-4" /> Eliminar
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Nombre</th>
              <th className="px-4 py-2 text-left text-sm font-medium">RFC</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Domicilio</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => (
              <tr
                key={cliente.clienteid}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-2">{cliente.clienteid}</td>
                <td className="px-4 py-2">{cliente.cliente}</td>
                <td className="px-4 py-2">{cliente.rfc}</td>
                <td className="px-4 py-2">{cliente.domicilio}</td>
                <td className="px-4 py-2">{cliente.telefono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Clientes;
