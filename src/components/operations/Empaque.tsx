import React, { useState, useEffect } from 'react';
import { Plus, Edit, Printer, Trash2, Save, Search, X, Upload } from 'lucide-react';

interface EmpaqueItem {
  id: number;
  fecha: string;
  lote: string;
  kilogramos: number;
  cartones: number;
  granja: string;
  observaciones: string;
  subido: 'S' | 'N';
}

interface EmpaqueDetalle {
  id: number;
  empaqueId: number;
  idRecepcion: string;
  descripcion: string;
  estanque: number;
  talla: string;
  cartones: number;
  kgCarton: number;
  descabece: number;
  totalKg: number;
  ubicacion: string;
  camarones: number;
  subLote: string;
  codigo: string;
}

interface TallaDetalle {
  id: number;
  empaqueId: number;
  talla: string;
  kgs: number;
}

interface FormData {
  idEmpaque: string;
  fecha: string;
  recepcion: string;
  lote: string;
  subLote: string;
  talla: string;
  prod: string;
  estanque: number;
  cartones: number;
  kgXCarton: number;
  noCam: number;
  decabece: number;
  totalKg: number;
  ubicacion: string;
  observacion: string;
  barcode: string;
}

const initialEmpaques: EmpaqueItem[] = [
  {
    id: 1,
    fecha: '06/15/2021',
    lote: '1',
    kilogramos: 5000.00,
    cartones: 254.00,
    granja: 'AGUILAS',
    observaciones: 'SIN OBSERVACION',
    subido: 'N',
  },
];

const initialDetalleEmpaques: EmpaqueDetalle[] = [
  {
    id: 1,
    empaqueId: 1,
    idRecepcion: 'SICABEZA',
    descripcion: 'SICABEZA',
    estanque: 1,
    talla: '41-50',
    cartones: 162.00,
    kgCarton: 20.00,
    descabece: 0.00,
    totalKg: 3240.00,
    ubicacion: '',
    camarones: 42.00,
    subLote: '1',
    codigo: '000100001020011862021-2001',
  },
  {
    id: 2,
    empaqueId: 1,
    idRecepcion: 'SICABEZA',
    descripcion: 'SICABEZA',
    estanque: 1,
    talla: '91-110',
    cartones: 4.00,
    kgCarton: 20.00,
    descabece: 0.00,
    totalKg: 80.00,
    ubicacion: '',
    camarones: 91.00,
    subLote: '6',
    codigo: '000100006020019162021-2001',
  },
];

const initialTallasDetalle: TallaDetalle[] = [
  { id: 1, empaqueId: 1, talla: '41-50', kgs: 2.00 },
  { id: 2, empaqueId: 1, talla: '51-60', kgs: 0.80 },
  { id: 3, empaqueId: 1, talla: '61-70', kgs: 18.00 },
];

