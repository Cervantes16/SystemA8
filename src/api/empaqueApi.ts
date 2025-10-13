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
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a los ciclos.');
    } else {
      throw new Error('Error al obtener los ciclos. Intenta de nuevo.');
    }
  }
};

export const getBodegas = async (): Promise<Bodega[]> => {
  try {
    const response = await axios.get(`${API_URL}/bodegas`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching bodegas:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a las bodegas.');
    } else {
      throw new Error('Error al obtener las bodegas. Intenta de nuevo.');
    }
  }
};

export const getUbicaciones = async (): Promise<Ubicacion[]> => {
  try {
    const response = await axios.get(`${API_URL}/ubicaciones`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ubicaciones:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a las ubicaciones.');
    } else {
      throw new Error('Error al obtener las ubicaciones. Intenta de nuevo.');
    }
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
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a las granjas.');
    } else {
      throw new Error('Error al obtener las granjas. Intenta de nuevo.');
    }
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
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a las tallas.');
    } else {
      throw new Error('Error al obtener las tallas. Intenta de nuevo.');
    }
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
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a las recepciones.');
    } else if (error.response?.status === 404) {
      throw new Error('No se encontraron recepciones para el ciclo y lote seleccionados.');
    } else {
      throw new Error('Error al obtener las recepciones. Intenta de nuevo.');
    }
  }
};

export const getDetalleEtiquetas = async (cicloid: number, lote: string): Promise<DetalleEtiqueta[]> => {
  try {
    const response = await axios.get(`${API_URL}/empaque/${cicloid}/${lote}`);
    return response.data
      .filter(
        (d: DetalleEtiqueta) =>
          d.id != null &&
          d.fecha &&
          d.diajuliano != null &&
          d.slote &&
          d.cicloid != null &&
          d.tallaid != null &&
          d.talla &&
          d.cartones != null &&
          d.kgs != null &&
          d.producto
      )
      .map((d: DetalleEtiqueta) => {
        const date = new Date(d.fecha);
        const fechaFormateada = date.toLocaleDateString('es-ES', {
          timeZone: 'America/Mazatlan',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        return {
          id: Number(d.id),
          fecha: fechaFormateada,
          diajuliano: String(d.diajuliano),
          slote: String(d.slote),
          cicloid: Number(d.cicloid),
          tallaid: Number(d.tallaid),
          talla: d.talla,
          cartones: Number(d.cartones),
          kgs: Number(d.kgs),
          producto: d.producto,
        };
      });
  } catch (error: any) {
    console.error('Error fetching detalle etiquetas:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a las etiquetas.');
    } else if (error.response?.status === 404) {
      throw new Error('No se encontraron registros para el ciclo y lote seleccionados.');
    } else {
      throw new Error('Error al obtener las etiquetas. Intenta de nuevo.');
    }
  }
};

export const getBarcodes = async (cicloid: number, lote: string): Promise<string[]> => {
  try {
    const response = await axios.get(`${API_URL}/empaque/barcode/${cicloid}/${lote}`);
    let barcodes: string[];
    if (Array.isArray(response.data)) {
      barcodes = response.data.map((item: { barras: string }) => item.barras);
    } else if (response.data && typeof response.data === 'object' && 'barras' in response.data) {
      barcodes = [response.data.barras];
    } else {
      barcodes = [];
      console.warn('Unexpected barcode response format:', response.data);
    }
    return barcodes;
  } catch (error: any) {
    console.error('Error fetching barcodes:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para acceder a los códigos de barras.');
    } else if (error.response?.status === 404) {
      throw new Error('No se encontraron códigos de barras para el ciclo y lote seleccionados.');
    } else {
      throw new Error('Error al obtener los códigos de barras. Intenta de nuevo.');
    }
  }
};

export const createEtiquetas = async (payload: {
  Etiquetas: Array<{
    folio: string;
    detalleid: string;
    Planta: string;
    Granja: string;
    Granjaid: string;
    TipoCamarón: string;
    Talla: string;
    Tallaid: string;
    Lote: string;
    Empaque: string;
    DiaJuliano: string;
    LoteId: string;
    CicloId: number;
    C_Antes_De: string;
    Peso: string;
    Hora: string;
    Camarones: string | null;
    Uniformidad: string;
    Metabisulfito: string;
    Bodega: string;
    Posicion: string;
    Tarima: string;
    LeyendaAlergias: string;
    LeyendaAlimentaria: string;
    Barras: string;
    QRContent: string;
  }>;
  configuracion: { impresora: string };
}): Promise<void> => {
  try {
    await axios.post(`${API_URL}/empaque`, payload);
  } catch (error: any) {
    console.error('Error creating etiquetas:', error);
    if (error.response?.status === 401) {
      throw new Error('Sesión no autorizada. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permiso para crear etiquetas.');
    } else {
      throw new Error('Error al crear las etiquetas. Intenta de nuevo.');
    }
  }
};