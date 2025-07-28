import React, { useState } from 'react';
import { Plus, Edit, Printer, Trash2, Save, Search, X } from 'lucide-react';

interface RecepcionItem {
  id: number;
  fisico: string;
  fecha: string;
  lote: string;
  ciclo: string;
  granja: string;
  propietario: string;
  totalKilos: number;
  subida: string;
}

interface RecepcionDetalle {
  estanque: number;
  taras: number;
  kgxTara: number;
  tKilogramos: number;
  basura: number;
  total: number;
  pPromedio: number;
}

export default function RecepcionProducto() {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detalleItems, setDetalleItems] = useState<RecepcionDetalle[]>([]);
  const [formData, setFormData] = useState({
    idRecepcion: '',
    folioFisico: '',
    lote: '',
    fecha: new Date().toISOString().split('T')[0],
    ciclos: '',
    propietario: '',
    granja: '',
    carro: '',
    chofer: '',
    taras: 0,
    kgxTara: 45.0000,
    kgBasura: 0,
    pPromedio: 0,
    estanque: '',
    totalKilos: 0.0000,
    observacion: 'SIN OBSERVACION',
    esMaquilla: false
  });

  const [recepciones] = useState<RecepcionItem[]>([
    {
      id: 253,
      fisico: '253',
      fecha: '05/14/2021',
      lote: '1',
      ciclo: '2021-1',
      granja: 'AGUILAS3',
      propietario: 'JOSE ALFREDO AGUILASOCHO',
      totalKilos: 6308.000,
      subida: 'N'
    },
    {
      id: 254,
      fisico: '254',
      fecha: '05/15/2021',
      lote: '1',
      ciclo: '2021-1',
      granja: 'AGUILAS3',
      propietario: 'ALFREDO AGUILASOCHO',
      totalKilos: 5456.000,
      subida: 'N'
    }
  ]);

  const [detalleRecepciones] = useState<RecepcionDetalle[]>([
    { estanque: 1, taras: 153.00, kgxTara: 45.00, tKilogramos: 6885.00, basura: 0.00, total: 6885.00 },
    { estanque: 1, taras: 1.00, kgxTara: 23.00, tKilogramos: 23.00, basura: 0.00, total: 23.00 }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Guardando recepción:', formData);
    setShowForm(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Calcular automáticamente el total de kilos cuando cambien taras o kgxTara
      if (field === 'taras' || field === 'kgxTara') {
        const taras = field === 'taras' ? parseFloat(value) || 0 : prev.taras;
        const kgxTara = field === 'kgxTara' ? parseFloat(value) || 0 : prev.kgxTara;
        newData.totalKilos = parseFloat((taras * kgxTara).toFixed(4));
      }
      
      return newData;
    });
  };

  const handleAgregarDetalle = () => {
    if (formData.estanque && formData.taras > 0 && formData.kgxTara > 0) {
      const nuevoDetalle: RecepcionDetalle = {
        estanque: parseInt(formData.estanque),
        taras: formData.taras,
        kgxTara: formData.kgxTara,
        tKilogramos: formData.totalKilos,
        basura: formData.kgBasura,
        total: formData.totalKilos - formData.kgBasura
      };
      
      setDetalleItems(prev => [...prev, nuevoDetalle]);
      
      // Limpiar campos del detalle
      setFormData(prev => ({
        ...prev,
        estanque: '',
        taras: 0,
        kgxTara: 45.0000,
        kgBasura: 0,
        totalKilos: 0.0000,
        pPromedio: 0
      }));
    }
  };

  const handleLimpiarDetalle = () => {
    setDetalleItems([]);
  };

  const getTotalGeneral = () => {
    return detalleItems.reduce((total, item) => total + item.total, 0);
  };

  if (showForm) {
    return (
      <div className="flex-1 bg-white">
        <div className="border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">Recepción de Producto - Nuevo</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Id Recepción:</label>
              <input
                type="text"
                value={formData.idRecepcion}
                onChange={(e) => handleInputChange('idRecepcion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="1019"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Folio Físico:</label>
              <input
                type="text"
                value={formData.folioFisico}
                onChange={(e) => handleInputChange('folioFisico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
              <input
                type="text"
                value={formData.lote}
                onChange={(e) => handleInputChange('lote', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.esMaquilla}
                onChange={(e) => handleInputChange('esMaquilla', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Es Maquilla</label>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ciclos:</label>
              <select
                value={formData.ciclos}
                onChange={(e) => handleInputChange('ciclos', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="2024-1">2024-1</option>
                <option value="2024-2">2024-2</option>
                <option value="2025-1">2025-1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
              <div className="flex">
                <select
                  value={formData.propietario}
                  onChange={(e) => handleInputChange('propietario', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="JOSE ALFREDO">JOSE ALFREDO AGUILASOCHO</option>
                  <option value="MARIA GONZALEZ">MARIA GONZALEZ</option>
                </select>
                <button type="button" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Granja:</label>
              <div className="flex">
                <select
                  value={formData.granja}
                  onChange={(e) => handleInputChange('granja', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="AGUILAS3">AGUILAS3</option>
                  <option value="SAN PEDRO">SAN PEDRO</option>
                </select>
                <button type="button" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carro:</label>
              <div className="flex">
                <select
                  value={formData.carro}
                  onChange={(e) => handleInputChange('carro', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="ABC-123">ABC-123</option>
                  <option value="DEF-456">DEF-456</option>
                </select>
                <button type="button" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chofer:</label>
              <div className="flex">
                <select
                  value={formData.chofer}
                  onChange={(e) => handleInputChange('chofer', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="CARLOS MENDOZA">CARLOS MENDOZA</option>
                  <option value="LUIS RODRIGUEZ">LUIS RODRIGUEZ</option>
                </select>
                <button type="button" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle</h3>
            <div className="grid grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taras:</label>
                <input
                  type="number"
                  value={formData.taras}
                  onChange={(e) => handleInputChange('taras', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KgXTara:</label>
                <input
                  type="number"
                  value={formData.kgxTara}
                  onChange={(e) => handleInputChange('kgxTara', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kg Basura:</label>
                <input
                  type="number"
                  value={formData.kgBasura}
                  onChange={(e) => handleInputChange('kgBasura', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">P.Promedio:</label>
                <input
                  type="number"
                  value={formData.pPromedio}
                  onChange={(e) => handleInputChange('pPromedio', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estanque:</label>
                <input
                  type="text"
                  value={formData.estanque}
                  onChange={(e) => handleInputChange('estanque', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Kilos:</label>
                <input
                  type="number"
                  value={formData.totalKilos}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  step="0.0001"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAgregarDetalle}
                type="button"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
              <button
                onClick={handleLimpiarDetalle}
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar
              </button>
            </div>
          </div>

          {/* Tabla de Detalle */}
          {detalleItems.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle de Recepciones</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="px-2 py-1 text-left">ESTANQUE</th>
                      <th className="px-2 py-1 text-left">TARAS</th>
                      <th className="px-2 py-1 text-left">KGXTARA</th>
                      <th className="px-2 py-1 text-left">TOTAL KG</th>
                      <th className="px-2 py-1 text-left">KG BASURA</th>
                      <th className="px-2 py-1 text-left">P. PROMEDIO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleItems.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1">{item.estanque}</td>
                        <td className="px-2 py-1">{item.taras.toFixed(4)}</td>
                        <td className="px-2 py-1">{item.kgxTara.toFixed(4)}</td>
                        <td className="px-2 py-1">{item.tKilogramos.toFixed(4)}</td>
                        <td className="px-2 py-1">{item.basura.toFixed(4)}</td>
                        <td className="px-2 py-1">0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-right font-medium">
                  Total: {getTotalGeneral().toFixed(4)}
                </div>
              </div>
            </div>
          )}

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
              Regresar
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
          <h2 className="text-lg font-medium text-gray-900">Consulta de Recepciones</h2>
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
          
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm">
            Subir Nube
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">FÍSICO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">FECHA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">LOTE</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">CICLO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GRANJA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PROPIETARIO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">TOTALKILOS</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">SUBIDA</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recepciones.map((row, index) => (
              <tr
                key={index}
                onClick={() => setSelectedRow(index)}
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRow === index ? 'bg-blue-100' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.fisico}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.fecha}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.lote}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.ciclo}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.granja}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.propietario}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.totalKilos.toFixed(3)}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{row.subida}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRow !== null && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Detalle</h3>
          <div className="text-xs text-gray-600">
            Drag a column header here to group by that column
          </div>
          <table className="w-full mt-2 text-sm">
            <thead>
              <tr className="bg-blue-100">
                <th className="px-2 py-1 text-left">ESTANQUE</th>
                <th className="px-2 py-1 text-left">TARAS</th>
                <th className="px-2 py-1 text-left">KGXTARA</th>
                <th className="px-2 py-1 text-left">T. KILOGRAMOS</th>
                <th className="px-2 py-1 text-left">BASURA</th>
                <th className="px-2 py-1 text-left">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {detalleRecepciones.map((detalle, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-1">{detalle.estanque}</td>
                  <td className="px-2 py-1">{detalle.taras.toFixed(2)}</td>
                  <td className="px-2 py-1">{detalle.kgxTara.toFixed(2)}</td>
                  <td className="px-2 py-1">{detalle.tKilogramos.toFixed(2)}</td>
                  <td className="px-2 py-1">{detalle.basura.toFixed(2)}</td>
                  <td className="px-2 py-1">{detalle.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}