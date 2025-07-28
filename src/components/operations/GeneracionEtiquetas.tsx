import React, { useState } from 'react';
import { Printer, BarChart3, RefreshCw, ArrowLeft, X } from 'lucide-react';

export default function GeneracionEtiquetas() {
  const [formData, setFormData] = useState({
    fechaEmpaque: '07/24/2025',
    diaJuliano: '205',
    lote: '1',
    numeroSubLote: '1',
    granja: '',
    numeroGranja: '0',
    talla: '',
    numeroTalla: '0',
    numeroCamarones: '1.00',
    presentacionKgs: '0.000',
    presentacionLbs: '0',
    producto: '',
    numeroProducto: '0',
    uniformidad: '0.000',
    conLogo: true,
    leyendasIngles: false,
    nombrePlanta: 'PLANTA LAS AGUILAS',
    zDesigner: 'ZDesigner ZD220-203dpi ZPL',
    consecutivo: '1',
    numeroCartones: '1',
    numeroEtiquetas: '1'
  });

  const [detalleEtiquetas] = useState([
    { id: 1, fecha: '07/24/2025', sLote: '1', talla: '41-50', cartones: 162 }
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrint = () => {
    console.log('Imprimiendo etiquetas:', formData);
    alert('Se imprimirán 1 Etiquetas, para un Total de 1 Cartones.');
  };

  return (
    <div className="flex-1 bg-white">
      <div className="border-b border-gray-200 bg-blue-50">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Proceso de Etiquetado</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex h-full">
        {/* Formulario Principal */}
        <div className="flex-1 p-6 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle Etiqueta</h3>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha (Empaque):</label>
                <input
                  type="date"
                  value="2025-07-24"
                  onChange={(e) => handleInputChange('fechaEmpaque', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día Juliano:</label>
                <input
                  type="text"
                  value={formData.diaJuliano}
                  onChange={(e) => handleInputChange('diaJuliano', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
                <input
                  type="text"
                  value={formData.lote}
                  onChange={(e) => handleInputChange('lote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número SubLote:</label>
                <input
                  type="text"
                  value={formData.numeroSubLote}
                  onChange={(e) => handleInputChange('numeroSubLote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Granja:</label>
                <div className="flex">
                  <select
                    value={formData.granja}
                    onChange={(e) => handleInputChange('granja', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="AGUILAS">AGUILAS</option>
                    <option value="SAN PEDRO">SAN PEDRO</option>
                  </select>
                  <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm">
                    # Granja: {formData.numeroGranja}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talla:</label>
                <div className="flex">
                  <select
                    value={formData.talla}
                    onChange={(e) => handleInputChange('talla', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="41-50">41-50</option>
                    <option value="51-60">51-60</option>
                    <option value="61-70">61-70</option>
                  </select>
                  <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm">
                    # Talla: {formData.numeroTalla}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"># Camarones:</label>
                <input
                  type="number"
                  value={formData.numeroCamarones}
                  onChange={(e) => handleInputChange('numeroCamarones', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presentación:</label>
                <div className="flex">
                  <input
                    type="number"
                    value={formData.presentacionKgs}
                    onChange={(e) => handleInputChange('presentacionKgs', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                    step="0.001"
                    placeholder="Kgs"
                  />
                  <span className="px-2 py-2 bg-gray-100 border border-l-0 border-r-0 border-gray-300 text-sm">Kgs /</span>
                  <input
                    type="number"
                    value={formData.presentacionLbs}
                    onChange={(e) => handleInputChange('presentacionLbs', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Lbs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto:</label>
                <div className="flex">
                  <select
                    value={formData.producto}
                    onChange={(e) => handleInputChange('producto', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="CAMARON">CAMARON</option>
                    <option value="LANGOSTINO">LANGOSTINO</option>
                  </select>
                  <div className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-sm">
                    # Producto: {formData.numeroProducto}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Uniformidad:</label>
                <input
                  type="number"
                  value={formData.uniformidad}
                  onChange={(e) => handleInputChange('uniformidad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  step="0.001"
                />
              </div>
              <div className="flex items-center space-x-4 pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.conLogo}
                    onChange={(e) => handleInputChange('conLogo', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Con Logo</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.leyendasIngles}
                    onChange={(e) => handleInputChange('leyendasIngles', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Leyendas en Inglés</span>
                </label>
              </div>
            </div>

            <div className="bg-yellow-100 p-4 rounded-md mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Configuración de Etiquetas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Planta:</label>
                  <input
                    type="text"
                    value={formData.nombrePlanta}
                    onChange={(e) => handleInputChange('nombrePlanta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <Printer className="w-8 h-8 text-gray-400 mr-2" />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formData.zDesigner}
                      onChange={(e) => handleInputChange('zDesigner', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-100 p-4 rounded-md text-center">
              <p className="text-red-800 font-medium">
                Se Imprimirán 1 Etiquetas, para un Total de 1 Cartones.
              </p>
            </div>
          </div>

          {/* Sección de Control */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consecutivo:</label>
                <input
                  type="text"
                  value={formData.consecutivo}
                  onChange={(e) => handleInputChange('consecutivo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"># Cartones:</label>
                <input
                  type="text"
                  value={formData.numeroCartones}
                  onChange={(e) => handleInputChange('numeroCartones', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"># Etiquetas:</label>
                <input
                  type="text"
                  value={formData.numeroEtiquetas}
                  onChange={(e) => handleInputChange('numeroEtiquetas', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handlePrint}
                className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 font-medium"
              >
                <Printer className="w-5 h-5" />
                Imprimir
              </button>
              <button className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2 font-medium">
                <RefreshCw className="w-5 h-5" />
                Refrescar
              </button>
              <button className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 flex items-center gap-2 font-medium">
                <ArrowLeft className="w-5 h-5" />
                Volver
              </button>
            </div>
          </div>

          <div className="text-center text-2xl font-bold text-gray-800 bg-gray-100 p-4 rounded-lg">
            "Control de Procesos y Salidas"
          </div>
        </div>

        {/* Panel Lateral Derecho */}
        <div className="w-80 border-l border-gray-200 bg-gray-50">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles</h3>
            
            {/* Tabla de Lotes */}
            <div className="mb-6">
              <div className="bg-blue-100 p-2 rounded-t-md">
                <div className="grid grid-cols-5 gap-1 text-xs font-medium text-gray-700">
                  <div>TALLA</div>
                  <div>S.LOTE</div>
                  <div>CANTIDAD</div>
                  <div>CARTONES</div>
                  <div>UNIF</div>
                </div>
              </div>
              <div className="bg-white border border-t-0 border-gray-200 rounded-b-md">
                {detalleEtiquetas.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-1 p-2 text-xs border-b border-gray-100 last:border-b-0">
                    <div>41-50</div>
                    <div>1</div>
                    <div>162.00</div>
                    <div>20.00</div>
                    <div>0.00</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información del Lote */}
            <div className="bg-white border border-gray-200 rounded-md p-3 mb-4">
              <h4 className="font-medium text-gray-900 mb-2 text-red-600">Lote:</h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-4 gap-1">
                  <div className="font-medium">ID</div>
                  <div className="font-medium">FECHA</div>
                  <div className="font-medium">S.LOTE</div>
                  <div className="font-medium">TALLA</div>
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <div>1</div>
                  <div>07/24/2025</div>
                  <div>1</div>
                  <div>41-50</div>
                </div>
              </div>
            </div>

            {/* Información del Lote Inferior */}
            <div className="bg-white border border-gray-200 rounded-md p-3">
              <h4 className="font-medium text-gray-900 mb-2 text-red-600">Lote:</h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">TALLA</div>
                  <div className="font-medium">CARTONES</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>41-50</div>
                  <div>162</div>
                </div>
              </div>
            </div>

            {/* Botón Generar Código */}
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Generar Código
              </button>
            </div>

            {/* Checkbox Metabisolfato */}
            <div className="mt-4">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Metabisolfato</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}