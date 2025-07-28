import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, Search, X } from 'lucide-react';

interface ClasificacionItem {
  id: number;
  fecha: string;
  lote: string;
  kilogramos: number;
  cartones: number;
  granja: string;
  observaciones: string;
  subido: string;
}

interface TallaDetalle {
  talla: string;
  kilogramos: number;
}

export default function Clasificacion() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('recepciones');
  const [formData, setFormData] = useState({
    idEmpaque: '929',
    fecha: '07/24/2025',
    recepcion: '',
    lote: '',
    subLote: '',
    talla: '',
    prod: '',
    estanque: 0,
    cartones: 0,
    kgXCarton: 0,
    noCam: 0,
    decabece: 0,
    totalKg: 0,
    ubicacion: '',
    observacion: 'SIN OBSERVACION'
  });

  const [clasificaciones] = useState<ClasificacionItem[]>([
    {
      id: 1,
      fecha: '06/15/2021',
      lote: '1',
      kilogramos: 5000.00,
      cartones: 254.00,
      granja: 'AGUILAS',
      observaciones: 'SIN OBSERVACION',
      subido: 'N'
    }
  ]);

  const [tallasDetalle] = useState<TallaDetalle[]>([
    { talla: 'U-15', kilogramos: 2.00 },
    { talla: '16-20', kilogramos: 0.80 },
    { talla: '21-25', kilogramos: 18.00 },
    { talla: '26-30', kilogramos: 15.00 },
    { talla: '31-35', kilogramos: 18.00 },
    { talla: '36-40', kilogramos: 1093.00 },
    { talla: '41-50', kilogramos: 5400.00 },
    { talla: '51-60', kilogramos: 561.00 },
    { talla: '61-70', kilogramos: 26.00 },
    { talla: '71-90', kilogramos: 120.00 }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Guardando clasificación:', formData);
    setShowForm(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">Clasificación "Conteo x Tallas" - Nuevo</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Id:</label>
              <input
                type="text"
                value="407"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
              <input
                type="date"
                value="2025-07-24"
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
              <input
                type="text"
                value="0"
                onChange={(e) => handleInputChange('lote', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capturo:</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talla:</label>
                <select
                  value={formData.talla}
                  onChange={(e) => handleInputChange('talla', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="U-15">U-15</option>
                  <option value="16-20">16-20</option>
                  <option value="21-25">21-25</option>
                  <option value="26-30">26-30</option>
                  <option value="31-35">31-35</option>
                  <option value="36-40">36-40</option>
                  <option value="41-50">41-50</option>
                  <option value="51-60">51-60</option>
                  <option value="61-70">61-70</option>
                  <option value="71-90">71-90</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilogramos:</label>
                <input
                  type="number"
                  value="0.0000"
                  step="0.0001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpiar
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="px-2 py-1 text-left">LOTE</th>
                    <th className="px-2 py-1 text-left">TALLA</th>
                    <th className="px-2 py-1 text-left">KGS</th>
                  </tr>
                </thead>
                <tbody>
                  {tallasDetalle.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-2 py-1">1</td>
                      <td className="px-2 py-1">{item.talla}</td>
                      <td className="px-2 py-1">{item.kilogramos.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 text-right font-medium">
                Total: 0.0000
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observación:</label>
            <textarea
              value={formData.observacion}
              onChange={(e) => handleInputChange('observacion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Clasificación</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('recepciones')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'recepciones' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Consulta de Recepciones
          </button>
          <button
            onClick={() => setActiveTab('clasificacion')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'clasificacion' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Consulta de Clasificación
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
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Modificar
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm">
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          
          <button
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm">
            Salir
          </button>
        </div>
      </div>
      
      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">FECHA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">LOTE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">KILOGRAMOS</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">CARTONES</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GRANJA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OBSERVACIONES</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">SUBIDO</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clasificaciones.map((row, index) => (
              <tr
                key={index}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.fecha}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.lote}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.kilogramos.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.cartones.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.granja}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.observaciones}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.subido}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRow !== null && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Detalle</h3>
          <div className="text-xs text-gray-600 mb-2">
            Drag a column header here to group by that column
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-2 py-1 text-left">TALLA</th>
                <th className="px-2 py-1 text-left">KILOGRAMOS</th>
              </tr>
            </thead>
            <tbody>
              {tallasDetalle.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-1">{item.talla}</td>
                  <td className="px-2 py-1">{item.kilogramos.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}