import React, { useState, useEffect } from 'react';
import { Printer, BarChart3, RefreshCw, ArrowLeft, X } from 'lucide-react';

export default function GeneracionEtiquetas() {
  const [formData, setFormData] = useState({
    fechaEmpaque: '2025-07-30',
    diaJuliano: '211',
    lote: '',
    sublote: '1',
    granja: '',
    talla: '',
    camarones: '',
    presentacionKgs: '',
    presentacionLbs: '',
    producto: '',
    uniformidad: '',
    metabisulfato: true,
    horaEmpaque: '22:30',
    nombrePlanta: 'PLANTA LAS AGUILAS',
    zDesigner: 'ZDesigner ZD220-203dpi ZPL',
    consecutivo: '1',
    numeroCartones: '1',
    numeroEtiquetas: '1',
  });

  const [detalleEtiquetas, setDetalleEtiquetas] = useState([
    { id: 1, fecha: '07/30/2025', sLote: '1', talla: '41-50', cartones: 162 },
  ]);

  // Función para calcular el Día Juliano
  const calcularDiaJuliano = (fecha: string) => {
    const date = new Date(fecha);
    const startOfYear = new Date(date.getFullYear(), 0, 0); // 0 para empezar desde el 1 de enero
    const diffInMs = date.getTime() - startOfYear.getTime();
    const diaJuliano = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
    return diaJuliano.toString().padStart(3, '0'); // Asegura 3 dígitos
  };

  // Simulación de consulta de datos por lote
  const consultarDetallesPorLote = (lote: string) => {
    if (lote) {
      const detallesMock = [
        { id: 1, fecha: formData.fechaEmpaque.split('-').reverse().join('/'), sLote: formData.sublote, talla: '41-50', cartones: 162 },
        { id: 2, fecha: formData.fechaEmpaque.split('-').reverse().join('/'), sLote: formData.sublote, talla: '51-60', cartones: 100 },
      ];
      setDetalleEtiquetas(detallesMock);
      setFormData((prev) => ({
        ...prev,
        granja: 'AGUILAS', // Ejemplo de datos cargados
        nombrePlanta: 'PLANTA LAS AGUILAS',
      }));
    }
  };

  // Actualizar Día Juliano y detalles al cambiar la fecha o lote
  useEffect(() => {
    if (formData.fechaEmpaque) {
      const diaJuliano = calcularDiaJuliano(formData.fechaEmpaque);
      setFormData((prev) => ({ ...prev, diaJuliano }));
    }
  }, [formData.fechaEmpaque]);

  useEffect(() => {
    if (formData.lote) {
      consultarDetallesPorLote(formData.lote);
    }
  }, [formData.lote, formData.sublote]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrint = () => {
    console.log('Imprimiendo etiquetas:', formData);
    alert(`Se imprimirán ${formData.numeroEtiquetas} Etiquetas, para un Total de ${formData.numeroCartones} Cartones.`);
  };

  return (
    <div className="flex-1 bg-gray-50 min-h-screen flex justify-center items-start p-4">
      <div className="max-w-7xl w-full bg-white shadow-xl rounded-xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-blue-600 text-white">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold">Proceso de Etiquetado</h2>
            <button className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Formulario Principal */}
          <div className="flex-1 p-6 space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generación de Etiquetas</h3>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha (Empaque):</label>
                  <input
                    type="date"
                    value={formData.fechaEmpaque}
                    onChange={(e) => handleInputChange('fechaEmpaque', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día Juliano:</label>
                  <input
                    type="text"
                    value={formData.diaJuliano}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sublote:</label>
                  <input
                    type="text"
                    value={formData.sublote}
                    onChange={(e) => handleInputChange('sublote', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Granja:</label>
                  <select
                    value={formData.granja}
                    onChange={(e) => handleInputChange('granja', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={!!formData.lote} // Deshabilitado si hay lote
                  >
                    <option value="">Seleccionar...</option>
                    <option value="AGUILAS">AGUILAS</option>
                    <option value="SAN PEDRO">SAN PEDRO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Talla:</label>
                  <select
                    value={formData.talla}
                    onChange={(e) => handleInputChange('talla', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="41-50">41-50</option>
                    <option value="51-60">51-60</option>
                    <option value="61-70">61-70</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1"># Camarones:</label>
                  <input
                    type="number"
                    value={formData.camarones}
                    onChange={(e) => handleInputChange('camarones', e.target.value)}
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

              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto:</label>
                  <select
                    value={formData.producto}
                    onChange={(e) => handleInputChange('producto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="CAMARON">CAMARON</option>
                    <option value="LANGOSTINO">LANGOSTINO</option>
                  </select>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora (Empaque):</label>
                  <input
                    type="time"
                    value={formData.horaEmpaque}
                    onChange={(e) => handleInputChange('horaEmpaque', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center space-x-4 pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.metabisulfato}
                      onChange={(e) => handleInputChange('metabisulfato', e.target.checked)}
                      className="mr-2"
                      defaultChecked
                    />
                    <span className="text-sm text-gray-700">Metabisulfato</span>
                  </label>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-md mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Configuración de Impresión</h4>
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

              <div className="bg-red-50 p-4 rounded-md text-center">
                <p className="text-red-800 font-medium">
                  Se Imprimirán {formData.numeroEtiquetas} Etiquetas, para un Total de {formData.numeroCartones} Cartones.
                </p>
              </div>
            </div>

            {/* Sección de Control */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-md">
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
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 font-medium"
                >
                  <Printer className="w-5 h-5" />
                  Imprimir
                </button>
                <button className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 font-medium">
                  <RefreshCw className="w-5 h-5" />
                  Refrescar
                </button>
                <button className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2 font-medium">
                  <ArrowLeft className="w-5 h-5" />
                  Volver
                </button>
              </div>
            </div>
          </div>

          {/* Panel Lateral Derecho */}
          <div className="w-[400px] border-l border-gray-200 bg-gray-50 p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles</h3>

            {/* Tabla de Sublotes */}
            <div className="mb-4">
              <div className="bg-blue-50 p-2 rounded-t-md">
                <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-700">
                  <div className="min-w-[60px] text-center truncate">TALLA</div>
                  <div className="min-w-[60px] text-center truncate">S.LOTE</div>
                  <div className="min-w-[60px] text-center truncate">CANTIDAD</div>
                  <div className="min-w-[60px] text-center truncate">CARTONES</div>
                  <div className="min-w-[60px] text-center truncate">UNIF</div>
                </div>
              </div>
              <div className="bg-white border border-t-0 border-gray-200 rounded-b-md">
                {detalleEtiquetas.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 p-2 text-sm border-b border-gray-100 last:border-b-0">
                    <div className="text-center truncate">{item.talla}</div>
                    <div className="text-center truncate">{item.sLote}</div>
                    <div className="text-center truncate">{item.cartones.toFixed(2)}</div>
                    <div className="text-center truncate">{item.cartones.toFixed(2)}</div>
                    <div className="text-center truncate">0.00</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Información del Lote */}
            <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2 text-red-600">Lote:</h4>
              <div className="space-y-1 text-sm">
                <div className="grid grid-cols-4 gap-2">
                  <div className="font-medium text-center">ID</div>
                  <div className="font-medium text-center">FECHA</div>
                  <div className="font-medium text-center">S.LOTE</div>
                  <div className="font-medium text-center">TALLA</div>
                </div>
                {detalleEtiquetas.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 text-sm">
                    <div className="text-center truncate">{item.id}</div>
                    <div className="text-center truncate">{item.fecha}</div>
                    <div className="text-center truncate">{item.sLote}</div>
                    <div className="text-center truncate">{item.talla}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Generar Código */}
            <div className="mt-4">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4" />
                Generar Código
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}