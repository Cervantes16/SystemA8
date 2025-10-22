import axios from 'axios';

interface Ciclo {
  cicloid: number;
  año: string;
  ciclo: string;
  status: string;
}

interface Bodega {
  bodegaid: number;
  bodega: string;
  lugar: string;
  foranea: string;
  estatus: string;
}

interface Ubicacion {
  ubicacionid: number;
  bodegaid: number;
  bahia: string;
  seccion: string;
  piso: string;
  fondo: string;
  codigoubicacion: string;
  qrubicacion: string;
  tarimaid: number | null;
  estado: string;
  ultimamod: string;
}

interface Recepcion {
  recepcionid: number;
  foliofisico: string;
  lote: number;
  fecha: string;
  granjaid: number;
  taras: string;
  totalkilogramos: string;
  carroid: number;
  choferid: number;
  observacion: string;
  propietarioid: number;
  cicloid: number;
  procesada: string;
  maquila: string;
  subida: string;
  status: string;
}

interface Granja {
  granjaid: number;
  granja: string;
  propietarioid: number;
}

interface Talla {
  tallaid: number;
  talla: string;
  ccabeza: string;
}

interface DetalleEtiqueta {
  id: number;
  fecha: string;
  diajuliano: string;
  slote: string;
  cicloid: number;
  tallaid: number;
  talla: string;
  cartones: number;
  kgs: number;
  producto: string;
}

const API_URL = 'http://localhost:3000/api';

export const getCiclos = async (): Promise<Ciclo[]> => {
  try {
    const response = await axios.get(`${API_URL}/ciclos`);
    return response.data
      .filter((c: Ciclo) => c.status === 'A' && c.cicloid != null && !isNaN(Number(c.cicloid)))
      .map((c: Ciclo) => ({ ...c, cicloid: Number(c.cicloid) }));
  } catch (error: any) {
    console.error('Error fetching ciclos:', error);
    throw handleApiError(error, 'ciclos');
  }
};

export const getBodegas = async (): Promise<Bodega[]> => {
  try {
    const response = await axios.get(`${API_URL}/bodegas`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching bodegas:', error);
    throw handleApiError(error, 'bodegas');
  }
};

export const getUbicaciones = async (): Promise<Ubicacion[]> => {
  try {
    const response = await axios.get(`${API_URL}/ubicaciones`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ubicaciones:', error);
    throw handleApiError(error, 'ubicaciones');
  }
};

export const getGranjas = async (): Promise<Granja[]> => {
  try {
    const response = await axios.get(`${API_URL}/granjas`);
    return response.data
      .filter((g: Granja) => g.granjaid != null && !isNaN(Number(g.granjaid)))
      .map((g: Granja) => ({ ...g, granjaid: Number(g.granjaid) }));
  } catch (error: any) {
    console.error('Error fetching granjas:', error);
    throw handleApiError(error, 'granjas');
  }
};

export const getTallas = async (): Promise<Talla[]> => {
  try {
    const response = await axios.get(`${API_URL}/tallas/active`);
    return response.data
      .filter((t: Talla) => t.tallaid != null && !isNaN(Number(t.tallaid)))
      .map((t: Talla) => ({ ...t, tallaid: Number(t.tallaid) }));
  } catch (error: any) {
    console.error('Error fetching tallas:', error);
    throw handleApiError(error, 'tallas');
  }
};

export const getRecepciones = async (cicloid: number, lote: string): Promise<Recepcion[]> => {
  try {
    const response = await axios.get(`${API_URL}/recepcion/g/${cicloid}/${lote}`);
    return response.data.filter(
      (r: Recepcion) => r.status === 'A' && r.granjaid != null && !isNaN(Number(r.granjaid))
    );
  } catch (error: any) {
    console.error('Error fetching recepciones:', error);
    throw handleApiError(error, 'recepciones');
  }
};

export const getDetalleEtiquetas = async (cicloid: number, lote: string): Promise<DetalleEtiqueta[]> => {
  try {
    const response = await axios.get(`${API_URL}/empaque/${cicloid}/${lote}`);
    return response.data.map((d: DetalleEtiqueta) => {
        const date = new Date(d.fecha);
        const fechaFormateada = date.toLocaleDateString('es-ES', {
          timeZone: 'America/Mazatlan',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        return {
        ...d,
          fecha: fechaFormateada,
        };
      });
  } catch (error: any) {
    console.error('Error fetching detalle etiquetas:', error);
    throw handleApiError(error, 'etiquetas');
  }
};

export const getBarcodes = async (cicloid: number, lote: string): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/empaque/barcode/${cicloid}/${lote}`);
    if (Array.isArray(response.data)) {
      return response.data.map((item: { barras: string }) => item.barras);
    }
    return [];
  } catch (error: any) {
    console.error('Error fetching barcodes:', error);
    throw handleApiError(error, 'códigos de barras');
  }
};

export const createEtiquetas = async (payload: any): Promise<{
  detalleEtiquetas: DetalleEtiqueta[];
  barcodes: string[];
  message?: string;
  warning?: string;
}> => {
  try {
    const response = await axios.post(`${API_URL}/empaque`, payload);
    return {
      detalleEtiquetas: response.data.detalleEtiquetas || [],
      barcodes: response.data.barcodes || [],
      message: response.data.message,
      warning: response.data.warning,
    };
  } catch (error: any) {
    console.error('Error creating etiquetas:', error);
    throw handleApiError(error, 'crear etiquetas');
  }
};

export const deleteCajaPorBarcode = async (
  codigobarras: string,
  motivo: string,
  usuario: number
): Promise<string> => {
  try {
    const response = await axios.post(`${API_URL}/empaque/delete-caja`, {
      codigobarras,
      motivo,
      usuario,
    });
    return response.data.message;
  } catch (error: any) {
    console.error('Error eliminando caja:', error);
    throw handleApiError(error, 'eliminar caja');
  }
};

// ========================
// 🆕 NUEVA FUNCIÓN: Consultar bitácora
// ========================
export const getBitacora = async (
  desde?: string,
  hasta?: string,
  usuario?: number
): Promise<any[]> => {
  try {
    const params: any = {};
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    if (usuario) params.usuario = usuario;

    const response = await axios.get(`${API_URL}/bitacora`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching bitacora:', error);
    throw handleApiError(error, 'bitácora de movimientos');
  }
};

// ========================
// 🔧 Helper para errores
// ========================
const handleApiError = (error: any, recurso: string): Error => {
  if (error.response?.status === 401)
    return new Error(`Sesión no autorizada. Por favor, inicia sesión nuevamente.`);
  if (error.response?.status === 403)
    return new Error(`No tienes permiso para acceder a ${recurso}.`);
  if (error.response?.status === 404)
    return new Error(`No se encontraron datos de ${recurso}.`);
  return new Error(`Error al obtener ${recurso}. Intenta de nuevo.`);
};