const Empaques: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [empaques, setEmpaques] = useState<EmpaqueItem[]>(initialEmpaques);
  const [detalleEmpaques, setDetalleEmpaques] = useState<EmpaqueDetalle[]>(initialDetalleEmpaques);
  const [tallasDetalle, setTallasDetalle] = useState<TallaDetalle[]>(initialTallasDetalle);
  const [formData, setFormData] = useState<FormData>({
    idEmpaque: '',
    fecha: new Date().toISOString().split('T')[0],
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
    observacion: 'SIN OBSERVACION',
    barcode: '',
  });
  const [currentEmpaqueId, setCurrentEmpaqueId] = useState<number | null>(null);
  const [kgsRecibidos, setKgsRecibidos] = useState(0);
  const [totalKgsCart, setTotalKgsCart] = useState(0);
  const [kgsSueltos, setKgsSueltos] = useState(0);
  const [rendimiento, setRendimiento] = useState(0);

  useEffect(() => {
    const filteredDetalles = currentEmpaqueId
      ? detalleEmpaques.filter(det => det.empaqueId === currentEmpaqueId)
      : detalleEmpaques;
    const filteredTallas = currentEmpaqueId
      ? tallasDetalle.filter(talla => talla.empaqueId === currentEmpaqueId)
      : tallasDetalle;
    const totalCart = filteredDetalles.reduce((sum, item) => sum + item.totalKg, 0);
    const totalSueltos = filteredTallas.reduce((sum, item) => sum + item.kgs, 0);
    setTotalKgsCart(totalCart);
    setKgsSueltos(totalSueltos);
    const totalProcessed = totalCart + totalSueltos;
    setRendimiento(kgsRecibidos > 0 ? (totalProcessed / kgsRecibidos) * 100 : 0);
  }, [detalleEmpaques, tallasDetalle, kgsRecibidos, currentEmpaqueId]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      totalKg: prev.cartones * prev.kgXCarton,
    }));
  }, [formData.cartones, formData.kgXCarton]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fecha || !formData.recepcion || !formData.lote || kgsRecibidos <= 0) {
      alert('Por favor, complete todos los campos requeridos: Fecha, Recepción, Lote, Kgs Recibidos.');
      return;
    }
    if (!/^\d+$/.test(formData.lote)) {
      alert('El lote debe ser un número entero.');
      return;
    }

    const newEmpaque: EmpaqueItem = {
      id: formData.idEmpaque ? parseInt(formData.idEmpaque) : empaques.length + 1,
      fecha: formData.fecha,
      lote: formData.lote,
      kilogramos: totalKgsCart + kgsSueltos,
      cartones: detalleEmpaques
        .filter(det => det.empaqueId === (formData.idEmpaque ? parseInt(formData.idEmpaque) : empaques.length + 1))
        .reduce((sum, item) => sum + item.cartones, 0),
      granja: formData.recepcion,
      observaciones: formData.observacion,
      subido: 'N',
    };

    if (formData.idEmpaque) {
      setEmpaques(empaques.map(emp => emp.id === parseInt(formData.idEmpaque) ? newEmpaque : emp));
    } else {
      setEmpaques([...empaques, newEmpaque]);
    }

    setShowForm(false);
    resetForm();
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBarcodeChange = (value: string) => {
    const match = value.match(/^0001(\d{3})(\d{2})(\d{2})(\d{4})(\d{4})-2001$/);
    if (match) {
      const [, subLote, , tallaStart, ,] = match;
      setFormData(prev => ({
        ...prev,
        barcode: value,
        subLote,
        talla: `${tallaStart}-${parseInt(tallaStart) + 9}`,
        prod: tallaStart <= '50' ? 'SICABEZA' : 'CONCABEZA',
      }));
    } else {
      setFormData(prev => ({ ...prev, barcode: value }));
    }
  };

  const handleAddDetalle = () => {
    if (!formData.subLote || !formData.talla || !formData.prod || formData.cartones <= 0 || formData.kgXCarton <= 0) {
      alert('Por favor, complete SubLote, Talla, Producto, Cartones y Kg X Carton.');
      return;
    }
    if (!/^\d+$/.test(formData.subLote)) {
      alert('El SubLote debe ser un número entero.');
      return;
    }

    const newDetalle: EmpaqueDetalle = {
      id: detalleEmpaques.length + 1,
      empaqueId: currentEmpaqueId || empaques.length + 1,
      idRecepcion: formData.prod,
      descripcion: formData.prod,
      estanque: formData.estanque,
      talla: formData.talla,
      cartones: formData.cartones,
      kgCarton: formData.kgXCarton,
      descabece: formData.decabece,
      totalKg: formData.cartones * formData.kgXCarton,
      ubicacion: formData.ubicacion,
      camarones: formData.noCam,
      subLote: formData.subLote,
      codigo: `0001${formData.subLote.padStart(3, '0')}020${formData.talla.replace('-', '')}2021-2001`,
    };

    setDetalleEmpaques([...detalleEmpaques, newDetalle]);
    resetDetalleForm();
  };

  const handleDeleteDetalle = (id: number) => {
    setDetalleEmpaques(detalleEmpaques.filter(det => det.id !== id));
  };

  const handleClearDetalle = () => {
    resetDetalleForm();
  };

  const handleAddTallaDetalle = () => {
    if (!formData.talla || formData.totalKg <= 0) {
      alert('Por favor, seleccione una Talla y especifique los Kilogramos Sueltos.');
      return;
    }

    const newTalla: TallaDetalle = {
      id: tallasDetalle.length + 1,
      empaqueId: currentEmpaqueId || empaques.length + 1,
      talla: formData.talla,
      kgs: formData.totalKg,
    };

    setTallasDetalle([...tallasDetalle, newTalla]);
    resetTallaForm();
  };

  const handleDeleteTalla = (id: number) => {
    setTallasDetalle(tallasDetalle.filter(talla => talla.id !== id));
  };

  const handleClearTallaDetalle = () => {
    resetTallaForm();
  };

  const handleModify = () => {
    if (selectedRow !== null) {
      const empaque = empaques[selectedRow];
      setFormData({
        idEmpaque: empaque.id.toString(),
        fecha: empaque.fecha,
        recepcion: empaque.granja,
        lote: empaque.lote,
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
        observacion: empaque.observaciones,
        barcode: '',
      });
      setCurrentEmpaqueId(empaque.id);
      setKgsRecibidos(empaque.kilogramos);
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedRow !== null) {
      const empaqueId = empaques[selectedRow].id;
      setEmpaques(empaques.filter((_, index) => index !== selectedRow));
      setDetalleEmpaques(detalleEmpaques.filter(det => det.empaqueId !== empaqueId));
      setTallasDetalle(tallasDetalle.filter(talla => talla.empaqueId !== empaqueId));
      setSelectedRow(null);
    }
  };

  const handleSubirNube = () => {
    if (selectedRow !== null) {
      setEmpaques(empaques.map((emp, index) =>
        index === selectedRow ? { ...emp, subido: 'S' } : emp
      ));
      alert('Empaque subido a la nube.');
    }
  };

  const handleImprimir = () => {
    console.log('Imprimiendo empaques:', empaques);
    alert('Imprimiendo lista de empaques.');
  };

  const handleImprimirConSalidas = () => {
    console.log('Imprimiendo empaques con salidas:', empaques, detalleEmpaques);
    alert('Imprimiendo empaques con salidas.');
  };

  const resetForm = () => {
    setFormData({
      idEmpaque: '',
      fecha: new Date().toISOString().split('T')[0],
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
      observacion: 'SIN OBSERVACION',
      barcode: '',
    });
    setCurrentEmpaqueId(null);
    setKgsRecibidos(0);
  };

  const resetDetalleForm = () => {
    setFormData(prev => ({
      ...prev,
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
      barcode: '',
    }));
  };

  const resetTallaForm = () => {
    setFormData(prev => ({
      ...prev,
      talla: '',
      totalKg: 0,
    }));
  };

  if (showForm) {
    const filteredDetalles = currentEmpaqueId
      ? detalleEmpaques.filter(det => det.empaqueId === currentEmpaqueId)
      : detalleEmpaques;
    const filteredTallas = currentEmpaqueId
      ? tallasDetalle.filter(talla => talla.empaqueId === currentEmpaqueId)
      : tallasDetalle;

    return (
      <div className="flex-1 bg-white flex flex-col min-h-screen">
        <div className="border-b border-gray-200 bg-blue-50 sticky top-0 z-10">
          <div className="flex items-center justify-between p-3">
            <h2 className="text-lg font-medium text-gray-900">
              {formData.idEmpaque ? 'Modificar Empaque' : 'Nuevo Empaque'}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Id Empaque:</label>
                <input
                  type="text"
                  value={formData.idEmpaque || (empaques.length + 1)}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Abrir Etiquetado (F3):</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleBarcodeChange(e.target.value)}
                  placeholder="Escanee código de barras"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kgs Recibidos:</label>
                <input
                  type="number"
                  value={kgsRecibidos}
                  onChange={(e) => setKgsRecibidos(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  step="0.0001"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recepción:</label>
                <div className="flex">
                  <select
                    value={formData.recepcion}
                    onChange={(e) => handleInputChange('recepcion', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="AGUILAS">AGUILAS</option>
                    <option value="EL SOL">EL SOL</option>
                  </select>
                  <button type="button" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lote:</label>
                <input
                  type="text"
                  value={formData.lote}
                  onChange={(e) => handleInputChange('lote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SubLote:</label>
                  <input
                    type="text"
                    value={formData.subLote}
                    onChange={(e) => handleInputChange('subLote', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
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
                      <option value="71-90">71-90</option>
                      <option value="91-110">91-110</option>
                    </select>
                    <button type="button" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prod:</label>
                  <div className="flex">
                    <select
                      value={formData.prod}
                      onChange={(e) => handleInputChange('prod', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="SICABEZA">SICABEZA</option>
                      <option value="CONCABEZA">CONCABEZA</option>
                    </select>
                    <button type="button" className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estanque:</label>
                  <input
                    type="number"
                    value={formData.estanque}
                    onChange={(e) => handleInputChange('estanque', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cartones:</label>
                  <input
                    type="number"
                    value={formData.cartones}
                    onChange={(e) => handleInputChange('cartones', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kg X Carton:</label>
                  <input
                    type="number"
                    value={formData.kgXCarton}
                    onChange={(e) => handleInputChange('kgXCarton', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No Cam:</label>
                  <input
                    type="number"
                    value={formData.noCam}
                    onChange={(e) => handleInputChange('noCam', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Decabece:</label>
                  <input
                    type="number"
                    value={formData.decabece}
                    onChange={(e) => handleInputChange('decabece', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    step="0.0001"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Kg:</label>
                  <input
                    type="number"
                    value={formData.totalKg.toFixed(4)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación:</label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2 flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleAddDetalle}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={handleClearDetalle}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Buscar x Etiquetas</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-blue-200">
                        <tr>
                          <th className="px-2 py-1 text-left hidden sm:table-cell">ESTANQUE</th>
                          <th className="px-2 py-1 text-left">DESC</th>
                          <th className="px-2 py-1 text-left">TALLA</th>
                          <th className="px-2 py-1 text-left hidden md:table-cell">CAMAR.</th>
                          <th className="px-2 py-1 text-left">CARTONES</th>
                          <th className="px-2 py-1 text-left hidden lg:table-cell">KGCART.</th>
                          <th className="px-2 py-1 text-left hidden lg:table-cell">DESCAB.</th>
                          <th className="px-2 py-1 text-left">TOTAL KG</th>
                          <th className="px-2 py-1 text-left hidden md:table-cell">UBICAC.</th>
                          <th className="px-2 py-1 text-left hidden sm:table-cell">SUBLOTE</th>
                          <th className="px-2 py-1 text-left hidden lg:table-cell">BARRAS</th>
                          <th className="px-2 py-1 text-left">ACCION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDetalles.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-2 py-1 hidden sm:table-cell">{item.estanque}</td>
                            <td className="px-2 py-1">{item.descripcion}</td>
                            <td className="px-2 py-1">{item.talla}</td>
                            <td className="px-2 py-1 hidden md:table-cell">{item.camarones.toFixed(2)}</td>
                            <td className="px-2 py-1">{item.cartones.toFixed(2)}</td>
                            <td className="px-2 py-1 hidden lg:table-cell">{item.kgCarton.toFixed(2)}</td>
                            <td className="px-2 py-1 hidden lg:table-cell">{item.descabece.toFixed(2)}</td>
                            <td className="px-2 py-1">{item.totalKg.toFixed(2)}</td>
                            <td className="px-2 py-1 hidden md:table-cell">{item.ubicacion}</td>
                            <td className="px-2 py-1 hidden sm:table-cell">{item.subLote}</td>
                            <td className="px-2 py-1 hidden lg:table-cell">{item.codigo}</td>
                            <td className="px-2 py-1">
                              <button
                                onClick={() => handleDeleteDetalle(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Detalle Kilogramos Sueltos</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-blue-200">
                        <tr>
                          <th className="px-2 py-1 text-left">TALLA</th>
                          <th className="px-2 py-1 text-left">KGS</th>
                          <th className="px-2 py-1 text-left">ACCION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTallas.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-2 py-1">{item.talla}</td>
                            <td className="px-2 py-1">{item.kgs.toFixed(2)}</td>
                            <td className="px-2 py-1">
                              <button
                                onClick={() => handleDeleteTalla(item.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddTallaDetalle}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={handleClearTallaDetalle}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3 inline mr-1" />
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Kgs Cart:</label>
                  <input
                    type="number"
                    value={totalKgsCart.toFixed(4)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kgs Sueltos:</label>
                  <input
                    type="number"
                    value={kgsSueltos.toFixed(4)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rendimiento:</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={rendimiento.toFixed(4)}
                      readOnly
                      className="flex-1 px-3 px-4 py-2 border border-gray-600 rounded-l-md bg-gray-100"
                    />
                    <span className="flex-1 px-3 py-2 bg-gray-200 border border-l-0 border-gray-600 rounded-r-md text-center">%</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observación:</label>
                <textarea
                  value={formData.observacion}
                  onChange={(e) => handleInputChange('observacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6">
          <div className="flex justify-end gap-2 max-w-7xl mx-auto">
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              Regresar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col min-h-screen">
      <div className="border-b border-gray-200 bg-blue-50 sticky top-0 z-10">
        <div className="flex items-center justify-between p-3">
          <h2 className="text-lg font-medium text-gray-900">Consulta de Empaques</h2>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 pb-3 flex-wrap">
          <button
            onClick={() => {
              setShowForm(true);
              resetForm();
            }}
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
            onClick={handleImprimir}
            className="flex items-center gap-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors text-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <button
            onClick={handleImprimirConSalidas}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Imprimir Con Salidas
          </button>
          <button
            onClick={handleSubirNube}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
          >
            <Upload className="w-4 h-4" />
            Subir Nube
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedRow === null}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-md transition-colors text-sm"
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

      <div className="flex-1 overflow-y-auto">
        <div className="max-h-[calc(100vh-200px)]">
          <table className="w-full table-auto">
            <thead className="sticky top-0 bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">FECHA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">LOTE</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24 sm:w-32">KILOGRAMOS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20 sm:w-24">CARTONES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:min-w-[120px]">GRANJA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">OBSERVACIONES</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16 sm:w-20">SUBIDO</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empaques.map((row, index) => (
                <tr
                  key={row.id}
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
                  <td className="px-4 py-3 text-sm text-gray-900 hidden md:table-cell">{row.observaciones}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.subido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Empaques;