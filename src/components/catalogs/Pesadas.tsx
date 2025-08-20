import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, X } from 'lucide-react';

interface Pesada {
  id: number;
  fecha: string;
  hora: string;
  noIdentificacion: string;
  empleado: string;
  kilos: number;
  precio: number;
  total: number;
  lote: number;
}

interface FormData {
  id: string;
  fecha: string;
  hora: string;
  noIdentificacion: string;
  empleado: string;
  kilos: number;
  precio: number;
  total: number;
  lote: number;
}

const mockPesadas: Pesada[] = [
  {
    id: 1,
    fecha: '2025-08-17',
    hora: '14:30',
    noIdentificacion: 'P001',
    empleado: 'Juan Pérez',
    kilos: 100.50,
    precio: 2.50,
    total: 251.25,
    lote: 1
  },
  {
    id: 2,
    fecha: '2025-08-16',
    hora: '09:15',
    noIdentificacion: 'P002',
    empleado: 'María García',
    kilos: 150.75,
    precio: 2.30,
    total: 346.73,
    lote: 2
  }
];

const Pesadas: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    fecha: '',
    hora: '',
    noIdentificacion: '',
    empleado: '',
    kilos: 0,
    precio: 0,
    total: 0,
    lote: 0
  });
  const [pesadas, setPesadas] = useState<Pesada[]>(mockPesadas);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = formData.kilos * formData.precio;
    const newPesada = {
      ...formData,
      total,
      id: formData.id ? parseInt(formData.id) : (pesadas.length > 0 ? Math.max(...pesadas.map(p => p.id)) + 1 : 1)
    };
    
    if (formData.id) {
      // Update existing pesada
      setPesadas(pesadas.map(p => p.id === parseInt(formData.id) ? newPesada : p));
    } else {
      // Add new pesada
      setPesadas([...pesadas, newPesada]);
    }
    setShowForm(false);
    setFormData({ id: '', fecha: '', hora: '', noIdentificacion: '', empleado: '', kilos: 0, precio: 0, total: 0, lote: 0 });
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'kilos' || field === 'precio') {
        newData.total = newData.kilos * newData.precio;
      }
      return newData;
    });
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const pesada = pesadas[selectedRow];
      setFormData({
        id: pesada.id.toString(),
        fecha: pesada.fecha,
        hora: pesada.hora,
        noIdentificacion: pesada.noIdentificacion,
        empleado: pesada.empleado,
        kilos: pesada.kilos,
        precio: pesada.precio,
        total: pesada.total,
        lote: pesada.lote
      });
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      setPesadas(pesadas.filter((_, index) => index !== selectedRow));
      setSelectedRow(null);
    }
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.id ? 'Modificar Pesada' : 'Nueva Pesada'}
            </h2>
            <button 
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID:</label>
              <input
                type="text"
                value={formData.id || (pesadas.length + 1)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora:</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => handleInputChange('hora', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Identificación:</label>
              <input
                type="text"
                value={formData.noIdentificacion}
                onChange={(e) => handleInputChange('noIdentificacion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empleado:</label>
              <input
                type="text"
                value={formData.empleado}
                onChange={(e) => handleInputChange('empleado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilos:</label>
              <input
                type="number"
                value={formData.kilos}
                onChange={(e) => handleInputChange('kilos', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio:</label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => handleInputChange('precio', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total:</label>
              <input
                type="number"
                value={formData.total}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
              <input
                type="number"
                value={formData.lote}
                onChange={(e) => handleInputChange('lote', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
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
              Volver
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Pesadas</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo
          </button>
          <button
            onClick={handleModify}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Modificar
          </button>
          <button
            onClick={() => console.log('Imprimir pesadas')}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            Salir
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FECHA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HORA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO. IDENTIFICACIÓN</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMPLEADO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">KILOS</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">PRECIO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">TOTAL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">LOTE</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pesadas.map((pesada, index) => (
              <tr
                key={pesada.id}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.fecha}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.hora}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.noIdentificacion}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.empleado}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.kilos.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.precio.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{pesada.lote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pesadas;